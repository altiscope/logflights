# -*- coding: utf-8 -*-
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.contrib.auth.models import User
from django.test.utils import override_settings
from django.test import TestCase, tag

from planner.models import Operator, FlightPlan, WaypointMetadata, Waypoint
from planner.helpers.geo import Geo

class TestGeo(TestCase):
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
            payload_weight=0)
        self._flight_plan.waypoints = WaypointMetadata.objects.create(
            operator=self._operator,
            flight_plan = self._flight_plan
        )
        self._flight_plan.save()
        self._region = [(103.6182, 1.1158), (103.6182, 1.4706), (104.4085, 1.4706), (104.4085, 1.1158)]

    def test_calc_distance(self):
        waypoints = [
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
        ]
        d = Geo.calc_distance(waypoints)
        self.assertAlmostEqual(d, 15530.851286)

    def test_calc_distance_multipoint(self):
        waypoints = [
            # Mt. Whitney
            Waypoint(
                order = int(1),
                latitude = Decimal('36.579'),
                longitude =  Decimal('-118.292'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = self._flight_plan.waypoints
            ),
            # Lone Pine
            Waypoint(
                order = int(2),
                latitude = Decimal('36.606'),
                longitude =  Decimal('-118.0638'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = self._flight_plan.waypoints
            ),
            # Owens Lake
            Waypoint(
                order = int(3),
                latitude = Decimal('36.433'),
                longitude =  Decimal('-117.951'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = self._flight_plan.waypoints
            ),
            # Beatty Junction
            Waypoint(
                order = int(4),
                latitude = Decimal('36.588'),
                longitude =  Decimal('-116.943'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = self._flight_plan.waypoints
            ),
            # Panama Mint Springs
            Waypoint(
                order = int(5),
                latitude = Decimal('36.34'),
                longitude =  Decimal('-117.468'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = self._flight_plan.waypoints
            ),
            # Badwater, Death Valley
            Waypoint(
                order = int(6),
                latitude = Decimal('36.24'),
                longitude =  Decimal('-116.832'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = self._flight_plan.waypoints
            ),
        ]
        d = Geo.calc_distance(waypoints)
        self.assertAlmostEqual(d, 246965.8524404)

    @tag('api_key')
    def test_get_location(self):
        w = Waypoint(
            order = int(1),
            latitude = Decimal('37.47'),
            longitude =  Decimal('-122.13'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        loc = Geo.get_location(w)
        self.assertEqual(loc['location'], 'East Palo Alto, CA, US')
        self.assertEqual(loc['country'], 'US')

    @tag('api_key')
    def test_get_location_hk(self):
        w = Waypoint(
            order = int(1),
            latitude = Decimal('22.2758835'),
            longitude =  Decimal('114.145532'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        loc = Geo.get_location(w)
        self.assertEqual(loc['location'], 'The Peak, Hong Kong')
        self.assertEqual(loc['country'], 'HK')

    @tag('api_key')
    def test_get_location_mw(self):
        w = Waypoint(
            order = int(1),
            latitude = Decimal('-13.016315'),
            longitude =  Decimal('33.466364'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        loc = Geo.get_location(w)
        self.assertEqual(loc['location'], 'Kasungu, Malawi')
        self.assertEqual(loc['country'], 'MW')

    @tag('api_key')
    def test_get_location_ca(self):
        w = Waypoint(
            order = int(1),
            latitude = Decimal('55.840543'),
            longitude =  Decimal('-108.416325'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        loc = Geo.get_location(w)
        self.assertEqual(loc['location'], 'Buffalo Narrows, SK, Canada')
        self.assertEqual(loc['country'], 'CA')

    @tag('api_key')
    def test_get_location_fr(self):
        w = Waypoint(
            order = int(1),
            latitude = Decimal('43.618664'),
            longitude =  Decimal('1.36056'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        loc = Geo.get_location(w)
        self.assertEqual(loc['location'], 'Toulouse, France')
        self.assertEqual(loc['country'], 'FR')

    @tag('api_key')
    def test_get_location_fr(self):
        w = Waypoint(
            order = int(1),
            latitude = Decimal('22.146795'),
            longitude =  Decimal('113.559762'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        loc = Geo.get_location(w)
        self.assertEqual(loc['location'], 'Macau')
        self.assertEqual(loc['country'], 'MO')

    def test_within(self):
        w = Waypoint(
            order = int(1),
            latitude = Decimal('1.306932'),
            longitude =  Decimal('103.843182'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        r = Geo.within(w.longitude, w.latitude, [self._region])
        self.assertTrue(r)

    def test_within_fail(self):
        w = Waypoint(
            order = int(1),
            latitude = Decimal('37.47'),
            longitude =  Decimal('-122.13'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        r = Geo.within(w.longitude, w.latitude, [self._region])
        self.assertFalse(r)
