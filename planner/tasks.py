from __future__ import absolute_import

import datetime
import json
import math
import os
import pytz
import re
from StringIO import StringIO
import uuid
import zipfile

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage, FileSystemStorage
from django.db.models import Max, Min
from django.utils.dateparse import parse_datetime
from decimal import Decimal
from celery import shared_task
from celery.utils.log import get_task_logger
from csv import DictReader
from lxml import etree

from pymavlink import mavextra, mavutil, DFReader
from pyulog.core import ULog

from .models import Vehicle, FlightPlan, WaypointMetadata, Waypoint, TelemetryMetadata, Telemetry

# Common functions

logger = get_task_logger(__name__)

def unique_filename(original_name):
    """ Generate a unique filename based on the original name
    """
    return '%s.%s' % (uuid.uuid4(), original_name.split('.')[-1])

KML_NS = {"kml":"http://www.opengis.net/kml/2.2"}

def kml_parse(file_path):
    """ Parse KML and KMZ files and return an object of data.
        Useful for both waypoints and telemetry.
    """
    if zipfile.is_zipfile(file_path):
        kmz = zipfile.ZipFile(file_path, 'r')
        # find first KML and use that one (this is what Google Earth does)
        for filename in kmz.namelist():
            # ignore MACOSX metadata files
            if filename.startswith('._') or filename.startswith('__'):
                continue
            if os.path.splitext(filename)[1] == '.kml':
                logger.info('KMZ picking first KML: %s' % (filename))
                with kmz.open(filename, 'r') as kml_inside:
                    kml = kml_inside.read()
                break
    else:
        with FileSystemStorage(location='/tmp').open(file_path, 'r') as kf:
            kml = kf.read()

    try:
        doc = etree.parse(StringIO(kml))
    except etree.XMLSyntaxError as e:
        # fix unicode encoding and try again, a common problem in exported data
        kml = re.sub(r"(<\?xml[^?]+?)utf-16", "\\1utf-8", kml, flags=re.IGNORECASE)
        doc = etree.parse(StringIO(kml))

    results = []
    for pm in doc.xpath("//kml:Placemark", namespaces=KML_NS):
        local_results = []
        begin, end = None, None
        ts = pm.xpath(".//kml:TimeSpan", namespaces=KML_NS)
        if len(ts) > 0:
            begin = parse_datetime(ts[0].xpath("string(./kml:begin)", namespaces=KML_NS).strip())
            end = parse_datetime(ts[0].xpath("string(./kml:end)", namespaces=KML_NS).strip())
            logger.debug('Placemark TimeSpan: (%s , %s)' % (begin, end))
        for ls in pm.xpath(".//kml:LineString", namespaces=KML_NS):
            alt_mode = ls.xpath(".//kml:altitudeMode/text()", namespaces=KML_NS)
            logger.debug('Found alt_mode: %s' % (alt_mode))
            if alt_mode and alt_mode[0] == 'relativeToGround':
                alt_mode = 'altitude_relative'
            elif alt_mode and alt_mode[0] == 'absolute':
                alt_mode = 'altitude'
            else:
                raise Exception('Not a valid KML altitude mode: %s' % (alt_mode))

            coord = pm.xpath(".//kml:coordinates", namespaces=KML_NS)
            if len(coord) == 0:
                continue
            coord = coord[0].text.split()
            for l in coord:
                vals = l.split(',')
                local_results.append({
                    'latitude': Decimal(vals[1]),
                    'longitude': Decimal(vals[0]),
                    alt_mode: int(float(vals[2])*100),
                })
        if begin and end and len(local_results) > 1:
            # interpolate time and attach to data points
            for i, pt in enumerate(local_results):
                pt['time'] = begin + (end - begin)*i/(len(local_results) - 1)
        results.extend(local_results)
    return results

# Waypoint processing

QGC_PARAM_FIELDS = [
    'index',
    'current_wp',
    'coord_frame',
    'command',
    'param1',
    'param2',
    'param3',
    'param4',
    'latitude',
    'longitude',
    'altitude',
    'autocontinue']

def process_qgc_text(wm, file_path):
    """ Process QGroundControl/MissionPlanner TEXT waypoint files often ending
        in .waypoints. Creates Waypoints for the provided WaypointMetadata.
        @return number of waypoint records created or 0 if this file cannot be parsed
    """
    waypoints = []
    f = FileSystemStorage(location='/tmp').open(file_path, 'r')
    lines = f.readlines()
    version = None
    line_list = lines[0].split()
    if len(line_list) <= 2 or (line_list[0] != 'QGC' and line_list[1] != 'WPL'):
        logger.debug('Not a valid QGC .waypoints file for id ' + str(wm.id) + ': ' + file_path)
        return 0
    version = int(line_list[2])
    logger.debug('Found QGC WPL Version: ' + str(version))
    if version != 110 and version != 120:
        logger.warning('Unsupported QGC WPL Text version: %s for id %s' % (str(version), str(wm.id)))
        return 0
    for line_num, line in enumerate(lines[1:]):
        line_list = line.split('\t')
        if len(line_list) == 12:
            reading = dict(zip(QGC_PARAM_FIELDS, line_list))
            # NOTE: Mission Planner puts the home position in the first waypoint, ignore it
            # 110 is Mission Planner, 120 is QGroundControl
            if line_num == 0 and version == 110:
                continue
            waypoints.append(
                Waypoint(
                    order = int(reading['index']),
                    latitude = Decimal(reading['latitude']),
                    longitude =  Decimal(reading['longitude']),
                    altitude_relative = float(reading['altitude']) * 100,
                    waypoint_metadata = wm
                )
            )
    logger.debug('Processed ' + str(len(waypoints)) + ' waypoints')
    if len(waypoints) > 0:
        Waypoint.objects.bulk_create(waypoints)
    return len(waypoints)

def process_qgc_json(wm, file_path):
    """ Process QGroundControl JSON waypoint files often ending
        in .plan. Creates Waypoints for the provided WaypointMetadata.
        @return number of waypoint records created or 0 if this file cannot be parsed
    """
    waypoints = []
    f = FileSystemStorage(location='/tmp').open(file_path, 'r')
    try:
        data = json.load(f)
    except:
        logger.debug('Not a valid JSON file')
        return 0
    if 'fileType' not in data or data['fileType'] != 'Plan':
        logger.debug('JSON file is not a QGC plan')
        return 0
    if data['version'] != 1 or data['mission']['version'] != 2:
        logger.warning('Unsupported QGC version: ' + str(data['version]']))
        return 0
    for item_num, item in enumerate(data['mission']['items']):
        lat, lon, alt = None, None, None
        if item['type'] != 'SimpleItem':
            continue
        # commands 0 through 95 are NAV commands
        if item['command'] <= 95:
            if 'coordinate' in item:
                lat = item['coordinate'][0]
                lon = item['coordinate'][1]
                alt = item['coordinate'][2]
            else:
                lat = item['params'][4]
                lon = item['params'][5]
                alt = item['params'][6]
            waypoints.append(Waypoint(
                order = int(item['doJumpId']),
                latitude = Decimal(lat),
                longitude =  Decimal(lon),
                altitude_relative = float(alt * 100),
                waypoint_metadata = wm
            ))
    logger.debug('Processed ' + str(len(waypoints)) + ' waypoints')
    if len(waypoints) > 0:
        if 'hoverSpeed' in data['mission']:
            wm.v_hover = data['mission']['hoverSpeed']
        if 'cruiseSpeed' in data['mission']:
            wm.v_cruise = data['mission']['cruiseSpeed']
        # NOTE: if we want to extract vehicle type later:
        # vehicle_type = MAVLINK_VEHICLE_TYPES[ data['mission']['vehicleType'] ]
        wm.save()
        Waypoint.objects.bulk_create(waypoints)
    return len(waypoints)

def process_kml_waypoints(wm, file_path):
    """ Parses a KML or KMZ file and extracts waypoints from all LineString segments
    """
    def create_wp(pt):
        i, kml = pt
        return Waypoint(
            order = i+1,
            latitude = kml['latitude'],
            longitude = kml['longitude'],
            altitude = kml['altitude'] if 'altitude' in kml else None,
            altitude_relative = kml['altitude_relative'] if 'altitude_relative' in kml else None,
            waypoint_metadata = wm
        )

    points = kml_parse(file_path)
    waypoints = map(create_wp, enumerate(points))
    Waypoint.objects.bulk_create(waypoints)
    return len(waypoints)

WAYPOINT_PROCESSORS = [
    (WaypointMetadata.PROCESSOR_QGC_TEXT, process_qgc_text),
    (WaypointMetadata.PROCESSOR_QGC_JSON, process_qgc_json),
    (WaypointMetadata.PROCESSOR_KML, process_kml_waypoints)
]

@shared_task
def process_waypoints(wm_id):
    """ Shared task to process waypoints for a given waypoint metadata object (by ID)
        attempting to import using all available waypoint processors.
        Saves errors in the waypoint metadata object.
    """
    wm = WaypointMetadata.objects.get(pk=wm_id)
    if wm is None:
        logger.warning('No waypoint metadata found for id: ' + str(wm_id))
        return
    if wm.state == WaypointMetadata.STATE_PROCESSED:
        logger.warning('Waypoint has already been processed for id: ' + str(wm_id))
        return

    # Temporary local file for holding the waypoint data
    unique_file = unique_filename(wm.path)
    waypoints_file = default_storage.open(wm.path, 'r')
    with FileSystemStorage(location='/tmp').open(unique_file, 'w+') as f:
        f.write(waypoints_file.read())

    processed = False
    for (proc_name, proc) in WAYPOINT_PROCESSORS:
        try:
            res = proc(wm, os.path.join('/tmp/', unique_file))
            if res < 1:
                continue
            processed = True
            logger.debug('Waypoint: storing processor: ' + str(proc_name))
            wm.processor = proc_name
            wm.state = WaypointMetadata.STATE_PROCESSED
            wm.save()
            break
        except Exception as e:
            logger.exception('%s raised %s' % (proc.__name__, str(e)))
            continue

    if not processed:
        logger.warning('No working processor found for waypoint id: %s.' % wm.id)
        wm.state = TelemetryMetadata.STATE_ERROR
        wm.error_message = 'Unsupported waypoint format'
        wm.save()


# Telemetry processing

MAVLINK_VEHICLE_TYPES = {
    1: Vehicle.VEHICLE_TYPE_FIXED_WING,
    2: Vehicle.VEHICLE_TYPE_MULTICOPTER,
    3: Vehicle.VEHICLE_TYPE_MULTICOPTER,
    4: Vehicle.VEHICLE_TYPE_MULTICOPTER,
    13: Vehicle.VEHICLE_TYPE_MULTICOPTER,
    14: Vehicle.VEHICLE_TYPE_MULTICOPTER,
    15: Vehicle.VEHICLE_TYPE_MULTICOPTER,
    19: Vehicle.VEHICLE_TYPE_VTOL,
    20: Vehicle.VEHICLE_TYPE_VTOL,
    21: Vehicle.VEHICLE_TYPE_VTOL,
    22: Vehicle.VEHICLE_TYPE_VTOL,
    23: Vehicle.VEHICLE_TYPE_VTOL,
    24: Vehicle.VEHICLE_TYPE_VTOL,
    25: Vehicle.VEHICLE_TYPE_VTOL
}

def update_or_append_telemetry(ts, telemetry):
    """ Checks if an entry already exists with this timestamp.
        If it does, update the existing entry.
        If not, append the new entry.
        Returns: True if the entry is already in the dictionary
    """
    if not telemetry:
        return False
    if telemetry.time in ts:
        existing = ts[telemetry.time]
        for key, val in telemetry.__dict__.iteritems(): #update non-empty parameters
            if val:
                setattr(existing, key, val)
        return True
    else:
        ts[telemetry.time] = telemetry
        return False

def process_bin_file(fp, tm, file_path):
    """ Process APM .BIN files typically stored on SD card in PX4/ArduPilot drones
        Not supported: heading, batt (%)
    """
    telemetry_hash = {}
    last_battery_reading = None
    last_voltage_reading = None
    last_current_reading = None
    mlog = DFReader.DFReader_binary(file_path)
    while True:
        try:
            m = mlog.recv_match(
                type=[
                    # APM BIN message types
                    'POS', 'GPS', 'CURR',
                ]
            )
            if m is None:
                break
        except Exception as e:
            logger.warning('BIN processing exception: ' + str(e))
            break
        reading_time = getattr(m, '_timestamp', 0.0)
        if reading_time == 0.0:
            continue
        if m.get_type() == 'POS':
            if Decimal(m.Lat) != 0 and Decimal(m.Lng) != 0:
                update_or_append_telemetry(
                    telemetry_hash,
                    Telemetry(
                        telemetry_metadata=tm,
                        time=datetime.datetime.fromtimestamp(
                            reading_time,
                            tz=pytz.UTC
                            ),
                        latitude=Decimal(m.Lat),
                        longitude=Decimal(m.Lng),
                        altitude=m.Alt * 100,
                        altitude_relative=m.RelAlt * 100,
                        voltage=last_voltage_reading,
                        current=last_current_reading
                        )
                    )
                last_voltage_reading = None
                last_current_reading = None
        if m.get_type() == 'GPS':
            velocity = mavextra.gps_velocity_df(m)
            update_or_append_telemetry(
                telemetry_hash,
                Telemetry(
                    telemetry_metadata=tm,
                    time=datetime.datetime.fromtimestamp(
                        reading_time,
                        tz=pytz.UTC
                        ),
                    vx=velocity.x * 100,
                    vy=velocity.y * 100,
                    vz=velocity.z * 100,
                    )
                )
        if m.get_type() == 'CURR':
            last_voltage_reading = m.Volt * 1000 if m.Volt > 0 else None
            last_current_reading = m.Curr * 1000 if m.Curr > 0 else None
    telemetry_list = telemetry_hash.values()
    Telemetry.objects.bulk_create(telemetry_list)
    return len(telemetry_list)

# Specifies the column headings that must be present in this type of CSV file
TELEMETRY_CSV_TYPES = {
    # AirData.com export to CSV
    'airdata': ['latitude','longitude','altitude(feet)','ascent(feet)','speed(mph)',
        'time(millisecond)','datetime(utc)','voltage(v)','compass_heading(degrees)',
        'pitch(degrees)','roll(degrees)','battery_percent'],
}
def process_csv_log_file(fp, tm, file_path):
    f = FileSystemStorage(location='/tmp').open(file_path, 'r')
    reader = DictReader(f, skipinitialspace=True)
    first_row = reader.next()
    # Check if this file is a known CSV type
    csv_type = None
    for key in TELEMETRY_CSV_TYPES.keys():
        if first_row.viewkeys() >= set(TELEMETRY_CSV_TYPES[key]):
            csv_type = key
            logger.debug('Found CSV file type: %s' % (csv_type))
            break
    if csv_type is None:
        logger.debug('Not a known CSV file type')
        return 0
    telemetry_hash = {}

    # NOTE(polastre): AirData also provides a 'message'/event field (from DJI) that is ignored
    if csv_type == 'airdata':
        DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
        # determine millisecond offset
        ms_current = int(first_row['time(millisecond)'])
        time_start = datetime.datetime.strptime(first_row['datetime(utc)'], DATE_FORMAT)
        time_next = datetime.datetime.strptime(first_row['datetime(utc)'], DATE_FORMAT)
        while time_next == time_start:
            row_next = reader.next()
            time_next = datetime.datetime.strptime(row_next['datetime(utc)'], DATE_FORMAT)
            ms_current = int(row_next['time(millisecond)'])
        ms_offset = (1000 - ms_current) % 1000

        # reset the file and read telemetry, f.seek(0) doesn't work right with FileSystemStorage
        f = FileSystemStorage(location='/tmp').open(file_path, 'r')
        reader = DictReader(f, skipinitialspace=True)
        last_time = None
        last_offset = 0
        for m in reader:
            reading_time = datetime.datetime.strptime(m['datetime(utc)'], DATE_FORMAT)
            offset = (int(m['time(millisecond)']) + ms_offset) % 1000
            if last_time and reading_time == last_time and last_offset != offset and offset == 0:
                # log file did not advance to next second correctly
                reading_time += datetime.timedelta(seconds=1)
            else:
                reading_time += datetime.timedelta(milliseconds=offset)
            reading_time = reading_time.replace(tzinfo=pytz.UTC)
            is_existing = update_or_append_telemetry(
                telemetry_hash,
                Telemetry(
                    telemetry_metadata=tm,
                    time=reading_time,
                    latitude=Decimal(m['latitude']),
                    longitude=Decimal(m['longitude']),
                    altitude=float(m['altitude(feet)'])*12*2.54,
                    altitude_relative=float(m['ascent(feet)'])*12*2.54,
                    heading=float(m['compass_heading(degrees)']),
                    batt=int(m['battery_percent']),
                    voltage=int(float(m['voltage(v)']) * 1000) if float(m['voltage(v)']) > 0 else None,
                    )
                )
            if not is_existing:
                # ugly edge case: a repeated reading happens on a time boundary
                last_time = datetime.datetime.strptime(m['datetime(utc)'], DATE_FORMAT)
                last_offset = offset

    telemetry_list = telemetry_hash.values()
    Telemetry.objects.bulk_create(telemetry_list)
    return len(telemetry_list)

def process_dd_log_file(fp, tm, file_path):
    """ Process DroneDeploy .log files
        See https://dronedeploy.gitbooks.io/dronedeploy-apps/content/flightlogs/sample-flight-log.html
        and https://dronedeploy.gitbooks.io/dronedeploy-apps/content/flightlogs.html
        Not supported: altitude (absolute) is not reported by DroneDeploy
    """
    telemetry_hash = {}
    dd_field_map = []
    f = FileSystemStorage(location='/tmp').open(file_path, 'r')
    lines = f.readlines()
    state = 'start'
    header = re.split('    |\t', lines[0].rstrip())
    if header[0] != '#DroneDeploy':
        logger.debug('Not a valid DroneDeploy log file')
        return 0
    # Only know about DroneDeploy v2 logs
    version = header[1].split('.')
    os = None
    if version[0] != '2':
        logger.warning('Unsupported DroneDeploy log file version: ' + header[1])
        return 0
    for l in lines[1:]:
        line_list = re.split('    |\t', l.rstrip())
        if state == 'start':
            if line_list[0] == 'Aircraft Model' and len(line_list) > 1:
                tm.autopilot_name = line_list[1]
            if line_list[0] == 'Flight Controller Firmware' and len(line_list) > 1:
                tm.autopilot_version = line_list[1]
            if line_list[0] == 'Device Operating System':
                os = line_list[1].split(' ')[0]
            if l.startswith('Date/Time (UTC)') or l.startswith('Date/Time (GMT)'):
                tm.save()
                state = 'main'
                dd_field_map = line_list
                continue
        if state == 'main':
            if line_list[0] == '#Flight Recorder Session End':
                state = 'end'
                continue
            m = dict(zip(dd_field_map, line_list))
            # Check for invalid GPS readings, or the aircraft isn't flying with GPS
            if Decimal(m['Aircraft Latitude (Degrees)']) != 0 and Decimal(m['Aircraft Longitude (Degrees)']) != 0 \
                    and int(m['Aircraft Flight Mode Value']) != 0:
                reading_time = datetime.datetime.strptime(
                    m['Date/Time (UTC)'] if 'Date/Time (UTC)' in m else m['Date/Time (GMT)'],
                    '%m/%d/%Y %H:%M:%S'
                ) + datetime.timedelta(milliseconds=(float(m['Elapsed Time (sec)']) % 1) * 1000)
                reading_time = reading_time.replace(tzinfo=pytz.UTC)
                latest_battery = int(m['Aircraft Battery Power (%)'])
                latest_voltage = int(m['Aircraft Battery Voltage (mV)'])
                latest_current = -int(m['Aircraft Battery Current (mA)'])
                heading = float(m['Aircraft Heading (Degrees)'])
                # Bug in Android heading data for version 2.65 and lower
                if (heading > 180 or heading < -180) and \
                        (heading/1000 <= 180 and heading/1000 >= -180):
                    heading = heading / 1000
                if heading > 360 or heading < -360:
                    heading = None
                if heading and heading < 0:
                    heading = 360 + heading
                update_or_append_telemetry(
                    telemetry_hash,
                    Telemetry(
                        telemetry_metadata=tm,
                        time=reading_time,
                        latitude=Decimal(m['Aircraft Latitude (Degrees)']),
                        longitude=Decimal(m['Aircraft Longitude (Degrees)']),
                        altitude_relative=int(float(m['Aircraft Barometric Altitude (ft)']) * 30.48),
                        vx=float(m['Aircraft Vel - X (mph)']) * 44.704 if 'Aircraft Vel - X (mph)' in m else None,
                        vy=float(m['Aircraft Vel - Y (mph)']) * 44.704 if 'Aircraft Vel - Y (mph)' in m else None,
                        vz=float(m['Aircraft Vel - Z (mph)']) * 44.704 if 'Aircraft Vel - Z (mph)' in m else None,
                        heading=heading,
                        batt=latest_battery if latest_battery > 0 else None,
                        voltage=latest_voltage if latest_voltage > 0 else None,
                        current=latest_current if latest_current != 0 else None
                        )
                    )
    telemetry_list = telemetry_hash.values()
    Telemetry.objects.bulk_create(telemetry_list)
    return len(telemetry_list)

def process_kml_telemetry(fp, tm, file_path):
    """ Parses a KML or KMZ file and extracts waypoints from all LineString segments
    """
    def create_telemetry(i, kml):
        # Telemetry *must* have a time associated with it. Remove all telemetry without time data.
        if not 'time' in kml:
            return None
        return Telemetry(
            time = kml['time'],
            latitude = kml['latitude'],
            longitude = kml['longitude'],
            altitude = kml['altitude'] if 'altitude' in kml else None,
            altitude_relative = kml['altitude_relative'] if 'altitude_relative' in kml else None,
            telemetry_metadata=tm
        )

    points = kml_parse(file_path)
    telemetry_hash = {}
    for i, pt in enumerate(points):
        update_or_append_telemetry(telemetry_hash, create_telemetry(i, pt))
    telemetry_list = telemetry_hash.values()
    Telemetry.objects.bulk_create(telemetry_list)
    return len(telemetry_list)

def process_tlog_file(fp, tm, file_path):
    """ Attempt to process a TLOG type of file.
        @return number of telemetry records created
         or 0 if this file cannot be parsed
    """
    boot_systime_ms = None
    last_battery_reading = None
    last_voltage_reading = None
    last_current_reading = None
    times = []

    logger.debug('Attempting to process with TLOG parser')
    mlog = mavutil.mavlogfile(file_path)
    telemetry_list = []
    while True:
        try:
            m = mlog.recv_match(
                type=[
                    # TLOG message types
                    'SYSTEM_TIME', 'HEARTBEAT', 'SYS_STATUS', 'GLOBAL_POSITION_INT',
                ],
                timeout=0.1
            )
            if m is None:
                break
        except Exception as e:
            logger.warning('TLOG processing exception: ' + str(e))
            break
        if boot_systime_ms is None and m.get_type() == 'SYSTEM_TIME':
            boot_systime_ms = int(m.time_unix_usec) / 1000 - int(m.time_boot_ms)
        if m.get_type() == 'GLOBAL_POSITION_INT':
            # skip readings before boot time is reported
            if boot_systime_ms is None:
                continue
            reading_time = int(m.time_boot_ms) + boot_systime_ms
            # sanity check data for dupes, invalid GPS fix
            if reading_time not in times and \
                    Decimal(m.lat) != 0 and Decimal(m.lon) != 0:
                telemetry_list.append(Telemetry(
                    telemetry_metadata=tm,
                    time=datetime.datetime.fromtimestamp(
                        reading_time/1000.0,
                        tz=pytz.UTC
                        ),
                    latitude=Decimal(m.lat)/Decimal(1.0e7),
                    longitude=Decimal(m.lon)/Decimal(1.0e7),
                    altitude=m.alt,
                    altitude_relative=m.relative_alt,
                    heading=m.hdg/100,
                    vx=m.vx,
                    vy=m.vy,
                    vz=m.vz,
                    batt=last_battery_reading,
                    voltage=last_voltage_reading,
                    current=last_current_reading
                    ))
                last_battery_reading = None
                times.append(reading_time)
        elif m.get_type() == 'SYS_STATUS':
            # battery readings don't have a timestamp field, add them to the next telemetry recorded
            last_battery_reading = m.battery_remaining if m.battery_remaining >= 0 else None
            last_voltage_reading = m.voltage_battery if m.voltage_battery > 0 else None
            last_current_reading = m.current_battery*10 if m.current_battery > 0 else None
        elif tm.autopilot_name is None and m.get_type() == 'HEARTBEAT':
            try:
                tm.autopilot_name = mavutil.mavlink.enums['MAV_AUTOPILOT'][m.autopilot].description
                tm.autopilot_version = str(m.mavlink_version)
                if m.type in MAVLINK_VEHICLE_TYPES:
                    tm.vehicle_type = MAVLINK_VEHICLE_TYPES[m.type]
                tm.save()
            except Exception as e:
                logger.warning('TLOG Unknown autopilot type: ' + str(m.autopilot))
    Telemetry.objects.bulk_create(telemetry_list)
    return len(telemetry_list)


def vehicle_global_position(values):
    # reffer https://github.com/PX4/Firmware/blob/master/msg/vehicle_global_position.msg
    kwargs = {
        'latitude':Decimal(values['lat']),
        'longitude':Decimal(values['lon']),
        'altitude':int(values['alt']* 100.0) , #given value is in meters, want in centimeters.
        'vx':float(str(values['vel_n'])),
        'vy':float(str(values['vel_e'])),
        'vz':-float(str(values['vel_d'])),
        'heading':math.degrees(values["yaw"]),
    }
    if values['terrain_alt_valid']:
        kwargs['terrain_alt'] = int(values['terrain_alt']),

    return Telemetry(**kwargs)

def battery_status(values):
    # reffer https://github.com/PX4/Firmware/blob/master/msg/battery_status.msg
    kwargs = {
        'voltage':int(values['voltage_v']*1000),
    }

    # reports -1 if the value is unknown, should not be set.
    if values['remaining'] != -1:
        kwargs['batt'] = int(values['remaining']*100)
    if values['current_a'] != -1:
        kwargs['current'] =int(values['current_a']*1000)

    return Telemetry(**kwargs)


ULOG_DATASET_PROCESSORS = {
    'vehicle_global_position': vehicle_global_position,
    'vehicle_gps_position': None,
    'battery_status': battery_status,
}

def process_ulog_file(fp, tm, file_path):
    logger.debug('Attempting to process with ULOG parser')
    ulog = ULog(file_path, ULOG_DATASET_PROCESSORS.keys())
    ts = {}
    position = ulog.get_dataset("vehicle_global_position").data
    gps = ulog.get_dataset("vehicle_gps_position").data
    first_timestamp = None
    first_utc_usec = None
    if "time_utc_usec" in position:
        first_utc_usec = position["time_utc_usec"][0]
        first_timestamp = int(position["timestamp"][0])
    elif "time_utc_usec" in gps:
        first_utc_usec = gps["time_utc_usec"][0]
        first_timestamp = int(gps["timestamp"][0])
    first_dt = datetime.datetime.fromtimestamp(
        first_utc_usec / 1000000.0,
        tz=pytz.UTC
        )

    for ds_name in ULOG_DATASET_PROCESSORS.keys():
        if ULOG_DATASET_PROCESSORS[ds_name] == None:
            continue
        ds = ulog.get_dataset(ds_name).data
        ds_keys = ds.keys()
        for i in xrange(len(ds["timestamp"])):
            values = {key: ds[key][i] for key in ds_keys}

            telemetry = ULOG_DATASET_PROCESSORS[ds_name](values)
            telemetry.telemetry_metadata=tm
            telemetry.time = _make_ulog_time(first_timestamp, first_dt, int(ds["timestamp"][i]))
            update_or_append_telemetry(ts, telemetry)

    tl = ts.values()
    Telemetry.objects.bulk_create(tl)
    return len(tl)


def _make_ulog_time(first_timestamp, first_dt, instance_timestamp):
    """Create a datetime for an ULOG file entry.

    The way we determine times here is kind of weird, but I couldn't find any
    other way to map from timestamps to UTC time. The only reference to clock
    time I could find was 'time_utc_usec' in GPS messages.

    Useful links on the subject:
    gps message fields with descriptions):
    https://github.com/PX4/Firmware/blob/master/msg/vehicle_gps_position.msg#L27

    ulog file format:
    definitions-section
    """

    # time difference between the initial timestamp and this instance's timestamp in milliseconds
    diff = instance_timestamp - first_timestamp
    logger.debug("timestamps: %s - %s = %s " % (instance_timestamp, first_timestamp, diff))

    return first_dt + datetime.timedelta(seconds=diff/1000.0)


PROCESSORS = [
    (TelemetryMetadata.PROCESSOR_BIN, process_bin_file),
    (TelemetryMetadata.PROCESSOR_DD_LOG, process_dd_log_file),
    (TelemetryMetadata.PROCESSOR_CSV, process_csv_log_file),
    (TelemetryMetadata.PROCESSOR_KML, process_kml_telemetry),
    (TelemetryMetadata.PROCESSOR_TLOG, process_tlog_file),
    (TelemetryMetadata.PROCESSOR_ULOG, process_ulog_file)
]

@shared_task
def process_telemetry(fp_id, tm_id):
    """ Shared task to process telemetry for a given telemetry metadata object (by ID)
        attempting to import using all available telemetry processors.
        Saves errors in the telemetry metadata object.
    """
    try:
        tm = TelemetryMetadata.objects.get(pk=tm_id)
    except TelemetryMetadata.DoesNotExist:
        logger.warning('Telemetry metadata not found: %s' % (tm_id))
        return

    if tm.state == TelemetryMetadata.STATE_PROCESSED:
        logger.warning('Telemetry has already been processed: %s' % (tm_id))
        return

    try:
        fp = FlightPlan.objects.get(pk=fp_id)
    except FlightPlan.DoesNotExist:
        logger.warning('Flight plan not found: %s' % (fp_id))
        tm.state = TelemetryMetadata.STATE_ERROR
        tm.error_message = 'Corresponding flight plan not found'
        tm.save()
        return

    logger.debug("processing telemetry for fp: %s" % fp_id)


    # Temporary local file for holding the telemetry data
    unique_file = unique_filename(tm.path)

    # copy the data from the model into the local file
    telemetry_file = default_storage.open(tm.path, 'r')
    with FileSystemStorage(location='/tmp').open(unique_file, 'w+') as f:
        f.write(telemetry_file.read())

    # try all processors on the file
    res = 0
    processed = False
    for (proc_name, proc) in PROCESSORS:
        try:
            res = proc(fp, tm, '/tmp/%s' % unique_file)
            if res < 1:
                continue
            processed = True
            logger.debug('Telemetry: storing processor: ' + str(proc_name))
            tm.processor = proc_name
            actuals = tm.telemetries.all().aggregate(Min('time'), Max('time'))
            tm.actual_departure_time = actuals['time__min']
            tm.actual_arrival_time = actuals['time__max']
            tm.state = TelemetryMetadata.STATE_PROCESSED
            tm.save()
            break
        except Exception as e:
            logger.debug('%s raised %s' % (proc.__name__, str(e)))
            logger.exception(e)
            continue


    if not processed:
        logger.warning('No working processor found for telemetry file of flight plan %s.' % fp_id)
        tm.state = TelemetryMetadata.STATE_ERROR
        tm.error_message = 'Unsupported telemetry format'
        tm.save()

    if res > 0:
        logger.debug('Processing completed for flight plan ' + str(fp.id) + \
            ' with ' + str(res) + ' records.')
        fp.state = FlightPlan.STATE_COMPLETED
        fp.telemetry = tm
        fp.save()
        fp.telemetrymetadata_set.all().exclude(id=tm.id).delete()
