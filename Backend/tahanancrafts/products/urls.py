from django.urls import path, include

urlpatterns = [
    path('product/',include('products.product.urls')),  # For product-related URLs
    path('review/', include('products.reviews.urls')),  # For review-related URLs
]
