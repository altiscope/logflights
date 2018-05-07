from django.conf.urls import url
from rest_framework_swagger.views import get_swagger_view

from . import api_views
from . api_utils import CloneFlightPlan

app_name = 'planner'

urlpatterns = [
    url(r'^$', get_swagger_view("Planner API")),
    url(r'^plans/(?P<id>[0-9a-z]+)/clone$', CloneFlightPlan.as_view()),
    url(r'^signup/$', api_views.UserSignupView.as_view()),
    url(r'^signup/(?P<pk>[0-9a-z]+)/$', api_views.UserUpdateView.as_view()),
    url(r'^me/', api_views.current_user_details),
    url(r'^password/$', api_views.UpdatePassword.as_view()),
    url(r'^password/reset/$', api_views.ResetPassword.as_view()),
    url(r'^password/reset/(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$', api_views.ResetPasswordConfirm.as_view(), name='reset_password_confirm'),
]

urlpatterns += api_views.router.urls
