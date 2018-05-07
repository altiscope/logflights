# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import cuid
from datetime import datetime, timedelta
from decimal import Decimal
from time import time

from django.conf import settings
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.core.validators import RegexValidator
from django.db import models
from django.db import DataError
from django_fsm import FSMField
from django.utils import timezone

CUID_GENERATOR = cuid.CuidGenerator()

# default functions uses in models

# Sets the default time to the next hour
def default_departure():
    val = timezone.now().replace(microsecond=0,second=0,minute=0)
    val = val + timedelta(hours=1)
    return val

def default_arrival():
    val = default_departure() + timedelta(hours=1)
    return val

# creates a human readable slug for a model and ensures no collisions
def default_vh_slug():
    return default_slug(Vehicle)

def default_fp_slug():
    return default_slug(FlightPlan)

def default_tm_slug():
    return default_slug(TelemetryMetadata)

def default_slug(model):
    slug = CUID_GENERATOR.slug()
    collision = model.objects.filter(pk=slug)
    retries = 0
    while collision.count() > 0:
        slug = CUID_GENERATOR.slug()
        collision = model.objects.filter(pk=slug)
        retries += 1
        if retries > 10:
            raise DataError(
                'Unable to generate unique slug for ' + str(model) + '!'
            )
    return slug

# helper functions for models

def document_path(instance, filename, timestamp = None, prefix = 'unknown'):
    if timestamp is None:
        timestamp = int(time())
    if instance.PREFIX is not None and prefix == 'unknown':
        prefix = instance.PREFIX
    return {
        'path': '{0}_{1}/{2}/{3}/{4}/{5}_{6}'.format(
            settings.LOGFLIGHTS_ENVIRONMENT,
            settings.LOGFLIGHTS_DOMAIN,
            settings.GIT_REVISION,
            prefix,
            instance.id,
            timestamp,
            filename),
        'timestamp': timestamp
    }


# MODELS

class Operator(models.Model):
    PREFIX = 'user'
    organization = models.CharField('organization',
        max_length=50,
        blank=False,
        default='')
    mobile_regex = RegexValidator(regex=r'^\+\d{10,15}$',
        message='Phone number must be entered in the format: +9999999999. 10 to 15 digits allowed.')
    mobile_number = models.CharField('mobile phone number',
        max_length=16,
        validators=[mobile_regex],
        blank=True)
    is_test = models.BooleanField('Test account', default=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return format(self.organization)


class Manufacturer(models.Model):
    name = models.CharField('manufacturer', max_length=50)

    def __str__(self):
        return format(self.name)


class Vehicle(models.Model):
    PREFIX = 'veh'

    STATE_ACTIVE = 'active'
    STATE_INACTIVE = 'inactive'

    STATE_CHOICES = [(STATE_ACTIVE, 'Active'),
                     (STATE_INACTIVE, 'Inactive')]

    VEHICLE_TYPE_MULTICOPTER = 1
    VEHICLE_TYPE_FIXED_WING = 2
    VEHICLE_TYPE_VTOL = 3
    VEHICLE_TYPE_UNKNOWN = 0

    VEHICLE_TYPE_CHOICES = (
        (VEHICLE_TYPE_UNKNOWN, 'Not specified'),
        (VEHICLE_TYPE_MULTICOPTER, 'Multicopter'),
        (VEHICLE_TYPE_FIXED_WING, 'Fixed Wing'),
        (VEHICLE_TYPE_VTOL, 'VTOL'),
    )

    id = models.CharField('id', max_length=10, default=default_vh_slug, primary_key=True, unique=True)
    created_at = models.DateTimeField('created time', auto_now_add=True)
    state = FSMField(default=STATE_ACTIVE, choices=STATE_CHOICES)
    model = models.CharField('model', max_length= 50)
    serial_number = models.CharField('serial number', max_length= 100)
    vehicle_type = models.IntegerField('vehicle type', default=VEHICLE_TYPE_UNKNOWN, choices=VEHICLE_TYPE_CHOICES)
    empty_weight = models.FloatField('empty weight (kg)')
    operator = models.ForeignKey('operator')
    manufacturer = models.ForeignKey('manufacturer')

    def __str__(self):
        return format(self.serial_number)


class MissionType(models.Model):
    title = models.CharField('Title', max_length= 50)

    def __str__(self):
        return format(self.title)


class FlightPlan(models.Model):
    PREFIX = 'fp'
    # constants for easier reference elsewhere in the code:
    STATE_PLANNED = 'planned'
    STATE_COMPLETED = 'completed'
    STATE_INVALID = 'invalid'
    STATE_DELETED = 'deleted'

    STATES = [(STATE_PLANNED,'Planned'),
        (STATE_COMPLETED,'Completed'),
        (STATE_INVALID,'Invalid'),
        (STATE_DELETED,'Deleted')]

    id = models.CharField('id', max_length=10, default=default_fp_slug, primary_key=True, unique=True)
    state = FSMField(default=STATE_PLANNED, choices=STATES)
    flight_id = models.CharField('flight id', max_length=100)
    waypoints = models.ForeignKey('WaypointMetadata', blank=True, null=True, on_delete=models.SET_NULL)
    telemetry = models.ForeignKey('TelemetryMetadata', blank=True, null=True, on_delete=models.SET_NULL)
    planned_departure_time = models.DateTimeField('estimated departure time', default=default_departure)
    planned_arrival_time = models.DateTimeField('estimated arrival time', default=default_arrival)
    payload_weight = models.FloatField('payload weight (kg)')
    created_at = models.DateTimeField('created time', auto_now_add=True)
    vehicle = models.ForeignKey(Vehicle, null=True, on_delete=models.SET_NULL)
    operator = models.ForeignKey(Operator)
    mission_type = models.ForeignKey(MissionType)

    def waypoint_filename(self):
        if self.waypoints:
            # uploaded files are generated by `document_path`, which adds a timestamp and underscore
            # this function grabs the file from the path, then reconstructs the original file name
            # based on the timestamp followed by an underscore.
            return self.waypoints.path.split('/').pop().split('_',1)[1]
        return None


class WaypointMetadata(models.Model):
    STATE_UPLOADED = 'u'
    STATE_PROCESSED = 'p'
    STATE_ERROR = 'e'

    STATES = [
        (STATE_UPLOADED,'Uploaded'),
        (STATE_PROCESSED,'Processed'),
        (STATE_ERROR,'Error')
    ]

    # Add new processors here
    PROCESSOR_NONE = 0
    PROCESSOR_QGC_TEXT = 1
    PROCESSOR_QGC_JSON = 2
    PROCESSOR_KML = 3

    PROCESSOR = [
        (PROCESSOR_NONE,'unknown'),
        (PROCESSOR_QGC_TEXT,'Mission Planner .waypoints'),
        (PROCESSOR_QGC_JSON,'QGroundControl .plan'),
        (PROCESSOR_KML,'Keyhole Markup Language .kml'),
    ]

    id = models.CharField('id', max_length=10, default=default_tm_slug, primary_key=True, unique=True)
    operator = models.ForeignKey(Operator)
    flight_plan = models.ForeignKey(FlightPlan, on_delete=models.CASCADE, blank=True, null=True)
    state = FSMField('waypoint processing state', default=STATE_UPLOADED, choices=STATES)
    processor = models.IntegerField('waypoint parser', default=PROCESSOR_NONE, choices=PROCESSOR)
    path = models.TextField('path to uploaded waypoint file', blank=True, null=True)
    error_message = models.TextField('error message', blank=True, null=True)

    v_cruise = models.FloatField('velocity in cruise (cm/s)', blank=True, null=True)
    v_hover = models.FloatField('velocity in hover (cm/s)', blank=True, null=True)

    def __str__(self):
        return format(self.id)


class Waypoint(models.Model):
    waypoint_metadata = models.ForeignKey(WaypointMetadata, on_delete=models.CASCADE, related_name='waypoints')
    order = models.IntegerField('sequential order', default=0)
    latitude = models.DecimalField('latitude', max_digits=9, decimal_places=6)
    longitude = models.DecimalField('longitude', max_digits=9, decimal_places=6)
    altitude = models.IntegerField('altitude (cm, MSL)', blank=True, null=True)
    altitude_relative = models.IntegerField('altiude (cm, AGL)', blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['waypoint_metadata', 'order']),
        ]
        unique_together = (('waypoint_metadata', 'order'),)


class TelemetryMetadata(models.Model):
    STATE_UPLOADED = 'u'
    STATE_PROCESSED = 'p'
    STATE_ERROR = 'e'

    STATES = [
        (STATE_UPLOADED,'Uploaded'),
        (STATE_PROCESSED,'Processed'),
        (STATE_ERROR,'Error')
    ]

    # Add new processors here
    PROCESSOR_NONE = 0
    PROCESSOR_ULOG = 1
    PROCESSOR_TLOG = 2
    PROCESSOR_BIN = 3
    PROCESSOR_DD_LOG = 4
    PROCESSOR_CSV = 5
    PROCESSOR_KML = 6

    PROCESSOR = [
        (PROCESSOR_NONE,'unknown'),
        (PROCESSOR_BIN,'bin'),
        (PROCESSOR_CSV,'csv'),
        (PROCESSOR_DD_LOG,'ddlog'),
        (PROCESSOR_KML,'kml'),
        (PROCESSOR_ULOG,'ulog'),
        (PROCESSOR_TLOG,'tlog')
    ]

    id = models.CharField('id', max_length=10, default=default_tm_slug, primary_key=True, unique=True)
    flight_plan = models.ForeignKey(FlightPlan, on_delete=models.CASCADE)
    state = FSMField('telemetry processing state', default=STATE_UPLOADED, choices=STATES)
    processor = models.IntegerField('telemetry parser', default=PROCESSOR_NONE, choices=PROCESSOR)
    path = models.TextField('path to uploaded telemetry file', blank=True, null=True)
    error_message = models.TextField('error message', blank=True, null=True)

    actual_departure_time = models.DateTimeField('actual departure time', blank=True, null=True)
    actual_arrival_time = models.DateTimeField('actual arrival time', blank=True, null=True)
    autopilot_name = models.TextField('autopilot name', blank=True, null=True)
    autopilot_version = models.TextField('autopilot version', blank=True, null=True)
    vehicle_type = models.IntegerField('vehicle type', default=Vehicle.VEHICLE_TYPE_UNKNOWN, choices=Vehicle.VEHICLE_TYPE_CHOICES)


class Telemetry(models.Model):
    telemetry_metadata = models.ForeignKey(TelemetryMetadata, on_delete=models.CASCADE, related_name='telemetries')
    time = models.DateTimeField('time of telemetry reading')
    latitude = models.DecimalField('latitude', max_digits=9, decimal_places=6, null=True)
    longitude = models.DecimalField('longitude', max_digits=9, decimal_places=6, null=True)
    altitude = models.IntegerField('altitude (cm, MSL)', null=True)
    altitude_relative = models.IntegerField('altiude (cm, AGL)', null=True)
    heading = models.FloatField('heading (degrees)', null=True)
    vx = models.FloatField('velocity x (cm/s)', null=True)
    vy = models.FloatField('velocity y (cm/s)', null=True)
    vz = models.FloatField('velocity z (cm/s)', null=True)
    batt = models.IntegerField('Battery remaining (%)', null=True)
    voltage = models.IntegerField('voltage (mV)', null=True)
    current = models.IntegerField('current (mA)', null=True)

    class Meta:
        indexes = [
            models.Index(fields=['telemetry_metadata', 'time']),
        ]
        unique_together = (('telemetry_metadata', 'time'),)
