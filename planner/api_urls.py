from django.urls import path
from rest_framework_swagger.views import get_swagger_view

from . import api_views
from . api_utils import CloneFlightPlan

app_name = 'planner'

urlpatterns = [
    path('plans/<slug:id>/clone', CloneFlightPlan.as_view()),
    path('signup/', api_views.UserSignupView.as_view()),
    path('signup/<slug:pk>/', api_views.UserUpdateView.as_view()),
    path('me/', api_views.current_user_details),
    path('password/', api_views.UpdatePassword.as_view()),
    path('password/reset/', api_views.ResetPassword.as_view()),
    path('password/reset/<uidb64>!<token>/', api_views.ResetPasswordConfirm.as_view(), name='reset_password_confirm'),
]

urlpatterns += api_views.router.urls
