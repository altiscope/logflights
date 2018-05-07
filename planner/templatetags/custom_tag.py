from django.conf import settings
from django import template
from importlib import import_module

register = template.Library()
strings = import_module(settings.STRINGS)

@register.simple_tag
def tabname(name1,name2):
  return "active" if name1 == name2 else "none"

@register.simple_tag
def get_env():
    return settings.DEBUG

@register.simple_tag
def get_strings():
    return strings

@register.filter
def subtract(value, arg):
    return value - arg
