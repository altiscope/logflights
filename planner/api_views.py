import coreapi
from django.core.files.storage import default_storage
from django_filters import rest_framework as django_filters
from django.core import serializers as s
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib.auth import update_session_auth_hash
from django.utils import dateparse
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.validators import validate_email
from django.db.models import Count, Case, Value, When
from django.db.models.functions import Lower
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db.models.query_utils import Q
from django.template import loader
from django.http import JsonResponse
from django.db import IntegrityError
from django.http import Http404

from datetime import datetime
from datetime import time

from rest_framework import viewsets
from rest_framework import generics
from rest_framework import mixins
from rest_framework import status
from rest_framework.decorators import action, detail_route, list_route, api_view
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS, AllowAny
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.schemas import AutoSchema
from rest_framework.reverse import reverse

from planner import assessment
from planner import models
from planner import serializers
from planner import tasks

router = DefaultRouter()
assessment = assessment.Assess()

class BaseViewset(mixins.CreateModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.ListModelMixin,
                  viewsets.GenericViewSet):
    pass


class IsOperator(IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return (hasattr(obj, 'operator') and
                request.user.is_authenticated and
                request.user.operator == obj.operator)

class IsOperatorForAssessment(IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return (hasattr(obj, 'operator') and
                request.user.is_authenticated and
                request.user.operator == obj.flight_plan.operator)

class IsOperatorOrReadOnly(IsOperator):
    def has_permission(self, request, view):
        return True  # We only want to limit object-level permission here

    def has_object_permission(self, request, view, obj):
        return (request.method in SAFE_METHODS or
                super(IsOperatorOrReadOnly, self).has_object_permission(request, view, obj))


class Vehicles(BaseViewset):
    serializer_class = serializers.VehicleSerializer
    permission_classes = (IsOperatorOrReadOnly,)
    filter_fields = ('state', 'operator', 'vehicle_type', 'manufacturer')
    queryset = models.Vehicle.objects.all()

    def filter_queryset(self, queryset):
        queryset = super(Vehicles, self).filter_queryset(queryset)
        user = self.request.user

        # For non-public pages each operator can only see the vehicles registered under it's own account.
        if user.is_authenticated:
            queryset = queryset.exclude(~Q(operator=user.operator))

        return queryset.order_by('-created_at')


    def is_serial_number_valid(self, serial_number):
        # Checks if the vehicle with the serial number exists in their deactivated list
        if models.Vehicle.objects.filter(
                    operator=self.request.user.operator,
                    serial_number=serial_number,
                    state=models.Vehicle.STATE_INACTIVE
                    ).exists():
            return False
        else:
            return True


    def create(self, request):
        serializer = self.serializer_class(data=self.request.data)
        if serializer.is_valid():
            serial_number = serializer.validated_data.get('serial_number')
            if self.is_serial_number_valid(serial_number):
                return super(Vehicles, self).create(request)
            else:
                vehicle_id = models.Vehicle.objects.get(
                    operator=self.request.user.operator,
                    serial_number=serial_number,
                    state=models.Vehicle.STATE_INACTIVE
                    ).id
                return Response({'message': "Vehicle exists with the same serial number", "vehicle_id": vehicle_id}, 422)
        else:
            return Response(serializer.errors)


router.register(r'vehicles', Vehicles, base_name='vehicle')


class AutoSchemaWithExtraFields(AutoSchema):
    def get_pagination_fields(self, path, method):
        fields = super(AutoSchemaWithExtraFields, self).get_pagination_fields(path, method)
        if path.endswith("uploads/init/") or path.endswith("set_upload_complete/"):
            fields += [
                coreapi.Field("id", location="query", description="The flight plan id", required=True),
                coreapi.Field("type", location="query", description="The type of file to be uploaded (waypoints/telemetry).", required=True),
                coreapi.Field("filename", location="query", description="The name of the file to be uploaded.", required=True),
                coreapi.Field("size", location="query", description="The size of the file (in bytes) to be uploaded.", required=True)
            ]

        if path.endswith("uploads/") and method == 'POST':
            fields.append(coreapi.Field("timestamp", location="query", description="The timestamp you got with the upload URL", required=True))

        if path.endswith("uploads/") and method == 'GET':
            fields += [
                coreapi.Field("id", location="query", description="The WaypointMetadata id", required=True),
                coreapi.Field("type", location="query", description="The type of file to be uploaded (waypoints/telemetry).", required=True),
            ]

        # For Search
        if path.endswith("search_flights/"):
            fields += [
                coreapi.Field("date_start", location="query", description="The start date",),
                coreapi.Field("date_end", location="query", description="The end date",),
                coreapi.Field("operator_id", location="query", description="The operator id",),
                # coreapi.Field("timezone", location="query", description="Timezone",),
            ]

        return fields


class FlightPlanFilterSet(django_filters.FilterSet):
    planned_departure_time_from = django_filters.DateTimeFilter(
        field_name='planned_departure_time', lookup_expr='gte')
    planned_departure_time_to = django_filters.DateTimeFilter(
        field_name='planned_departure_time', lookup_expr='lte')
    planned_arrival_time_from = django_filters.DateTimeFilter(
        field_name='planned_arrival_time', lookup_expr='gte')
    planned_arrival_time_to = django_filters.DateTimeFilter(
        field_name='planned_arrival_time', lookup_expr='lte')

    state = django_filters.BaseInFilter()

    class Meta:
        model = models.FlightPlan
        fields = [
            'operator', 'vehicle', 'state',
            'planned_departure_time_from', 'planned_departure_time_to',
            'planned_arrival_time_from', 'planned_arrival_time_to'
        ]


class FlightPlans(BaseViewset):
    serializer_class = serializers.FlightPlanPostSerializer
    permission_classes = (IsOperatorOrReadOnly, )
    filter_class = FlightPlanFilterSet
    queryset = models.FlightPlan.objects.all().exclude(state=models.FlightPlan.STATE_DELETED)
    schema = AutoSchemaWithExtraFields()

    def filter_queryset(self, queryset):
        queryset = super(FlightPlans, self).filter_queryset(queryset)
        user = self.request.user

        # For non-public pages each operator can only see the flight plans registered under it's own account.
        if user.is_authenticated:
            queryset = queryset.exclude(~Q(operator=user.operator))

        return queryset.order_by('-planned_departure_time')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return serializers.FlightPlanGetSerializer
        else:
            return serializers.FlightPlanPostSerializer

    @detail_route(methods=['get'], permission_classes=[IsOperator])
    def invalidate_flight_plan(self, request, *args, **kwargs):
        """
        Endpoint to invalidate flight plan
        """
        flightplan = self.get_object()
        if flightplan:
            flightplan.state = models.FlightPlan.STATE_INVALID
            flightplan.save()
        return Response({'success': True}, status=status.HTTP_200_OK)

    @detail_route(methods=['delete'], permission_classes=[IsOperator])
    def waypoint(self, request, *args, **kwargs):
        """
        Endpoint to remove waypoint
        """
        flightplan = self.get_object()
        if flightplan:
            wp = flightplan.waypoints
            flightplan.waypoints = None
            wp.delete()
            flightplan.save()
            return Response({'success': True}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid flight plan."}, status=status.HTTP_400_BAD_REQUEST)

    def _get_telemetry(self, fp, fields=None, filter=None):
        if fields is None:
            fields = ('time', 'latitude', 'longitude', 'altitude', 'batt', 'voltage')
        query = fp.telemetry.telemetries
        if filter:
            query = query.filter(filter)
        query = query.order_by('time')
        # whitelist fields for extraction
        serial = s.serialize('python', query, fields=fields)
        return [d['fields'] for d in serial]

    @detail_route(methods=['get'], url_name="download-telemetry")
    def download_telemetry(self, request, *args, **kwargs):
        """
        Endpoint to download telemetry
        """
        try:
            fp = self.get_object()
        except models.FlightPlan.DoesNotExist:
            raise Http404("Flight plan does not exist")
        telemetry_list = []
        if fp.telemetry:
            telemetry_list = self._get_telemetry(fp)
        resp = JsonResponse({'telemetry': telemetry_list}, content_type='application/json')
        resp["Content-Disposition"] = "attachment; filename=\"telemetry_" + fp.id + ".json\""
        return resp

    @list_route(methods=['post'], permission_classes=[IsOperator], url_path='uploads/init')
    def uploads_init(self, request, *args, **kwargs):
        id = request.data['params']['id'] or None
        type = request.data['params']['type'] or None
        path = None
        if type == 'waypoints':
            path = models.document_path(request.user.operator, request.data['params']['filename'])
        elif type == 'telemetry':
            flightplan = models.FlightPlan.objects.get(pk=id)

            if request.user.operator != flightplan.operator:
                return Response({'error': "Unauthorized"}, status=401)

            path = models.document_path(flightplan, request.data['params']['filename'])
        if path:
            origin = "http://localhost:3000" if settings.LOCAL_DEV else "%s://%s" % (request.scheme, request.get_host())
            return Response(data={
                "upload_url": default_storage.bucket.blob(path['path']).create_resumable_upload_session(
                    size=int(request.data['params']['size']),
                    origin=origin),
                "timestamp": path['timestamp']
            })
        return Response({"error": "Unknown type or id specified."}, status=404)

    @list_route(methods=['post', 'get'], permission_classes=[IsOperator])
    def uploads(self, request, *args, **kwargs):
        if (request.method == 'POST'):
            id = request.data['params']['id'] or None
            try:
                fp = models.FlightPlan.objects.get(pk=id)

                if request.user.operator != fp.operator:
                    return Response({'error': "Unauthorized"}, status=401)

            except models.FlightPlan.DoesNotExist:
                # on new flight plans, a temporary invalid ID
                fp = None
            type = request.data['params']['type'] or None
            path = None
            if type == 'waypoints':
                path = models.document_path(
                    request.user.operator,
                    request.data['params']['filename'],
                    timestamp=request.data['params']['timestamp']
                )
                wm = models.WaypointMetadata.objects.create(
                    operator=request.user.operator,
                    path=path['path'],
                    flight_plan=fp
                )
                tasks.process_waypoints.delay(wm.id)
                return Response({
                    "success": True,
                    "wm_id": wm.id,
                    "url": reverse("planner:plan-uploads", request=request)+"?id=%s&type=%s" % (wm.id, 'waypoints')
                }, status=200)
            elif type == 'waypoints_array':
                # Validate data
                for waypoint in request.data['params']['waypoints']:
                    data = {
                        'order': waypoint['order'],
                        'latitude': waypoint['latitude'],
                        'longitude': waypoint['longitude'],
                        'altitude_relative': waypoint['altitude_relative'],
                        'altitude': waypoint['altitude'],
                    }

                    serializer = serializers.WaypointSerializer(data=data)
                    if not serializer.is_valid():
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                # Create task
                wm = models.WaypointMetadata.objects.create(
                    operator=request.user.operator,
                    path=None,
                    flight_plan=fp,
                )
                tasks.process_waypoints.delay(wm.id, request.data['params']['waypoints'])
                return Response({
                    "success": True,
                    "wm_id": wm.id,
                    "url": reverse("planner:plan-uploads", request=request)+"?id=%s&type=%s" % (wm.id, 'waypoints')
                }, status=200)
            elif type == 'telemetry':
                path = models.document_path(
                    fp,
                    request.data['params']['filename'],
                    timestamp=request.data['params']['timestamp']
                )
                tm = models.TelemetryMetadata.objects.create(
                    flight_plan=fp,
                    path=path['path'],
                    state=models.TelemetryMetadata.STATE_UPLOADED
                )
                tasks.process_telemetry.delay(fp.id, tm.id)
                return Response({
                    "success": True,
                    "tm_id": tm.id,
                    "url": reverse("planner:plan-uploads", request=request)+"?id=%s&type=%s" % (tm.id, 'telemetry')
                }, status=200)
            if path is None or default_storage.exists(path['path']) is False:
                return Response({"error": "Unable to find uploaded file"}, status=400)
            return Response({"error": "There's no flight plan with id %d" % id}, status=404)
        elif request.method == 'GET':
            id = request.GET['id'] or None
            type = request.GET['type'] or None
            if type == 'waypoints':
                wm = models.WaypointMetadata.objects.get(id=id)
                if wm is None:
                    Response({"error": "Not found"}, status=404)
                return Response({"success": True, "id": id, "type": type, "state": wm.state, "error": wm.error_message})
            elif type == 'telemetry':
                tm = models.TelemetryMetadata.objects.get(id=id)
                if tm is None:
                    Response({"error": "Not found"}, status=404)
                return Response({"success": True, "id": id, "type": type, "state": tm.state, "error": tm.error_message})
            return Response({"error": "Invalid inputs"}, status=400)

    @detail_route(methods=["get"])
    def waypoints(self, *args, **kwargs):
        fp = self.get_object()
        return Response(data=serializers.WaypointMetadataSerializer(
            instance=fp.waypoints,
        ).data)

    @detail_route(methods=['get', 'delete'], permission_classes=[IsOperatorOrReadOnly])
    def telemetry(self, request, *args, **kwargs):
        """
        Endpoint to get or delete telemetry
        """
        if request.method == 'DELETE':
            flightplan = self.get_object()
            if flightplan:
                tm = flightplan.telemetry
                flightplan.telemetry = None
                tm.delete()
                flightplan.save()
                return Response({'success': True}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid flight plan'}, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == 'GET':
            fp = self.get_object()
            if fp.telemetry:
                telemetry = self._get_telemetry(
                        fp,
                        fields=('latitude', 'longitude'),
                        filter=Q(latitude__isnull=False) & Q(longitude__isnull=False)
                        )
                return Response(data=telemetry)
            return Response([])

    def _parse_date(self, s, field_name):
        date = dateparse.parse_date(s)
        # parse_date returns None if the string is incorrectly formatted,
        # and raises a ValueError if it's an invalid date (2017-11-42).
        # We just always want a ValueError if something is wrong.
        if not date:
            raise ValueError("Invalid %s, expected format: yyyy-mm-dd." % field_name)
        return date

    @list_route(methods=["get"], )
    def search_flights(self, request, *args, **kwargs):
        """
        Search endpoint
        """
        date_start = request.GET.get('date_start') or None
        date_end = request.GET.get('date_end') or None
        operator_id = request.GET.get('operator_id')
        query = models.FlightPlan.objects.filter(
            Q(state=models.FlightPlan.STATE_PLANNED) | Q(state=models.FlightPlan.STATE_COMPLETED),
            operator__is_test=False
        )

        if date_start and date_end:
            try:
                date_start = self._parse_date(date_start, "departure date")
                date_end = self._parse_date(date_end, "arrival date")
            except ValueError as e:
                return Response(status=400, data={"message": e.message})

            start_date = datetime.combine(date_start, time.min)
            end_date = datetime.combine(date_end, time.max)
            query = query.filter(
                Q(
                    # the departure time is in the time window (between the dates)
                    Q(planned_departure_time__gte=start_date,
                    planned_departure_time__lte=end_date)
                    |
                    # the arrival time is in the time window (between the dates)
                    Q(planned_arrival_time__gte=start_date,
                    planned_arrival_time__lte=end_date)
                    |
                    # the departure is before the window and arrival is after (window is inside of flight dates)
                    Q(planned_departure_time__lte=start_date,
                    planned_arrival_time__gte=end_date)
                )
            )


        if operator_id:
            query = query.filter(operator_id=operator_id)

        query = query.order_by('-planned_departure_time')
        return Response(data={"plans": serializers.FlightPlanGetSerializer(query, many=True).data})

    @action(detail=True, methods=['get'], permission_classes=[IsOperator])
    def assessments(self, request, *args, **kwargs):
        """ Retrieve the latest approved assessment, and the latest round of assessments
        """
        flightPlan = self.get_object()

        assessmentChoices = {}

        if 'get_eligible' in request.GET:
            assessmentChoices = assessment.get_eligible(flightPlan)
        elif 'eligible_assessments[]' in request.GET:
            try:
                for assessmentName in request.GET.getlist('eligible_assessments[]'):
                    assessmentChoices[assessmentName] = assessment.get_by_name(assessmentName)
            except:
                pass

        assessmentInfo = []
        for assessmentName, info in assessmentChoices.items():
            # Get all most recent approved assessemnts
            authorizationAssessmentsQuery = (models
                .Assessment
                .objects
                .filter(name=assessmentName, flight_plan=flightPlan, state__in=models.Assessment.STATES_AUTHORIZE)
                .order_by('-approved_at', '-run_at')
                .values('id', 'state', 'created_at', 'run_at', 'submitted_at', 'approved_at', 'error')
                )

            authorizationAssessments = []
            if authorizationAssessmentsQuery.count() > 0:
                authorizationAssessments = authorizationAssessmentsQuery
                for index, authorizationAssessment in enumerate(authorizationAssessments):
                    authorizationAssessments[index]['report'] = assessment.get_assessment(authorizationAssessment['id'])

            # Get last run assessment
            lastRunAssessmentQuery = (models
                .Assessment
                .objects
                .filter(name=assessmentName, flight_plan=flightPlan)
                .order_by('-run_at')
                .exclude(state__in=models.Assessment.STATES_AUTHORIZE)
                .values('id', 'state', 'created_at', 'run_at', 'submitted_at', 'approved_at', 'error')
                )

            lastRunAssessment = None
            if lastRunAssessmentQuery.count() > 0:
                lastRunAssessment = lastRunAssessmentQuery.first()
                lastRunAssessment['report'] = assessment.get_assessment(lastRunAssessment['id'])

            assessmentInfo.append({
                "info": info,
                "authorizationAssessments": authorizationAssessments,
                "lastRunAssessment": lastRunAssessment,
            })

        return Response(data={"assessmentInfo": assessmentInfo})



router.register(r'plans', FlightPlans, base_name='plan')


class MissionTypes(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.MissionTypeSerializer
    queryset = models.MissionType.objects.all()

router.register(r'mission_types', MissionTypes, 'mission_type')


class Operators(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.OperatorSerializer
    queryset = (models.Operator.objects
        .annotate(num_flights=Count('flightplan'))
        .filter(num_flights__gt=0, is_test=False, flightplan__state__in=[models.FlightPlan.STATE_COMPLETED, models.FlightPlan.STATE_PLANNED])
        .order_by(Lower('organization')))
    permission_classes = (IsOperatorOrReadOnly,)

router.register(r'operators', Operators, 'operator')


class Manufacturers(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.ManufacturerSerializer
    queryset = (
        models.Manufacturer
            .objects
            .order_by(Case(When(id__exact=0, then=Value('00000')), default=Lower('name')))
    )


router.register(r'manufacturers', Manufacturers, 'manufacturer')


class UserSignupView(generics.ListCreateAPIView):
    permission_classes = (AllowAny, )
    serializer_class = serializers.UserInfoSerializer
    queryset = models.Operator.objects.all()

    def create(self, request, *args, **kwargs):
        try:
            return super(UserSignupView, self).create(request, *args, **kwargs)
        except IntegrityError as e:
            content = {'error': "error %s" % str(e)}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)


class UserUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.UserUpdateSerializer
    queryset = models.Operator.objects.all()
    def update(self, request, *args, **kwargs):
        # Only allow updates to the currently logged in user
        instance = models.Operator.objects.get(user_id=request.user.id)
        serializer = serializers.UserUpdateSerializer(
            instance=instance,
            data=request.data
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(data=serializer.data)


@api_view(http_method_names=['GET', ])
def current_user_details(request):
    if request.auth:
        current_user = User.objects.get(username=request.user)
        operator = models.Operator.objects.get(user=current_user)
        user_details = {
           'username': current_user.username,
           'first_name': current_user.first_name,
           'last_name': current_user.last_name,
           'email': current_user.email,
           'id': current_user.id,
           'organization': operator.organization,
           'mobile_number': operator.mobile_number,
           'altitude_unit': operator.altitude_unit,
        }
    else:
        user_details = {'error': 'Unauthorized user - 403'}
    return Response(user_details)

class UpdatePassword(generics.UpdateAPIView):
    """
    An endpoint for changing password.
    """
    serializer_class = serializers.ChangePasswordSerializer
    model = get_user_model()
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        obj = self.request.user
        return obj

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            # make sure the user stays logged in
            update_session_auth_hash(request, self.object)
            return Response({'success': True}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPassword(generics.CreateAPIView):
    """
    Endpoint to get username or email for password reset
    """
    serializer_class = serializers.PasswordResetSerializer
    permission_classes = (AllowAny,)

    @staticmethod
    def validate_email_address(email):
        try:
            validate_email(email)
            return True
        except ValidationError:
            return False

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)


        if serializer.is_valid():
            data = serializer.data.get('email_or_username')
        else:
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

        if self.validate_email_address(data) is True:
            associated_users= get_user_model().objects.filter(Q(email=data) | Q(username=data))
            if associated_users.exists():
                for user in associated_users:
                    c = {
                        'email': user.email,
                        'domain': request.META['HTTP_HOST'],
                        'site_name': settings.SITE_NAME,
                        'uid': urlsafe_base64_encode(force_bytes(user.pk)).decode('utf-8'),
                        'user': user,
                        'token': default_token_generator.make_token(user),
                        'protocol': 'http',
                        'reset_url': '/accounts/reset-password/new/',
                        }
                    subject_template_name='account/email/password_reset_key_subject.txt'
                    email_template_name='account/password_reset_from_key.html'
                    subject = loader.render_to_string(subject_template_name, c)
                    # Email subject *must not* contain newlines
                    subject = ''.join(subject.splitlines())
                    email = loader.render_to_string(email_template_name, c)
                    try:
                        send_mail(subject, email, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
                    except Exception as e:
                        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response({'success': 'Email sent'}, status=status.HTTP_200_OK)
            return Response({'error': 'Username does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            '''
            If the input is an username, then the following code will lookup for users associated with that user.
            If found then an email will be sent to the user's address
            '''
            associated_users = get_user_model().objects.filter(username=data)
            if associated_users.exists():
                for user in associated_users:
                    c = {
                        'email': user.email,
                        'domain': request.META['HTTP_HOST'],
                        'site_name': settings.SITE_NAME,
                        'uid': urlsafe_base64_encode(force_bytes(user.pk)).decode('utf-8'),
                        'user': user,
                        'token': default_token_generator.make_token(user),
                        'protocol': 'http',
                        'reset_url': '/accounts/reset-password/new/',
                        }
                    subject_template_name = 'account/email/password_reset_key_subject.txt'
                    email_template_name = 'account/password_reset_from_key.html'
                    subject = loader.render_to_string(subject_template_name, c)
                    # Email subject *must not* contain newlines
                    subject = ''.join(subject.splitlines())
                    email = loader.render_to_string(email_template_name, c)
                    try:
                        send_mail(subject, email, settings.DEFAULT_FROM_EMAIL , [user.email], fail_silently=False)
                    except Exception as e:
                        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response({ 'success': 'Email sent' }, status=status.HTTP_200_OK)
            return Response({ 'error': 'Username does not exist'}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordConfirm(generics.CreateAPIView):
    """
    Endpoint to confirm password reset
    """
    serializer_class = serializers.SetPasswordSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *arg, **kwargs):
        UserModel = get_user_model()
        serializer = self.get_serializer(request.data)
        uidb64 = kwargs['uidb64']
        token = kwargs['token']

        # assert uidb64 is not None and token is not None  # checked by URLconf
        try:
            uid = urlsafe_base64_decode(uidb64).decode('utf-8')
            user = UserModel._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            new_password = serializer.data['new_password2']
            copy = serializer.data['new_password1']
            if new_password == copy :
                user.set_password(new_password)
                user.save()
                return Response({'success': True}, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

class Waypoints(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.WaypointSerializer
    permission_classes = (IsOperator,)

    def retrieve(self, request, *arg, **kwargs):
        wm = models.WaypointMetadata.objects.get(id=kwargs.get('pk'))
        if self.check_object_permissions(request, wm):
            return Response({'error': "Unauthorized"}, status=401)

        queryset = models.Waypoint.objects.filter(waypoint_metadata_id=kwargs.get('pk')).order_by('order')
        return Response(data={
            "waypoints": serializers.WaypointSerializer(queryset, many=True).data,
        })

router.register(r'waypoints', Waypoints, 'waypoints')

class Assessments(mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet):

    permission_classes = (IsOperatorForAssessment,)
    serializer_class = serializers.AssessmentSerializer
    queryset = models.Assessment.objects.all()

    def create(self, request, *args, **kwargs):
        """ Prepare to assess a flight plan
        """
        try:
            flightPlanId = request.data['flight_plan_id']
            flightPlan = models.FlightPlan.objects.get(pk=flightPlanId)
            assessment_id = assessment.assess(request.data['short_name'], flightPlan)
        except:
            return Response({'error': "Error assessing flight plan"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'assessment_id': assessment_id}, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        """ Update state to states like submitting or canceling an authorizated, otherwise refresh
        """
        state = request.data['state'] if 'state' in request.data else None
        obj = self.get_object()
        if state == models.Assessment.STATE_SUBMITTING:
            # Submit
            serializer = serializers.AssessmentCreateSerializer(instance=obj.flight_plan, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            try:
                assessment.set_assessment_state(obj, models.Assessment.STATE_SUBMITTING)
            except:
                return Response({'error': 'Error submitting'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'success': True}, status=status.HTTP_205_RESET_CONTENT)

        elif state == models.Assessment.STATE_CANCEL_REQUEST:
            # Cancel
            try:
                assessment.set_assessment_state(obj, models.Assessment.STATE_CANCEL_REQUEST)
            except:
                return Response({'error': 'Error cancelling'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'success': True}, status=status.HTTP_205_RESET_CONTENT)
        else:
            # Refresh the assessment's state
            try:
                assessment_id = assessment.assess(obj.name, obj.flight_plan)
            except:
                return Response({'error': "Error assessing flight plan"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'assessment_id': assessment_id}, status=status.HTTP_205_RESET_CONTENT)
        return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

router.register(r'assessments', Assessments, 'assessments')
