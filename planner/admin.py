# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
import models

# Register your models here.
class OperatorAdmin(admin.ModelAdmin):
    list_display = ["user", "organization", "mobile_number", "is_test"]

class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ["name"]

class VehicleAdmin(admin.ModelAdmin):
    list_display = ["created_at", "model", "serial_number", "vehicle_type", "empty_weight"]

class MissionTypeAdmin(admin.ModelAdmin):
    list_display = ["title"]

class FlightPlanAdmin(admin.ModelAdmin):
    list_display = ["state", "flight_id", "waypoints", "planned_departure_time", "planned_arrival_time", "payload_weight", "created_at"]
    search_fields = ["id"]

class WaypointMetadataAdmin(admin.ModelAdmin):
    list_display = ["id", "flight_plan_id", "state", "processor", "path"]

class WaypointAdmin(admin.ModelAdmin):
    list_display = ["waypoint_metadata_id", "order", "latitude", "longitude", "altitude_relative"]
    search_fields = ["waypoint_metadata__id"]
    ordering = ['waypoint_metadata_id', 'order']

class TelemetryMetadataAdmin(admin.ModelAdmin):
    list_display = ["id", "flight_plan_id", "state", "vehicle_type", "actual_departure_time", "actual_arrival_time", "processor", "path"]
    search_fields = ["flight_plan__id"]

class TelemetryAdmin(admin.ModelAdmin):
    list_display = ["telemetry_metadata_id", "time", "latitude", "longitude", "altitude"]
    search_fields = ["telemetry_metadata__id"]

admin.site.register(models.Operator, OperatorAdmin)
admin.site.register(models.Manufacturer, ManufacturerAdmin)
admin.site.register(models.Vehicle, VehicleAdmin)
admin.site.register(models.MissionType, MissionTypeAdmin)
admin.site.register(models.FlightPlan, FlightPlanAdmin)
admin.site.register(models.WaypointMetadata, WaypointMetadataAdmin)
admin.site.register(models.Waypoint, WaypointAdmin)
admin.site.register(models.TelemetryMetadata, TelemetryMetadataAdmin)
admin.site.register(models.Telemetry, TelemetryAdmin)
