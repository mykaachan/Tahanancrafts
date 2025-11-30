from django.urls import path, include
from.views import CheckoutCreateOrderView

urlpatterns = [
    path('create-order/', CheckoutCreateOrderView.as_view(), name='create-order'),
]


