from django.urls import path, include

urlpatterns = [
    path('product/',include('products.product.urls')),  # For product-related URLs
    path('review/', include('products.reviews.urls')),  # For review-related URLs
    path('cart/', include('products.cart.urls')),  # For cart-related URLs
    path('delivery/', include('products.delivery.urls')),  # For cart-related URLs

]
