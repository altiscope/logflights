from django.conf.urls import url

from . import views

app_name = 'planner'

urlpatterns = [
    url(r'^vehicle/$', views.vehicle, name="vehicle"),
    url(r'^create-vehicle/$', views.create_vehicle, name="create_vehicle"),
    url(r'^update-vehicle/(?P<id>[0-9a-z]+)/$', views.update_vehicle, name="update_vehicle"),
    url(r'^terms/$', views.terms, name="terms"),

    url(r'^flightplan/$', views.flightplan, name="flightplan"),
    url(r'^create-flight-plan/$', views.create_flight_plan, name="create_flight_plan"),
    url(r'^update-flight-plan/(?P<id>[0-9a-z]+)/$', views.update_flight_plan, name="update_flight_plan"),
    url(r'^invalidate-flight-plan/(?P<id>[0-9a-z]+)/$', views.invalidate_flight_plan, name="invalidate_flight_plan"),
    url(r'^detail-flight-plan/(?P<id>[0-9a-z]+)/$', views.detail_flight_plan, name="detail_flight_plan"),

    url(r'^get-upload-url$', views.get_upload_url, name="get_upload_url"),
    url(r'^set-upload-complete$', views.set_upload_complete, name="set_upload_complete"),
    url(r'^get-upload-state/(?P<type>[a-z]+)/(?P<id>[0-9a-z]+)$', views.get_upload_state, name="get_upload_state"),
    url(r'^flightplans/(?P<id>[0-9a-z]+)/telemetry/$', views.download_telemetry, name="download_telemetry"),
    url(r'^get-flight-plan-data/(?P<id>[0-9a-z]+)/$', views.get_flight_plan_data, name="get_flight_plan_data"),
    url(r'^search-flights/$', views.search_flights, name= "search_flights"),
    url(r'^profile/$', views.edit_profile, name="edit_profile"),
    url(r'^change-password/$', views.change_password, name="change_password"),
]
