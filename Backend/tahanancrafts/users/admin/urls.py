# users/admin/urls.py

from django.urls import path
from .views import TestAuthConnection

urlpatterns = [
    path('test_admin/', TestAuthConnection.as_view(), name='auth-test'),
]
