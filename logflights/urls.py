""" URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.conf.urls.static import static
from django.contrib import admin
from django.conf import settings
from django.views.generic import TemplateView
from planner import views, api_views
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework_swagger.views import get_swagger_view

urlpatterns = [
    # App routes
    url(r'^accounts/', include('allauth.urls')),

    url(r'^auth/api-token-auth/', obtain_jwt_token),

    # api docs
    url(r'^_/docs/', get_swagger_view(title='log.flights API')),

    # Administrative routes to be protected by http proxy / load balancer
    url(r'^_/admin/', admin.site.urls),
    url(r'^_/health_check/', views.HealthCheckView.as_view(), name='health_check'),
    url(r'^api/internal/', include('planner.api_urls', namespace='planner_api')),
    url(r'^$', TemplateView.as_view(template_name='react/index.html'), name="welcome"),
    # match all other routes
    url(r'^(?:.*)/?$', TemplateView.as_view(template_name='react/index.html'), name="welcome"),

    # old ui

    # url(r'^$', views.welcome, name='welcome'),
    # url(r'^planner/', include('planner.urls', namespace='planner')),
    # url(r'^accounts/', include('allauth.urls')),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
