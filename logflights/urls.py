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
from planner import views


urlpatterns = [
    # App routes
    url(r'^$', views.welcome, name='welcome'),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^planner/', include('planner.urls', namespace='planner')),
    # Policy routes
    url(r'^terms-of-service', views.terms, {'name': settings.TERMS_TOS}, name='terms-of-service'),
    url(r'^privacy-policy', views.terms, {'name': settings.TERMS_PRIVACY}, name='privacy-policy'),
    # Administrative routes to be protected by http proxy / load balancer
    url(r'^_/admin/', admin.site.urls),
    url(r'^_/health_check/', views.HealthCheckView.as_view(), name='health_check'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
