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
from django.urls import include, path, re_path
from django.conf.urls.static import static
from django.contrib import admin
from django.conf import settings
from django.views.generic import TemplateView
from planner import views, api_views, external_urls
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework_swagger.views import get_swagger_view

api_patterns = [
    path('api/experimental/', include('planner.external_urls', namespace='export_api')),
]

urlpatterns = [
    # App routes
    path('accounts/', include('allauth.urls')),

    path('auth/api-token-auth/', obtain_jwt_token),

    # api docs
    path('api/docs', get_swagger_view(title='log.flights API', patterns=api_patterns, url='/')),
    re_path(r'_/docs/?', get_swagger_view(title='log.flights API', url=None)),

    # Administrative routes to be protected by http proxy / load balancer
    re_path(r'_/admin/?', admin.site.urls),
    re_path(r'_/health_check/?', views.HealthCheckView.as_view(), name='health_check'),
    path('api/internal/', include('planner.api_urls', namespace='planner_api')),
    path('api/experimental/', include('planner.external_urls', namespace='export_api')),
    path('', TemplateView.as_view(template_name='react/index.html'), name="welcome"),
    # match all other routes
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name='react/index.html'), name="welcome"),

    # old ui

    # url(r'^$', views.welcome, name='welcome'),
    # url(r'^planner/', include('planner.urls', namespace='planner')),
    # url(r'^accounts/', include('allauth.urls')),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
