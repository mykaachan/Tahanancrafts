#!/bin/sh

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
gunicorn tahanancrafts.wsgi:application --bind 0.0.0.0:8000
