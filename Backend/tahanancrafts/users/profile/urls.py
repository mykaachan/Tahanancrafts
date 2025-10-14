# users/urls.py
from django.urls import path
from .views import ProfileView, EditProfileView, ChangeUserPasswordView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('edit/', EditProfileView.as_view(), name='edit-profile'),
    path('change_password/', ChangeUserPasswordView.as_view(), name='change-password'),
]