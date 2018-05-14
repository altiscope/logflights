from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model

from rest_framework import serializers

from planner import tasks
from . models import *

class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = ("id", "name")


class VehicleSerializer(serializers.ModelSerializer):
    manufacturer = serializers.SlugRelatedField(queryset=Manufacturer.objects.all(), slug_field="name")
    operator = serializers.StringRelatedField(read_only=True)
    state = serializers.CharField(default=Vehicle.STATE_ACTIVE)

    class Meta:
        model = Vehicle
        fields = ("id", "serial_number", "vehicle_type", "model", "operator",
                  "manufacturer", "manufacturer_id", "empty_weight", "state",)

    def save(self, **kwargs):
        kwargs.update({
            "operator": self.context["request"].user.operator
        })
        return super(VehicleSerializer, self).save(**kwargs)


class OperatorVehicleField(serializers.PrimaryKeyRelatedField):
    """Field that limits the possible values to those, operated by the user's operator"""

    def get_queryset(self):
        queryset = Vehicle.objects.all()
        if "request" in self.context and self.context["request"].user:
            queryset = queryset.filter(operator=self.context["request"].user.operator)

        return queryset


class MissionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MissionType
        fields = ("id", "title")


class WaypointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Waypoint
        fields = ("order", "latitude", "longitude", "altitude", "altitude_relative")
        ordering = ('order',)

class WaypointMetadataSerializer(serializers.ModelSerializer):
    waypoints = WaypointSerializer(many=True)

    class Meta:
        model = WaypointMetadata
        fields = ('id', 'path', 'state', 'processor', 'v_cruise', 'v_hover', 'error_message', 'waypoints')

class WaypointMetadataDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = WaypointMetadata
        fields = ('id', 'path', 'state', 'processor', 'v_cruise', 'v_hover', 'error_message')


class FlightPlanPostSerializer(serializers.ModelSerializer):
    mission_type = serializers.SlugRelatedField(queryset=MissionType.objects.all(), slug_field="title")
    operator = serializers.StringRelatedField()
    vehicle = OperatorVehicleField(required=True, write_only=True)

    class Meta:
        model = FlightPlan
        fields = ("id", "operator", "state", "mission_type", "flight_id",
                  "planned_departure_time", "planned_arrival_time", "vehicle","vehicle_id",
                  "payload_weight", "mission_type", "waypoints")

    def save(self, **kwargs):
        kwargs.update({
            "operator": self.context["request"].user.operator
        })

        existing_wp = None
        if self.instance and self.instance.waypoints:
            existing_wp = self.instance.waypoints.id

        ret = super(FlightPlanPostSerializer, self).save(**kwargs)
        if existing_wp:
            tasks.process_waypoints(existing_wp)
        return ret


class TelemetrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Telemetry
        fields = ['id','time', 'latitude', 'longitude', 'altitude',
                  'altitude_relative',
                  'heading', 'vx', 'vy', 'vz', 'batt', 'voltage', 'current']

class TelemetryMetadataSerializer(serializers.ModelSerializer):
    telemetries = TelemetrySerializer(many=True)
    class Meta:
        model = TelemetryMetadata
        fields = ['id', 'state', 'processor', 'actual_departure_time',
                  'actual_arrival_time', 'autopilot_name', 'autopilot_version', 'vehicle_type', 'telemetries',]


class TelemetryMetadataDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelemetryMetadata
        fields = ['id', 'state', 'processor','path','error_message', 'actual_departure_time',
                  'actual_arrival_time', 'autopilot_name', 'autopilot_version', 'vehicle_type',]


# Serializer to be used for GET request, serializes the vehicles and waypoint details
class FlightPlanGetSerializer(FlightPlanPostSerializer):
    vehicle = VehicleSerializer(read_only=True)
    waypoints = WaypointMetadataDetailSerializer(read_only=True)
    telemetry = TelemetryMetadataDetailSerializer()

    class Meta(FlightPlanPostSerializer.Meta):
        fields = FlightPlanPostSerializer.Meta.fields + ('telemetry',)


class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operator
        fields = ["id", "organization", "mobile_number"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'email','first_name', 'last_name', 'groups', 'operator',)


class UserInfoSerializer(serializers.HyperlinkedModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Operator
        fields = ('first_name', 'last_name', 'email',
            'password', 'organization', 'mobile_number')

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        mobile_number = validated_data.pop('mobile_number')
        organization = validated_data.pop('organization')

        user = User.objects.create(
            first_name=first_name,
            last_name=last_name,
            username=email,
            email=email)

        user.set_password(password)
        user.save()

        operator = Operator.objects.create(user=user,
            mobile_number=mobile_number, organization=organization)

        return operator

    def update_or_create_operator(self, user, operator_data):
        user_obj = Operator.objects.get(organization=user).user
        # Update operator info based on user info supplied
        Operator.objects.update_or_create(user=user_obj, defaults=operator_data)


class UserUpdateSerializer(serializers.HyperlinkedModelSerializer):
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.CharField(write_only=True, required=False)
    altitude_unit = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Operator
        fields = ('email', 'first_name', 'last_name', 'organization', 'mobile_number', 'altitude_unit')

    def to_representation(self, instance):
        result = super(UserUpdateSerializer, self).to_representation(instance)
        result['id'] = instance.user_id
        result['first_name'] = instance.user.first_name
        result['last_name'] = instance.user.last_name
        result['email'] = instance.user.email
        result['username'] = instance.user.username
        result['altitude_unit'] = instance.altitude_unit
        return result

    def update(self, instance, validated_data):
        """
        Update and return an existing user the validated data.
        """
        if 'organization' in validated_data:
            instance.organization = validated_data.get('organization', instance.organization)
        if 'mobile_number' in validated_data:
            instance.mobile_number = validated_data.get('mobile_number', instance.mobile_number)
        if 'altitude_unit' in validated_data:
            instance.altitude_unit = validated_data.get('altitude_unit', instance.altitude_unit)
        instance.save()

        user_obj = instance.user
        if 'first_name' in validated_data:
            user_obj.first_name = validated_data.get('first_name', user_obj.first_name)
        if 'last_name' in validated_data:
            user_obj.last_name = validated_data.get('last_name', user_obj.last_name)
        if 'email' in validated_data:
            user_obj.email = validated_data.get('email', user_obj.email)
        user_obj.save()

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True, label=("Old Password"))
    new_password = serializers.CharField(required=True, label=('New Password'))

    def validate_new_password(self, value):
        validate_password(value)
        return value


class PasswordResetSerializer(serializers.Serializer):
    email_or_username = serializers.CharField(label=("Email Or Username"), max_length=254)


class SetPasswordSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(label=("New password"), required=True)
    new_password2 = serializers.CharField(label=("New password confirmation"), required=True)

    def validate_data(self, data):
        """
        Validate that both the passwords match
        """
        if data['new_password2'] != data['new_password1']:
            raise serializers.ValidationError("Passwords do not match")
        return data


class CloneFlightSerializer(serializers.Serializer):
    flight_id = serializers.CharField(label=("Flight Id"), required=True)


