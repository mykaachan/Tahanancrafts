from django.urls import path
from .views import (
    ProductPersonalizedView,
    ProductTestView,
    AddProductView,
    DeleteProductView,
    ShopProductsView,
    UpdateProductView,
    ProductListView,   
    CategoryListView,  
    MaterialListView,  
    ProductDetailView,
    RecommendedProductsView,
    ProductDetailRecommendedView,
    LogProductView,
    LatestProductsView,
    FeaturedProductsView,
    top_selling_products
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
    path('recommendations/<int:product_id>/', ProductDetailRecommendedView.as_view(), name='recommendations'),
    path('log-view/', LogProductView.as_view(), name='log-view'),
    path('personalized/<int:user_id>/', ProductPersonalizedView.as_view(), name='personalized'),
    path('shop/<int:artisan_id>/', ShopProductsView.as_view()),
    path('latest-products/', LatestProductsView.as_view(), name='latest-products'),
    path('featured-products/<int:user_id>/', FeaturedProductsView.as_view(), name='featured-products'),
    path('top-selling/<int:artisan_id>/', top_selling_products, name='artisan_top_selling'),

]