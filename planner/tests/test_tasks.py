# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
from decimal import Decimal
import os
from pytz import UTC
import shutil

from django.test import TestCase, tag
from django.test.utils import override_settings

import utils

from planner.models import FlightPlan, MissionType, TelemetryMetadata, WaypointMetadata
import planner.tasks


@override_settings(DEFAULT_FILE_STORAGE='django.core.files.storage.FileSystemStorage', MEDIA_ROOT='/tmp')
class Waypoints(TestCase):
    TEST_DATA = {
        'kml_test1': 'data/waypoints/test1.kml',
        'kmz_test1': 'data/waypoints/test1.kmz',
        'qgc_json': 'data/waypoints/qgc_json.plan',
        'qgc_text110': 'data/waypoints/qgc_text110.waypoints',
        'qgc_text120': 'data/waypoints/qgc_text120.waypoints',
        'qgc_text_fail': 'data/waypoints/fail_case2.waypoints',
        'fail_case': 'data/waypoints/fail_case1.md',
    }
    TEST_FILES = []

    def setUp(self):
        self.dir_path = os.path.dirname(os.path.realpath(__file__))
        (self.user, self.operator) = utils.create_user_operator()

    def tearDown(self):
        while len(self.TEST_FILES) > 0:
            f = self.TEST_FILES.pop()
            os.remove(f)

    def get_test_file(self, input_file):
        """ copy file to temporary storage and get the temporary filename
        """
        test_file = os.path.join('/tmp/', planner.tasks.unique_filename(input_file))
        shutil.copyfile(
            os.path.join(self.dir_path, input_file),
            test_file
        )
        self.TEST_FILES.append(test_file)
        return test_file

    def test_process_waypoints(self):
        test_file = self.get_test_file(self.TEST_DATA['qgc_json'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        planner.tasks.process_waypoints(wm.id)
        wm.refresh_from_db()
        self.assertEqual(wm.state, WaypointMetadata.STATE_PROCESSED)
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 5)
        self.assertEqual(waypoints[0].order, 1)
        self.assertEqual(waypoints[4].order, 5)
        self.assertEqual(waypoints[0].order, 1)
        self.assertEqual(waypoints[0].latitude, Decimal('39.727203'))
        self.assertEqual(waypoints[0].longitude, Decimal('-111.760975'))
        self.assertEqual(waypoints[0].altitude_relative, 5000)
        self.assertEqual(waypoints[2].latitude, Decimal('39.358232'))
        self.assertEqual(waypoints[2].longitude, Decimal('-111.453236'))
        self.assertEqual(waypoints[2].altitude_relative, 12000)

    def test_process_waypoints_not_supported(self):
        test_file = self.get_test_file(self.TEST_DATA['fail_case'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        planner.tasks.process_waypoints(wm.id)
        wm.refresh_from_db()
        self.assertEqual(wm.state, WaypointMetadata.STATE_ERROR)
        self.assertEqual(wm.error_message, 'Unsupported waypoint format')
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 0)

    def test_process_kml_test1(self):
        test_file = self.get_test_file(self.TEST_DATA['kml_test1'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        ret = planner.tasks.process_kml_waypoints(wm, test_file)
        self.assertGreater(ret, 0)
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 279)
        self.assertEqual(waypoints[0].order, 1)
        self.assertEqual(waypoints[278].order, 279)
        self.assertEqual(waypoints[4].order, 5)

        # test start point
        self.assertEqual(waypoints[0].latitude, Decimal('39.909188'))
        self.assertEqual(waypoints[0].longitude, Decimal('-75.733496'))
        self.assertEqual(waypoints[0].altitude, int(481.35*2.54*12))
        self.assertEqual(waypoints[0].altitude_relative, None)

        # test mid point
        self.assertEqual(waypoints[140].latitude, Decimal('39.909111'))
        self.assertEqual(waypoints[140].longitude, Decimal('-75.733329'))
        self.assertEqual(waypoints[140].altitude, 15371)

    def test_process_kmz_test1(self):
        test_file = self.get_test_file(self.TEST_DATA['kmz_test1'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        ret = planner.tasks.process_kml_waypoints(wm, test_file)
        self.assertGreater(ret, 0)
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 279)
        self.assertEqual(waypoints[0].order, 1)
        self.assertEqual(waypoints[278].order, 279)
        self.assertEqual(waypoints[4].order, 5)

        # test start point
        self.assertEqual(waypoints[0].latitude, Decimal('39.909188'))
        self.assertEqual(waypoints[0].longitude, Decimal('-75.733496'))
        self.assertEqual(waypoints[0].altitude, int(481.35*2.54*12))
        self.assertEqual(waypoints[0].altitude_relative, None)

        # test mid point
        self.assertEqual(waypoints[140].latitude, Decimal('39.909111'))
        self.assertEqual(waypoints[140].longitude, Decimal('-75.733329'))
        self.assertEqual(waypoints[140].altitude, 15371)

    def test_process_qgc_json(self):
        test_file = self.get_test_file(self.TEST_DATA['qgc_json'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        ret = planner.tasks.process_qgc_json(wm, test_file)
        self.assertGreater(ret, 0)
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 5)
        self.assertEqual(waypoints[0].order, 1)
        self.assertEqual(waypoints[4].order, 5)
        self.assertEqual(waypoints[0].order, 1)
        self.assertEqual(waypoints[0].latitude, Decimal('39.727203'))
        self.assertEqual(waypoints[0].longitude, Decimal('-111.760975'))
        self.assertEqual(waypoints[0].altitude_relative, 5000)
        self.assertEqual(waypoints[2].latitude, Decimal('39.358232'))
        self.assertEqual(waypoints[2].longitude, Decimal('-111.453236'))
        self.assertEqual(waypoints[2].altitude_relative, 12000)

    def test_process_qgc_json_not_supported(self):
        test_file = self.get_test_file(self.TEST_DATA['qgc_text110'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        ret = planner.tasks.process_qgc_json(wm, test_file)
        self.assertEqual(ret, 0)
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 0)

    def test_process_qgc_text_110(self):
        test_file = self.get_test_file(self.TEST_DATA['qgc_text110'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        ret = planner.tasks.process_qgc_text(wm, test_file)
        self.assertGreater(ret, 0)
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 13)
        self.assertEqual(waypoints[0].order, 1)
        self.assertEqual(waypoints[5].order, 6)
        self.assertEqual(waypoints[12].order, 13)
        self.assertEqual(waypoints[0].latitude, Decimal('-7.945337'))
        self.assertEqual(waypoints[0].longitude, Decimal('-74.842300'))
        self.assertEqual(waypoints[0].altitude_relative, 3000)
        self.assertEqual(waypoints[11].altitude_relative, 2500)
        self.assertEqual(waypoints[12].latitude, Decimal('-8.340170'))
        self.assertEqual(waypoints[12].longitude, Decimal('-74.595258'))
        self.assertEqual(waypoints[12].altitude_relative, 0)

    def test_process_qgc_text_120(self):
        test_file = self.get_test_file(self.TEST_DATA['qgc_text120'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        ret = planner.tasks.process_qgc_text(wm, test_file)
        self.assertGreater(ret, 0)
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 2)
        self.assertEqual(waypoints[0].order, 0)
        self.assertEqual(waypoints[1].order, 1)
        self.assertEqual(waypoints[0].latitude, Decimal('-7.945337'))
        self.assertEqual(waypoints[0].longitude, Decimal('-74.842300'))
        self.assertEqual(waypoints[0].altitude_relative, 3000)

    def test_process_qgc_text_not_supported(self):
        test_file = self.get_test_file(self.TEST_DATA['qgc_json'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        ret = planner.tasks.process_qgc_text(wm, test_file)
        self.assertEqual(ret, 0)
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 0)

    def test_process_qgc_text_wrong_version(self):
        test_file = self.get_test_file(self.TEST_DATA['qgc_text_fail'])
        wm = WaypointMetadata.objects.create(
            operator = self.operator,
            path = test_file,
        )
        ret = planner.tasks.process_qgc_text(wm, test_file)
        self.assertEqual(ret, 0)
        waypoints = wm.waypoints.order_by('order')
        self.assertEqual(len(waypoints), 0)


@override_settings(DEFAULT_FILE_STORAGE='django.core.files.storage.FileSystemStorage', MEDIA_ROOT='/tmp')
class Telemetry(TestCase):
    fixtures = ['missions']
    TEST_DATA = {
        'csv_airdata1': 'data/telemetry/airdata1.csv',
        'bin1': 'data/telemetry/test_1.BIN',
        'ddlog1': 'data/telemetry/dd1.log',
        'ddlog2_ios': 'data/telemetry/dd2-ios.log',
        'ddlog2_android': 'data/telemetry/dd2-android.log',
        'kml_test1': 'data/waypoints/test1.kml',
        'kml_test2': 'data/telemetry/test2.kml',
        'kmz_test2': 'data/telemetry/test2.kmz',
        'tlog1': 'data/telemetry/test.tlog',
        'ulog1': 'data/telemetry/test_1.ulg',
        'ulog2': 'data/telemetry/test_2.ulg',
        'fail_case1': 'data/telemetry/fail_case1.png'
    }
    TEST_FILES = []

    def setUp(self):
        self.dir_path = os.path.dirname(os.path.realpath(__file__))
        (self.user, self.operator) = utils.create_user_operator()

    def tearDown(self):
        while len(self.TEST_FILES) > 0:
            f = self.TEST_FILES.pop()
            os.remove(f)

    def get_test_file(self, input_file):
        """ copy file to temporary storage and get the temporary filename
        """
        test_file = os.path.join('/tmp/', planner.tasks.unique_filename(input_file))
        shutil.copyfile(
            os.path.join(self.dir_path, input_file),
            test_file
        )
        self.TEST_FILES.append(test_file)
        return test_file

    def create_plan(self, test_file):
        mt = MissionType.objects.get(pk=1)
        fp = FlightPlan.objects.create(
            flight_id = 'test_tlog',
            payload_weight = 1,
            operator = self.operator,
            mission_type = mt
        )
        tm = TelemetryMetadata.objects.create(
            path = test_file,
            flight_plan = fp,
        )
        return (fp, tm)

    def test_process_telemetry(self):
        test_file = self.get_test_file(self.TEST_DATA['tlog1'])
        (fp, tm) = self.create_plan(test_file)
        planner.tasks.process_telemetry(fp.id, tm.id)
        fp.refresh_from_db()
        tm.refresh_from_db()
        self.assertEqual(fp.state, FlightPlan.STATE_COMPLETED)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 999)
        self.assertEqual(tm.state, TelemetryMetadata.STATE_PROCESSED)
        self.assertEqual(telemetry[0].longitude, Decimal('-74.606991'))
        self.assertEqual(telemetry[0].longitude, Decimal('-74.606991'))
        self.assertEqual(telemetry[0].batt, 28)
        self.assertEqual(telemetry[0].voltage, 13509)
        self.assertEqual(telemetry[0].current, 20330)
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 6, 22, 21, 38, 6, 40000, tzinfo=UTC))

    def test_process_telemetry_fail(self):
        test_file = self.get_test_file(self.TEST_DATA['fail_case1'])
        (fp, tm) = self.create_plan(test_file)
        planner.tasks.process_telemetry(fp.id, tm.id)
        fp.refresh_from_db()
        tm.refresh_from_db()
        self.assertEqual(fp.state, FlightPlan.STATE_PLANNED)
        self.assertEqual(tm.state, TelemetryMetadata.STATE_ERROR)
        self.assertEqual(tm.error_message, 'Unsupported telemetry format')
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 0)

    @tag('slow')
    def test_process_tlog_file(self):
        test_file = self.get_test_file(self.TEST_DATA['tlog1'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_tlog_file(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 999)
        self.assertEqual(telemetry[0].longitude, Decimal('-74.606991'))
        self.assertEqual(telemetry[0].longitude, Decimal('-74.606991'))
        self.assertEqual(telemetry[0].batt, 28)
        self.assertEqual(telemetry[0].voltage, 13509)
        self.assertEqual(telemetry[0].current, 20330)
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 6, 22, 21, 38, 6, 40000, tzinfo=UTC))

        self.assertEqual(telemetry[500].altitude_relative, 8149)
        self.assertEqual(telemetry[500].altitude, 156530)
        self.assertEqual(telemetry[500].longitude, Decimal('-74.596521'))
        self.assertEqual(telemetry[500].latitude, Decimal('-8.340345'))
        self.assertEqual(telemetry[500].heading, 8.0)
        self.assertEqual(telemetry[500].vx, -44.0)
        self.assertEqual(telemetry[500].vy, 133.0)
        self.assertEqual(telemetry[500].vz, -66.0)
        self.assertEqual(telemetry[500].batt, 21)
        self.assertEqual(telemetry[500].voltage, 14761)
        self.assertEqual(telemetry[500].time, datetime.datetime(2017, 6, 22, 21, 43, 38, 253000, tzinfo=UTC))

        self.assertEqual(telemetry[998].time, datetime.datetime(2017, 6, 22, 21, 47, 55, 452000, tzinfo=UTC))

    @tag('slow')
    def test_process_tlog_file_not_supported(self):
        test_file = self.get_test_file(self.TEST_DATA['ulog1'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_tlog_file(fp, tm, test_file)
        self.assertEqual(ret, 0)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 0)

    @tag('slow')
    def test_process_bin1_file(self):
        test_file = self.get_test_file(self.TEST_DATA['bin1'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_bin_file(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 14620)

        # test start point
        self.assertEqual(telemetry[0].latitude, Decimal('30.390089'))
        self.assertEqual(telemetry[0].longitude, Decimal('-97.581011'))
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 7, 3, 22, 54, 14, 779467, tzinfo=UTC))
        self.assertEqual(telemetry[0].altitude_relative, 18)
        self.assertEqual(telemetry[0].altitude, 18475)

        # test random middle points
        self.assertEqual(telemetry[5001].altitude_relative, 3334)
        self.assertEqual(telemetry[5001].altitude, 22444)
        self.assertEqual(telemetry[5001].longitude, Decimal('-97.580896'))
        self.assertEqual(telemetry[5001].latitude, Decimal('30.389375'))
        self.assertEqual(telemetry[5001].voltage, 13656)
        self.assertEqual(telemetry[5001].time, datetime.datetime(2017, 7, 3, 22, 57, 57, 700093, tzinfo=UTC))

        self.assertEqual(telemetry[5004].vx, -119.99999120408047)
        self.assertEqual(telemetry[5004].vy, -149.0000025905529)
        self.assertEqual(telemetry[5004].vz, -65.99999666213989)
        self.assertEqual(telemetry[5004].time, datetime.datetime(2017, 7, 3, 22, 57, 57, 791910, tzinfo=UTC))

        # test current and voltage is reported and combined with position reading
        self.assertEqual(telemetry[6486].current, 21750)
        self.assertEqual(telemetry[6486].voltage, 13397)
        self.assertEqual(telemetry[6486].altitude, 25381)
        self.assertEqual(telemetry[6486].time, datetime.datetime(2017, 7, 3, 22, 58, 48, 937716, tzinfo=UTC))

    @tag('slow')
    def test_process_csv_airdata1_file(self):
        test_file = self.get_test_file(self.TEST_DATA['csv_airdata1'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_csv_log_file(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 1378)

        # test start point
        self.assertEqual(telemetry[0].latitude, Decimal('39.909188'))
        self.assertEqual(telemetry[0].longitude, Decimal('-75.733496'))
        self.assertEqual(telemetry[0].time, datetime.datetime(2016, 9, 21, 15, 3, 8, 800000, tzinfo=UTC))
        self.assertEqual(telemetry[0].altitude_relative, 0)
        self.assertEqual(telemetry[0].altitude, int(481.35*2.54*12))
        self.assertEqual(telemetry[0].vx, None)
        self.assertEqual(telemetry[0].vy, None)
        self.assertEqual(telemetry[0].vz, None)
        self.assertEqual(telemetry[0].heading, 151.7)
        self.assertEqual(telemetry[0].batt, 71)
        self.assertEqual(telemetry[0].current, None)
        self.assertEqual(telemetry[0].voltage, None)

        # test mid point
        self.assertEqual(telemetry[500].latitude, Decimal('39.909109'))
        self.assertEqual(telemetry[500].longitude, Decimal('-75.733328'))
        self.assertEqual(telemetry[500].time, datetime.datetime(2016, 9, 21, 15, 4, 0, 700000, tzinfo=UTC))
        self.assertEqual(telemetry[500].heading, 153.5)
        self.assertEqual(telemetry[500].altitude_relative, 1150)
        self.assertEqual(telemetry[500].altitude, 15821)
        self.assertEqual(telemetry[500].batt, 68)
        self.assertEqual(telemetry[500].voltage, 14942)

    @tag('slow')
    def test_process_dd_log1_file(self):
        test_file = self.get_test_file(self.TEST_DATA['ddlog1'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_dd_log_file(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 3)

        # test start point
        self.assertEqual(telemetry[0].latitude, Decimal('37.771820'))
        self.assertEqual(telemetry[0].longitude, Decimal('-122.407430'))
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 1, 13, 20, 22, 54, 169000, tzinfo=UTC))
        self.assertEqual(telemetry[0].altitude_relative, 335)
        self.assertEqual(telemetry[0].altitude, None)
        self.assertEqual(telemetry[0].vx, 22.352)
        self.assertEqual(telemetry[0].vy, 26.8224)
        self.assertEqual(telemetry[0].vz, 31.2928)
        self.assertEqual(telemetry[0].heading, 33.1)
        self.assertEqual(telemetry[0].batt, None)
        self.assertEqual(telemetry[0].current, None)
        self.assertEqual(telemetry[0].voltage, None)

        # test end point
        self.assertEqual(telemetry[2].latitude, Decimal('37.771920'))
        self.assertEqual(telemetry[2].longitude, Decimal('-122.408430'))
        self.assertEqual(telemetry[2].time, datetime.datetime(2017, 1, 13, 20, 22, 54, 368000, tzinfo=UTC))

    @tag('slow')
    def test_process_dd_log2_ios_file(self):
        test_file = self.get_test_file(self.TEST_DATA['ddlog2_ios'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_dd_log_file(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 1944)

        # test start point
        self.assertEqual(telemetry[0].latitude, Decimal('32.897573'))
        self.assertEqual(telemetry[0].longitude, Decimal('-79.824921'))
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 11, 29, 20, 51, 59, 117000, tzinfo=UTC))
        self.assertEqual(telemetry[0].altitude_relative, 0)
        self.assertEqual(telemetry[0].altitude, None)
        self.assertEqual(telemetry[0].vx, 0)
        self.assertEqual(telemetry[0].vy, 0)
        self.assertEqual(telemetry[0].vz, 0)
        self.assertEqual(telemetry[0].heading, 42.90000000000001)
        self.assertEqual(telemetry[0].batt, None)
        self.assertEqual(telemetry[0].current, None)
        self.assertEqual(telemetry[0].voltage, None)

        # test mid point
        self.assertEqual(telemetry[900].latitude, Decimal('32.897578'))
        self.assertEqual(telemetry[900].longitude, Decimal('-79.824792'))
        self.assertEqual(telemetry[900].time, datetime.datetime(2017, 11, 29, 20, 53, 29, 744000, tzinfo=UTC))
        self.assertEqual(telemetry[900].altitude_relative, 9210)
        self.assertEqual(telemetry[900].vx, 0)
        self.assertEqual(telemetry[900].vy, -890.00210112)
        self.assertEqual(telemetry[900].vz, 0)
        self.assertEqual(telemetry[900].heading, 269.6)
        self.assertEqual(telemetry[900].batt, 47)
        self.assertEqual(telemetry[900].current, 10120)
        self.assertEqual(telemetry[900].voltage, 14898)

    @tag('slow')
    def test_process_dd_log2_android_file(self):
        test_file = self.get_test_file(self.TEST_DATA['ddlog2_android'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_dd_log_file(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 908)

        # test start point
        self.assertEqual(telemetry[0].latitude, Decimal('32.897561'))
        self.assertEqual(telemetry[0].longitude, Decimal('-79.824941'))
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 12, 21, 19, 20, 8, 175000, tzinfo=UTC))
        self.assertEqual(telemetry[0].altitude_relative, 88)
        self.assertEqual(telemetry[0].altitude, None)
        self.assertEqual(telemetry[0].vx, None)
        self.assertEqual(telemetry[0].vy, None)
        self.assertEqual(telemetry[0].vz, None)
        self.assertEqual(telemetry[0].heading, 5.9)
        self.assertEqual(telemetry[0].batt, 33)
        self.assertEqual(telemetry[0].current, 12920)
        self.assertEqual(telemetry[0].voltage, 14605)

        # test mid point
        self.assertEqual(telemetry[450].latitude, Decimal('32.897392'))
        self.assertEqual(telemetry[450].longitude, Decimal('-79.824150'))
        self.assertEqual(telemetry[450].time, datetime.datetime(2017, 12, 21, 19, 20, 53, 173000, tzinfo=UTC))
        self.assertEqual(telemetry[450].altitude_relative, 2249)
        self.assertEqual(telemetry[450].heading, 87.9)
        self.assertEqual(telemetry[450].batt, 30)
        self.assertEqual(telemetry[450].current, 12066)
        self.assertEqual(telemetry[450].voltage, 14605)

    @tag('slow')
    def test_process_kml_test2(self):
        test_file = self.get_test_file(self.TEST_DATA['kml_test2'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_kml_telemetry(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 1571)

        # test start point
        self.assertEqual(telemetry[0].latitude, Decimal('-7.978446'))
        self.assertEqual(telemetry[0].longitude, Decimal('-74.814795'))
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 6, 22, 20, 12, 54, tzinfo=UTC))
        self.assertEqual(telemetry[0].altitude_relative, None)
        self.assertEqual(telemetry[0].altitude, 29770)
        self.assertEqual(telemetry[0].vx, None)
        self.assertEqual(telemetry[0].vy, None)
        self.assertEqual(telemetry[0].vz, None)
        self.assertEqual(telemetry[0].heading, None)
        self.assertEqual(telemetry[0].batt, None)
        self.assertEqual(telemetry[0].current, None)
        self.assertEqual(telemetry[0].voltage, None)

        # test mid point
        self.assertEqual(telemetry[450].latitude, Decimal('-7.953188'))
        self.assertEqual(telemetry[450].longitude, Decimal('-74.839287'))
        self.assertEqual(telemetry[450].time, datetime.datetime(2017, 6, 22, 20, 19, 5, 522776, tzinfo=UTC))
        self.assertEqual(telemetry[450].altitude, 26570)

        # test multi-segment time interpolation
        self.assertEqual(telemetry[1570].time, datetime.datetime(2017, 6, 22, 20, 29, 21, tzinfo=UTC))

    @tag('slow')
    def test_process_kmz_test2(self):
        test_file = self.get_test_file(self.TEST_DATA['kmz_test2'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_kml_telemetry(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 1571)

        # test start point
        self.assertEqual(telemetry[0].latitude, Decimal('-7.978446'))
        self.assertEqual(telemetry[0].longitude, Decimal('-74.814795'))
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 6, 22, 20, 12, 54, tzinfo=UTC))
        self.assertEqual(telemetry[0].altitude_relative, None)
        self.assertEqual(telemetry[0].altitude, 29770)
        self.assertEqual(telemetry[0].vx, None)
        self.assertEqual(telemetry[0].vy, None)
        self.assertEqual(telemetry[0].vz, None)
        self.assertEqual(telemetry[0].heading, None)
        self.assertEqual(telemetry[0].batt, None)
        self.assertEqual(telemetry[0].current, None)
        self.assertEqual(telemetry[0].voltage, None)

        # test mid point
        self.assertEqual(telemetry[450].latitude, Decimal('-7.953188'))
        self.assertEqual(telemetry[450].longitude, Decimal('-74.839287'))
        self.assertEqual(telemetry[450].time, datetime.datetime(2017, 6, 22, 20, 19, 5, 522776, tzinfo=UTC))
        self.assertEqual(telemetry[450].altitude, 26570)

        # test multi-segment time interpolation
        self.assertEqual(telemetry[1570].time, datetime.datetime(2017, 6, 22, 20, 29, 21, tzinfo=UTC))

    @tag('slow')
    def test_process_kml_test1_missingtime(self):
        test_file = self.get_test_file(self.TEST_DATA['kml_test1'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_kml_telemetry(fp, tm, test_file)
        self.assertEqual(ret, 0)

    @tag('slow')
    def test_process_ulog1_file(self):
        test_file = self.get_test_file(self.TEST_DATA['ulog1'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_ulog_file(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')

        self.assertEqual(len(telemetry), 4206)
        self.assertEqual(telemetry[498].altitude, 16765)
        self.assertEqual(telemetry[498].longitude, Decimal('-116.966687'))
        self.assertEqual(telemetry[498].latitude, Decimal('32.523965'))
        self.assertEqual(telemetry[498].vx, 7.9898376)
        self.assertEqual(telemetry[498].vy, -0.3873912)
        self.assertEqual(telemetry[498].vz, 0.12525769)
        self.assertEqual(telemetry[498].time, datetime.datetime(2017, 9, 9, 14, 47, 44, 186070, tzinfo=UTC))

        self.assertEqual(telemetry[0].batt, 53)
        self.assertEqual(telemetry[0].voltage, 11415)
        self.assertEqual(telemetry[0].current, 372)
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 9, 8, 18, 16, 44, 931070, tzinfo=UTC))


    @tag('slow')
    def test_process_ulog2_file(self):
        test_file = self.get_test_file(self.TEST_DATA['ulog2'])
        (fp, tm) = self.create_plan(test_file)
        ret = planner.tasks.process_ulog_file(fp, tm, test_file)
        self.assertGreater(ret, 0)
        telemetry = tm.telemetries.order_by('time')

        self.assertEqual(len(telemetry), 3731)
        self.assertEqual(telemetry[499].altitude, 14421)
        self.assertEqual(telemetry[499].longitude, Decimal('-116.966539'))
        self.assertEqual(telemetry[499].latitude, Decimal('32.523532'))
        self.assertEqual(telemetry[499].vx, 2.9339116)
        self.assertEqual(telemetry[499].vy, -4.956179)
        self.assertEqual(telemetry[499].vz, -0.25351477)
        self.assertEqual(telemetry[499].time, datetime.datetime(2017, 9, 8, 16, 58, 43, 843487, tzinfo=UTC))

        self.assertEqual(telemetry[0].batt, 100)
        self.assertEqual(telemetry[0].voltage, 16617)
        self.assertEqual(telemetry[0].current, 0)
        self.assertEqual(telemetry[0].time, datetime.datetime(2017, 9, 7, 16, 16, 7, 232487, tzinfo=UTC))


    @tag('slow')
    def test_process_ulog_file_not_supported(self):
        test_file = self.get_test_file(self.TEST_DATA['tlog1'])
        (fp, tm) = self.create_plan(test_file)
        self.assertRaisesMessage(Exception, "Invalid file format (Failed to parse header)", planner.tasks.process_ulog_file, fp, tm, test_file)
        telemetry = tm.telemetries.order_by('time')
        self.assertEqual(len(telemetry), 0)
