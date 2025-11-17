# users/urls.py

from django.urls import path, include
from .views import (
    UserAddressList,
    CreateAddress,
    SetDefaultAddress,
    UpdateAddress,
    DeleteAddress,
    artisan_qr_view
)


urlpatterns = [
    path("shipping-address/<int:user_id>/", UserAddressList.as_view()),
    path("shipping-address/create/", CreateAddress.as_view()),
    path("shipping-address/set-default/<int:address_id>/", SetDefaultAddress.as_view()),
    path("shipping-address/update/<int:address_id>/", UpdateAddress.as_view()),
    path("shipping-address/delete/<int:address_id>/", DeleteAddress.as_view()),

    path("artisan/<int:artisan_id>/qr/", artisan_qr_view),




    path('auth/', include('users.auth.urls')),
    path('profile/', include('users.profile.urls')),
    path('admin/', include('users.admin.urls')),
    path('artisan/', include('users.artisan.urls')),
]
