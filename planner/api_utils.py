from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import generics
from django.utils.functional import SimpleLazyObject
from django.contrib.auth.middleware import get_user

from .models import FlightPlan
from . import serializers
from .api_views import IsOperator

class CloneFlightPlan(generics.CreateAPIView):
    """
    clones an existing flight plan
    """
    serializer_class = serializers.CloneFlightSerializer
    permission_classes = (IsOperator,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            flight_id = serializer.data.get('flight_id')
        flight_plan = FlightPlan.objects.filter(id=kwargs.get('id'))
        if not flight_plan:
            feedback = {"error": "Bad request: 404"}
            return Response(feedback)
        try:
            flight_plan_clone = FlightPlan(
                state='planned',
                flight_id=flight_id,
                waypoints=flight_plan[0].waypoints or None,
                payload_weight=flight_plan[0].payload_weight or None,
                vehicle=flight_plan[0].vehicle or None,
                mission_type=flight_plan[0].mission_type or None,
                operator=request.user.operator,
                planned_departure_time=flight_plan[0].planned_departure_time,
                planned_arrival_time=flight_plan[0].planned_arrival_time,
                )
            flight_plan_clone.save()
            return Response(data=serializers.FlightPlanGetSerializer(instance=flight_plan_clone).data)
        except Exception as e:
            feedback = {"error": str(e)}
            return Response(feedback)

def get_user_jwt(request):
    user = get_user(request)
    if user.is_authenticated():
        return user
    try:
        user_jwt = JSONWebTokenAuthentication().authenticate(Request(request))
        if user_jwt is not None:
            return user_jwt[0]
    except:
        pass
    return user


class AuthenticationMiddlewareJWT(object):
    def process_request(self, request):
        assert hasattr(request, 'session'), "The Django authentication middleware requires session middleware to be installed. Edit your MIDDLEWARE_CLASSES setting to insert 'django.contrib.sessions.middleware.SessionMiddleware'."

        request.user = SimpleLazyObject(lambda: get_user_jwt(request))

