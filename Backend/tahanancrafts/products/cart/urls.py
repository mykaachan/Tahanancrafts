from django.urls import path
from .views import CartDetailView, CartView, CartListView

urlpatterns = [
    path('carts/', CartView.as_view(), name='cart'),
    path('carts/<int:user_id>/', CartListView.as_view(), name='cart-list'),
    path('carts/qty/<int:pk>/<int:user_id>/', CartDetailView.as_view(), name='cart-detail'),
    path('carts/<int:pk>/delete/', CartDetailView.as_view(), name='cart-delete'),


]
