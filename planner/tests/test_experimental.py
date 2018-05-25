# -*- coding: utf-8 -*-
import json
from datetime import datetime
import pytz
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import force_authenticate, APIRequestFactory
from planner.api_views import FlightPlanExport, FlightPlanExportDetail
from planner.models import Operator, Vehicle, FlightPlan, WaypointMetadata, Waypoint, TelemetryMetadata, Telemetry, Manufacturer
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .utils import create_user_operator
from waffle.models import Flag

class FlightPlanExportAPI(TestCase):
    def setUp(self):
        self._user, self._operator = create_user_operator()
        self._user_token, created = Token.objects.get_or_create(user=self._user)
        # add user to flag group
        flag = Flag.objects.create(name='experimental_api')
        flag.users.add(self._user)
        manufacturer, created = Manufacturer.objects.get_or_create(name="EcoSoar")
        self._vehicle = Vehicle.objects.create(
            operator=self._operator,
            manufacturer=manufacturer,
            model= "01",
            serial_number="EcoMUST",
            vehicle_type=2,
            empty_weight=1.4
        )
        self._flight_plan = FlightPlan.objects.create(
            flight_id='test_flight_1',
            vehicle=self._vehicle,
            operator=self._operator,
            payload_weight=0)
        self._flight_plan.waypoints = WaypointMetadata.objects.create(
            operator=self._operator,
            flight_plan = self._flight_plan,
            country = 'MW',
            location = 'Malawi'
        )
        self._flight_plan.save()
        self._waypoint1 = Waypoint.objects.create(
            order = int(1),
            latitude = Decimal('-13.016315'),
            longitude =  Decimal('33.466364'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        self._waypoint2 = Waypoint.objects.create(
            order = int(2),
            latitude = Decimal('-13.02'),
            longitude =  Decimal('33.3'),
            altitude_relative = float(200*12*2.54),
            waypoint_metadata = self._flight_plan.waypoints
        )
        self._flight_plan.telemetry = TelemetryMetadata.objects.create(
            flight_plan = self._flight_plan,
            country = 'MW',
            location = 'Malawi'
        )
        self._flight_plan.save()
        self._telemetry1 = Telemetry.objects.create(
            time = datetime.now(pytz.utc),
            latitude = Decimal('-13.016315'),
            longitude =  Decimal('33.466364'),
            altitude_relative = float(200*12*2.54),
            telemetry_metadata = self._flight_plan.telemetry
        )
        self._waypointtelemetry2 = Telemetry.objects.create(
            time = datetime.now(pytz.utc),
            latitude = Decimal('-13.02'),
            longitude =  Decimal('33.3'),
            altitude_relative = float(200*12*2.54),
            telemetry_metadata = self._flight_plan.telemetry
        )
        self._waypointtelemetry3 = Telemetry.objects.create(
            time = datetime.now(pytz.utc),
            latitude = None,
            longitude =  None,
            altitude_relative = float(190*12*2.54),
            telemetry_metadata = self._flight_plan.telemetry
        )

    def test_list(self):
        # Make an authenticated request to the view...
        view = FlightPlanExport.as_view({'get': 'list'})
        factory = APIRequestFactory()
        request = factory.get('/api/experimental/list')
        force_authenticate(request, user=self._user, token=self._user_token)
        response = view(request)
        raw = dict(response.data)
        result_json = json.dumps(raw, default=str)
        result = json.loads(result_json)
        self.assertEqual(result['count'], 1)


    def test_detail(self):
        # Make an authenticated request to the view...
        view = FlightPlanExportDetail.as_view({'get': 'retrieve'})
        factory = APIRequestFactory()
        flight_plan_id = self._flight_plan.id
        request = factory.get('/api/experimental/flight/{}'.format(flight_plan_id))
        force_authenticate(request, user=self._user, token=self._user_token)
        response = view(request, pk=flight_plan_id)
        raw = dict(response.data)
        result_json = json.dumps(raw, default=str)
        result = json.loads(result_json)
        self.assertEqual(result['id'], flight_plan_id)
        # check that null telemetries are excluded
        self.assertEqual(len(result['telemetry']), 2)
