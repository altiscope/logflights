from django.urls import path
from rest_framework_swagger.views import get_swagger_view

from . import api_views

app_name = 'experimental'

urlpatterns = [
    # path('flight/<slug:id>', api_views.FlightPlanExport),
    # path('list/', api_views.FlightPlanExport),
]

urlpatterns += api_views.external_router.urls
