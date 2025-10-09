from django.urls import path
from .views import CartView, CartListView

urlpatterns = [
    path('carts/', CartView.as_view(), name='cart'),
    path('carts/<int:user_id>/', CartListView.as_view(), name='cart-list'),
]
