from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  # Combined routes for auth, profile, etc.
    path('api/products/', include('products.urls')),  # Combined routes for products and reviews
    path('api/search/', include('search.urls')),  # Search routes
    path('api/chat/', include('chat.urls')),
    path('admin/', admin.site.urls),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),  # signup
    path('auth/', include('allauth.socialaccount.urls')),   
    path('ml/', include('machineLearning.urls')),   # social auth
]


if settings.DEBUG:  # only for dev
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
