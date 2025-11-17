from django.urls import path
from .views import lalamove_webhook

urlpatterns = [
    path("webhook/lalamove/", lalamove_webhook, name="lalamove_webhook"),
]
