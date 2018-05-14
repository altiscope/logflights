# -*- coding: utf-8 -*-
from decimal import Decimal
from django.core.files.storage import default_storage
from django.contrib.auth.models import User
from django.test.utils import override_settings
from django.test import TestCase, tag
import json

from planner.models import Assessment, Operator, FlightPlan, WaypointMetadata, Waypoint
from planner.assessment import AssessmentService, Assess, run_assessment

class DummyAssessment(AssessmentService):
    _info = {
        'submit': False,
        'name': 'DummyAssessment',
        'short_name': 'dummy',
        'description': '{name}',
        'disclaimer': 'Don\'t use this in the wrong way',
        'region': [
            [(103.6182, 1.1992), (103.6182, 1.4706), (104.1125, 1.4706), (104.1125, 1.1992)]
        ],
        'country': [
            'US'
        ]
    }

    def assess(self, flight):
        # crunch numbers
        return {
            'success': True,
            'data': {
                'manufacturer': 'Airbus'
            }
        }

@override_settings(DEFAULT_FILE_STORAGE='django.core.files.storage.FileSystemStorage',
    MEDIA_ROOT='/tmp',
    ASSESSMENTS=['planner.tests.test_assessment.DummyAssessment'],
    SITE_NAME='foo')
class TestAssess(TestCase):
    def setUp(self):
        self._user = User.objects.create_user(
            username='airbus',
            email='info@airbus.com',
            password='setting_the_standards')
        self._operator = Operator.objects.create(
            user=self._user,
            organization='Airbus',
            mobile_number='+33581317500'
        )
        self._flight_plan = FlightPlan.objects.create(
            flight_id='test flight 1',
            operator=self._operator,
            payload_weight=0,
            pilot_name='Airbus',
            pilot_phone='+33581317500')
        self._flight_plan.waypoints = WaypointMetadata.objects.create(
            operator=self._operator,
            flight_plan = self._flight_plan,
            start_latitude = Decimal('37.47'),
            start_longitude = Decimal('-122.13'),
            country = 'US',
            location = 'East Palo Alto, CA, US',
            distance = 15530.851286,
        )
        self._flight_plan.save()
        Waypoint.objects.bulk_create([
            Waypoint(
                order = int(1),
                latitude = Decimal('37.47'),
                longitude =  Decimal('-122.13'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = self._flight_plan.waypoints
            ),
            Waypoint(
                order = int(2),
                latitude = Decimal('37.558117'),
                longitude =  Decimal('-122.266467'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = self._flight_plan.waypoints
            ),
        ])
        self._a = Assess()

    def test_dynamic_loading(self):
        d = self._a.get_by_name('dummy')
        self.assertEqual(d['name'], 'DummyAssessment')
        self.assertEqual(d['description'], 'foo')

    def test_get_all(self):
        d = self._a.get_all()
        self.assertEqual(len(d.items()), 1)
        self.assertEqual(d['dummy']['description'], 'foo')

    def test_is_eligible_country(self):
        d = self._a.is_eligible(self._flight_plan, 'dummy')
        self.assertTrue(d)

    def test_is_eligible_point(self):
        wm = self._flight_plan.waypoints
        wm.start_longitude = Decimal('103.843182')
        wm.start_latitude = Decimal('1.306932')
        wm.country = 'SG'
        wm.save()
        d = self._a.is_eligible(self._flight_plan, 'dummy')
        self.assertTrue(d)

    def test_is_eligible_fail(self):
        wm = self._flight_plan.waypoints
        wm.start_longitude = Decimal('104.052883')
        wm.start_latitude = Decimal('1.152096')
        wm.country = 'ID'
        wm.save()
        d = self._a.is_eligible(self._flight_plan, 'dummy')
        self.assertFalse(d)

    def test_get_eligible(self):
        d = self._a.get_eligible(self._flight_plan)
        self.assertEqual(len(d.items()), 1)
        self.assertEqual(d['dummy']['description'], 'foo')

    def test_run_assessment(self):
        a = Assessment.objects.create(flight_plan=self._flight_plan, name='dummy', klass='planner.tests.test_assessment.DummyAssessment')
        r = run_assessment(a.id)
        a = Assessment.objects.get(id=a.id)
        with default_storage.open(a.report, 'r') as f:
            j = json.load(f)
        self.assertEqual(r['success'], j['success'])
        self.assertEqual(r['data']['manufacturer'], j['data']['manufacturer'])
        self.assertEqual('Airbus', j['data']['manufacturer'])
        self.assertGreater(a.run_at, a.created_at)

    def test_run_and_get_assessment(self):
        a = Assessment.objects.create(flight_plan=self._flight_plan, name='dummy', klass='planner.tests.test_assessment.DummyAssessment')
        r = run_assessment(a.id)
        a = Assessment.objects.get(id=a.id)
        raw_report = self._a.get_assessment(a.id)
        j = json.loads(raw_report)
        self.assertEqual(r['success'], j['success'])
        self.assertEqual(r['data']['manufacturer'], j['data']['manufacturer'])
        self.assertEqual('Airbus', j['data']['manufacturer'])

    def test_assess_async(self):
        a_id = self._a.assess('dummy', self._flight_plan)
        self.assertIsNotNone(a_id)
        a = Assessment.objects.get(id=a_id)
        self.assertEqual(a.id, a_id)
        self.assertEqual(a.name, 'dummy')
        self.assertEqual(a.klass, 'planner.tests.test_assessment.DummyAssessment')
        self.assertEqual(a.state, a.STATE_PROCESSING)

    def test_assess_sync(self):
        a_id = self._a.assess('dummy', self._flight_plan, async=False)
        self.assertIsNotNone(a_id)
        a = Assessment.objects.get(id=a_id)
        self.assertEqual(a.id, a_id)
        self.assertEqual(a.klass, 'planner.tests.test_assessment.DummyAssessment')
        self.assertEqual(a.state, a.STATE_SUCCESS)
        raw_report = self._a.get_assessment(a.id)
        j = json.loads(raw_report)
        self.assertTrue(j['success'])
        self.assertEqual('Airbus', j['data']['manufacturer'])
