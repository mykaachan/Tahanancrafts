"""
WSGI config for tahanan_crafts project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tahanan_crafts.settings')

application = get_wsgi_application()
