# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from datetime import datetime
from datetime import time
import os
from pytz import UTC

from django.template import loader
from django.core import serializers
from django.core.files.storage import default_storage
from django.core.urlresolvers import reverse
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import F, Q, Count, FloatField
from django.db.models.functions import Cast
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse, Http404
from django.shortcuts import render, redirect
from django.utils import dateparse
from django.views.decorators.csrf import csrf_exempt

from health_check.views import MainView
from tasks import process_waypoints, process_telemetry

from .models import Operator, Manufacturer, Vehicle, MissionType, FlightPlan, \
    Waypoint, WaypointMetadata, TelemetryMetadata, \
    document_path
from .forms import VehicleForm, FlightPlanForm, EditProfileForm, ChangePasswordForm
from .utils import get_terms_data

def terms(request, name):
    """Render tos markdown data to page"""
    return render(request, 'planner/markdown_generic.html',
        {'markdown_text': get_terms_data(name)})

def welcome(request):
    # Only show operators that have at least 1 planned flight
    operators = Operator.objects.annotate(num_flights=Count('flightplan')).filter(num_flights__gt=0, is_test=False)
    flightplans = FlightPlan.objects.filter(
        Q(state=FlightPlan.STATE_PLANNED) | Q(state=FlightPlan.STATE_COMPLETED),
        operator__is_test=False
    ).order_by('-planned_departure_time')
    return render(request, 'planner/welcome.html',{'operators': operators, 'flightplans': flightplans})

@login_required
def vehicle(request):
    if request.user.operator:
        vehicle_query = Vehicle.objects.filter(operator=request.user.operator).order_by('-created_at')
        active_vehicles = vehicle_query.filter(state=Vehicle.STATE_ACTIVE)
        inactive_vehicles = vehicle_query.filter(state=Vehicle.STATE_INACTIVE)
        return render(request, 'planner/vehicle_details.html', {
            'vehicles': {
                'active' : active_vehicles,
                'inactive': inactive_vehicles,
            }
        })

    return render(request, 'planner/vehicle_details.html', {'errormsg': 'User must have an operator!'})

@login_required
def create_vehicle(request):
    if request.method == 'POST':
        form = VehicleForm(request.POST)
        if form.is_valid():
            if request.user.operator:
                instance = form.save(commit=False)
                instance.operator = request.user.operator
                instance.save()
                return HttpResponseRedirect(reverse('planner:vehicle'))
            else:
                return render(request, 'planner/create_vehicle.html', {'form':form, 'errormsg': 'User must have an operator!'})
        else:
            return render(request, 'planner/create_vehicle.html', {'form':form})

    form = VehicleForm()
    return render(request, 'planner/create_vehicle.html', {'form':form})

@login_required
def update_vehicle(request, id):
    try:
        vehicle = Vehicle.objects.get(id=id)
    except Vehicle.DoesNotExist:
        raise Http404("Vehicle does not exist")
    if request.method == "POST":
        form = VehicleForm(request.POST ,instance=vehicle)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('planner:vehicle'))
        return render(request, 'planner/create_vehicle.html', {'form':form})

    form = VehicleForm(instance=vehicle)
    return render(request, 'planner/create_vehicle.html', {'form':form})


@login_required
def flightplan(request):
    if not request.user.operator:
        return render(request, 'planner/flightplan_details.html', {'errormsg': 'User must have an operator!'})
    operator_plans = FlightPlan.objects.filter(operator=request.user.operator)

    planned_flightplan = operator_plans.filter(Q(state=FlightPlan.STATE_PLANNED) | Q(state= FlightPlan.STATE_COMPLETED)).order_by('-planned_departure_time')
    invalid_flightplan = operator_plans.filter(state=FlightPlan.STATE_INVALID).order_by('-planned_departure_time')

    return render(request, 'planner/flightplan_details.html', {
        'flightplans' : planned_flightplan,
        'invalid_flightplan' : invalid_flightplan,
    })

def _get_flight_plan_form(form, params = {}):
    base = {
        'form':form,
        'upload_url_endpoint': reverse('planner:get_upload_url'),
        'upload_done_endpoint': reverse('planner:set_upload_complete')
    }
    return dict(base.items() + params.items())

def _update_flight_plan(request, fp=None):
    form = FlightPlanForm(request.user, request.POST, instance=fp)
    if form.is_valid():
        if not request.user.operator:
            return render(request,
                'planner/create_flight_plan.html',
                _get_flight_plan_form(form, {'errormsg': 'User must have an operator!'})
            )
        instance = form.save(commit=False)
        instance.operator = request.user.operator
        try:
            wm = WaypointMetadata.objects.get(id=form.cleaned_data['wm_id'])
        except WaypointMetadata.DoesNotExist:
            wm = None
        if wm is not None and wm.operator != request.user.operator:
            return render(request,
                'planner/create_flight_plan.html',
                _get_flight_plan_form(form, {'errormsg': 'Only waypoints you own can be used with your flight plan!'})
            )
        instance.waypoints = wm
        instance.save()
        if wm is not None:
            wm.flight_plan = instance
            wm.save()
        return HttpResponseRedirect(reverse('planner:flightplan'))
    else:
        return render(request, 'planner/create_flight_plan.html', _get_flight_plan_form(form))

@login_required
def create_flight_plan(request):
    if request.method == 'POST':
        return _update_flight_plan(request)
    form = FlightPlanForm(request.user)
    return render(request, 'planner/create_flight_plan.html', _get_flight_plan_form(form))

@login_required
def update_flight_plan(request, id):
    try:
        flightplan = FlightPlan.objects.get(id=id)
    except FlightPlan.DoesNotExist:
        raise Http404("Flight plan does not exist")
    if request.method == "POST":
        return _update_flight_plan(request, flightplan)
    form = FlightPlanForm(request.user, instance=flightplan)
    return render(request, 'planner/create_flight_plan.html', _get_flight_plan_form(form))


@login_required
def invalidate_flight_plan(request, id):
    flightplan = FlightPlan.objects.get(pk=id)
    if flightplan:
        flightplan.state = FlightPlan.STATE_INVALID
        flightplan.save()
    return HttpResponseRedirect(reverse('planner:flightplan'))

@csrf_exempt
def detail_flight_plan(request, id):
    try:
        fp = FlightPlan.objects.get(pk=id)
    except FlightPlan.DoesNotExist:
        raise Http404("Flight plan does not exist")
    waypoints = []
    if fp.waypoints is not None:
        waypoints = list(
            fp.waypoints.waypoints.all().order_by('order')
                .annotate(altitude_m=Cast(F('altitude')/100.0, FloatField()))
                .annotate(altitude_relative_m=Cast(F('altitude_relative')/100.0, FloatField()))
                .values('latitude', 'longitude', 'altitude_m', 'altitude_relative_m')
        )
    return render(request, 'planner/detail_flight_plan.html', {
        'flightplan': fp,
        'waypoints': waypoints,
        'upload_url_endpoint': reverse('planner:get_upload_url'),
        'upload_done_endpoint': reverse('planner:set_upload_complete')
    })

@login_required()
def get_upload_url(request):
    id = request.GET['id'] or None
    type = request.GET['type'] or None
    path = None
    if type == 'waypoints':
        path = document_path(request.user.operator, request.GET['filename'])
    elif type == 'telemetry':
        flightplan = FlightPlan.objects.get(pk=id)
        path = document_path(flightplan, request.GET.get('filename'))
    if path:
        return JsonResponse(data={
            "upload_url": default_storage.bucket.blob(path['path']).create_resumable_upload_session(
                size=int(request.GET['size']),
                origin="%s://%s" % (request.scheme, request.get_host())),
            "timestamp": path['timestamp']
        })
    return JsonResponse({"error": "Unknown type or id specified."}, status=404)

@login_required()
def set_upload_complete(request):
    id = request.GET['id'] or None
    try:
        fp = FlightPlan.objects.get(pk=id)
    except FlightPlan.DoesNotExist:
        # on new flight plans, forms provide a temporary invalid ID
        fp = None
    type = request.GET['type'] or None
    path = None
    if type == 'waypoints':
        path = document_path(
            request.user.operator,
            request.GET['filename'],
            timestamp=request.GET.get("timestamp")
        )
        wm = WaypointMetadata.objects.create(
            operator = request.user.operator,
            path = path['path'],
            flight_plan = fp
        )
        process_waypoints.delay(wm.id)
        return JsonResponse({
            "success": True,
            "wm_id": wm.id,
            "url": reverse('planner:get_upload_state', kwargs={'type':'waypoints', 'id':wm.id})
        }, status=200)
    elif type == 'telemetry':
        path = document_path(
            fp,
            request.GET.get('filename'),
            timestamp=request.GET.get("timestamp")
        )
        tm = TelemetryMetadata.objects.create(
            flight_plan=fp,
            path=path['path'],
            state=TelemetryMetadata.STATE_UPLOADED
        )
        process_telemetry.delay(fp.id, tm.id)
        return JsonResponse({
            "success": True,
            "tm_id": tm.id,
            "url": reverse('planner:get_upload_state', kwargs={'type':'telemetry', 'id':tm.id})
        }, status=200)
    if path is None or default_storage.exists(path['path']) is False:
        return JsonResponse({"error": "Unable to find uploaded file"}, status=400)
    return JsonResponse({"error": "There's no flight plan with id %d" % id}, status=404)

@login_required()
def get_upload_state(request, type, id):
    if type == 'waypoints':
        wm = WaypointMetadata.objects.get(id=id)
        if wm is None:
            JsonResponse({"error": "Not found"}, status=404)
        return JsonResponse({"success": True, "id": id, "type": type, "state": wm.state, "error": wm.error_message})
    elif type == 'telemetry':
        tm = TelemetryMetadata.objects.get(id=id)
        if tm is None:
            JsonResponse({"error": "Not found"}, status=404)
        return JsonResponse({"success": True, "id": id, "type": type, "state": tm.state, "error": tm.error_message})
    return JsonResponse({"error": "Invalid inputs"}, status=400)

def _get_telemetry(fp, fields=None, filter=None):
    if fields is None:
        fields = ('time', 'latitude', 'longitude', 'altitude')
    query = fp.telemetry.telemetries
    if filter:
        query = query.filter(filter)
    query = query.order_by('time')
    serial = serializers.serialize('python',
        query,
        # whitelist fields for extraction
        fields=fields
        )
    return [d['fields'] for d in serial]


def get_flight_plan_data(request, id):
    try:
        fp = FlightPlan.objects.get(pk=id)
    except FlightPlan.DoesNotExist:
        return JsonResponse({"error": "There's no flight plan with id %d" % id}, status=404)
    waypoints, telemetry = [], []
    if fp.waypoints is not None:
        waypoints = list(fp.waypoints.waypoints.all().order_by('order').values('latitude', 'longitude'))
    try:
        if fp.telemetry is not None:
            telemetry = _get_telemetry(
                fp,
                fields=('latitude', 'longitude'),
                filter=Q(latitude__isnull=False) & Q(longitude__isnull=False)
                )
    except Exception as e:
        pass

    return JsonResponse(data={
        'waypoints': waypoints,
        'telemetry': telemetry
    })


def download_telemetry(request, id):
    try:
        fp = FlightPlan.objects.get(pk=id)
    except FlightPlan.DoesNotExist:
        raise Http404("Flight plan does not exist")
    telemetry_list = []
    if fp.telemetry:
        telemetry_list = _get_telemetry(fp)
    resp = JsonResponse({'telemetry': telemetry_list})
    resp["Content-Disposition"] = "attachment; filename=\"telemetry_" + fp.id + ".json\""
    return resp


def _parse_date(s, field_name):
    date = dateparse.parse_date(s)
    # parse_date returns None if the string is incorrectly formatted,
    # and raises a ValueError if it's an invalid date (2017-11-42).
    # We just always want a ValueError if something is wrong.
    if not date:
        raise ValueError("Invalid %s, expected format: yyyy-mm-dd." % field_name)
    return date


@csrf_exempt
def search_flights(request):
    date_start = request.POST.get('dept_date')
    date_end = request.POST.get('arr_date')
    operator_id = request.POST.get('operator_id')

    query = FlightPlan.objects.filter(
        Q(state=FlightPlan.STATE_PLANNED) | Q(state=FlightPlan.STATE_COMPLETED),
        operator__is_test=False
    )

    if date_start and date_end:
        try:
            date_start = _parse_date(date_start, "departure date")
            date_end = _parse_date(date_end, "arrival date")
        except ValueError as e:
            return JsonResponse(status=400, data={"message": e.message})

        query = query.filter(
            Q(
                # the departure time is in the time window (between the dates)
                Q(planned_departure_time__gte=datetime.combine(date_start, time.min),
                planned_departure_time__lte=datetime.combine(date_end, time.max))
                |
                # the arrival time is in the time window (between the dates)
                Q(planned_arrival_time__gte=datetime.combine(date_start, time.min),
                planned_arrival_time__lte=datetime.combine(date_end, time.max))
                |
                # the departure is before the window and arrival is after (window is inside of flight dates)
                Q(planned_departure_time__lte=datetime.combine(date_start, time.min),
                planned_arrival_time__gte=datetime.combine(date_end, time.max))
            )
        )

    if operator_id:
        query = query.filter(operator_id=operator_id)

    query = query.order_by('-planned_departure_time')
    plan_list = []
    for plan in query:
        plan_list.append({
            "id": plan.id,
            "flight_id": plan.flight_id,
            "state": plan.state,
            "vehicle": str(plan.vehicle),
            "operator": str(plan.operator),
            "planned_arrival_time": str(plan.planned_arrival_time.strftime("%b. %-d, %Y %-I:%M %p")),
            "planned_arrival_time_sec": (plan.planned_arrival_time - datetime(1970, 1, 1, tzinfo=UTC)).total_seconds(),
            "planned_departure_time": str(plan.planned_departure_time.strftime("%b. %-d, %Y %-I:%M %p")),
            "planned_departure_time_sec": (plan.planned_departure_time - datetime(1970, 1, 1, tzinfo=UTC)).total_seconds(),
        })
    return JsonResponse(data={"plans": plan_list})


@login_required
def edit_profile(request):
    user = request.user
    if request.method == "POST":
        form = EditProfileForm(request.POST ,instance=user)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('planner:edit_profile'))
        return render(request, 'planner/edit_profile.html', {'form':form, "tab": "personal_info"})

    form = EditProfileForm(instance=user)
    return render(request, 'planner/edit_profile.html', {'form':form, "tab": "personal_info"})


@login_required
def change_password(request):
    user = request.user
    if request.method == "POST":
        form = ChangePasswordForm(request.POST ,instance=user)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('planner:edit_profile'))
        return render(request, 'planner/edit_profile.html', {'form':form, "tab": "change_pass"})

    form = ChangePasswordForm(instance=user)
    return render(request, 'planner/edit_profile.html', {'form':form, "tab": "change_pass"})

# Admin views
class HealthCheckView(MainView, object):
    template_name = 'health_check/dashboard.html'
    github_revision = os.getenv('GIT_REVISION', None)
    if hasattr(settings, 'GIT_REVISION'):
        github_revision = settings.GIT_REVISION

    def get_deployment_id(self):
        return {
            'identifier': 'DeploymentId',
            'status': 2 if settings.DEPLOYMENT_ID is None else 1,
            'pretty_status': settings.DEPLOYMENT_ID,
            'time_taken': 0
        }

    def render_to_response(self, plugins, status):
        template = loader.get_template(self.template_name)
        plugins['revision'] = self.github_revision
        plugins['plugins'].insert(0, self.get_deployment_id())
        return HttpResponse(template.render(plugins), status=status)

    def render_to_response_json(self, plugins, status):
        template_args = {
            'GitRevision': self.github_revision,
        }
        plugins.insert(0, self.get_deployment_id())
        for p in plugins:
            if type(p) is dict:
                template_args[p['identifier']] = p['pretty_status']
            else:
                template_args[str(p.identifier())] = str(p.pretty_status())
        return JsonResponse(
            template_args,
            status=status
        )
