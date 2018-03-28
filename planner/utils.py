import os
import logging
from django.contrib.staticfiles.storage import staticfiles_storage

def read_static_file(file_path):
    """Read tos md file from file system."""
    with staticfiles_storage.open(file_path, 'r') as f:
        data = f.read().decode('utf-8')
        f.close()
        return data

# NOTE(polastre): in the future, just cache this in Redis
TERMS_DATA = {}

def get_terms_data(name):
    if name in TERMS_DATA:
        return TERMS_DATA[name]
    else:
        try:
            TERMS_DATA[name] = read_static_file(name)
            return TERMS_DATA[name]
        except Exception:
            logging.warning('Cannot load terms data: ' + str(name))
    return ''
