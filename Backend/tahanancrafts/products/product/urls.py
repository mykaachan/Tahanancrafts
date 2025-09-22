from django.urls import path
from .views import (
    ProductTestView,
    AddProductView,
    DeleteProductView,
    UpdateProductView,
    ReadProductView,
    ProductListView,   
    CategoryListView,  
    MaterialListView,  
)

urlpatterns = [
    path('product-test/', ProductTestView.as_view(), name='product-test'),
    path('add_product/', AddProductView.as_view(), name='add-product'),
    path('delete_product/', DeleteProductView.as_view(), name='delete-product'),
    path('update_product/', UpdateProductView.as_view(), name='update-product'),
    path('read_product/', ReadProductView.as_view(), name='read-product'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('materials/', MaterialListView.as_view(), name='material-list'),
   
]
