# -*- coding: utf-8 -*-
from decimal import Decimal
from django.apps import apps
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.test.utils import override_settings
from django.test import TestCase, tag

from django.contrib.auth.models import User
from planner.models import Assessment, Operator, FlightPlan, WaypointMetadata, Waypoint

from importlib import import_module
mig0010 = import_module('planner.migrations.0010_geo_fields')

class TestMigrations(TestCase):

    def test_0010_flight_geo_meta(self):
        user = User.objects.create_user(
            username='airbus',
            email='info@airbus.com',
            password='setting_the_standards')
        operator = Operator.objects.create(
            user=user,
            organization='Airbus',
            mobile_number='+33581317500'
        )
        flight_plan = FlightPlan.objects.create(
            flight_id='test flight 1',
            operator=operator,
            waypoints=None,
            payload_weight=0)
        flight_plan.waypoints = WaypointMetadata.objects.create(
            operator=operator,
            flight_plan = flight_plan
        )
        flight_plan.save()
        id = flight_plan.id
        waypoints = [
            Waypoint(
                order = int(1),
                latitude = Decimal('37.47'),
                longitude =  Decimal('-122.13'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = flight_plan.waypoints
            ),
            Waypoint(
                order = int(2),
                latitude = Decimal('37.558117'),
                longitude =  Decimal('-122.266467'),
                altitude_relative = float(200*12*2.54),
                waypoint_metadata = flight_plan.waypoints
            ),
        ]
        Waypoint.objects.bulk_create(waypoints)

        # simulate migration activity
        mig0010.add_flight_metadata(apps, None)

        fp = FlightPlan.objects.get(id=id)

        self.assertEqual(fp.waypoints.start_longitude, Decimal('-122.13'))
        self.assertEqual(fp.waypoints.start_latitude, Decimal('37.47'))
        self.assertEqual(fp.waypoints.country, 'US')
        self.assertEqual(fp.waypoints.location, 'East Palo Alto, CA, US')
        self.assertAlmostEqual(fp.waypoints.distance, 15530.851286)
