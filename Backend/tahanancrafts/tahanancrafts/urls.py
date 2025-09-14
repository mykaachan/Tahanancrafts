from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  # Combined routes for auth, profile, etc.
    path('api/products/', include('products.urls')),  # Combined routes for products and reviews
    path('api/search/', include('search.urls')),  # Search routes
    path('admin/', admin.site.urls),
    path('auth/', include('dj_rest_auth.urls')),               # login/logout/password reset
    path('auth/registration/', include('dj_rest_auth.registration.urls')),  # signup
    path('auth/', include('allauth.socialaccount.urls')),      # social auth
]
