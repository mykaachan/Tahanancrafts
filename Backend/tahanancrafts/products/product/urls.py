from django.urls import path
from .views import (
    ProductTestView,
    AddProductView,
    DeleteProductView,
    UpdateProductView,
    ProductListView,   
    CategoryListView,  
    MaterialListView,  
    ProductDetailView,
)

urlpatterns = [
    path('product-test/', ProductTestView.as_view(), name='product-test'),
    path('add_product/', AddProductView.as_view(), name='add-product'),
    path('delete_product/', DeleteProductView.as_view(), name='delete-product'),
    path('update_product/', UpdateProductView.as_view(), name='update-product'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('materials/', MaterialListView.as_view(), name='material-list'),
    path('products/<int:id>/', ProductDetailView.as_view(), name='product-detail'),  # New URL pattern for product detail
   
]
