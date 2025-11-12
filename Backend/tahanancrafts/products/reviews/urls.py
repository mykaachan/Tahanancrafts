from django.urls import path, include
from.views import ReviewTestView, ProductRatingViewSet

urlpatterns = [
    path('test_review/', ReviewTestView.as_view(), name='test-review'),
]
# products/urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'ratings', ProductRatingViewSet, basename='product-rating')

urlpatterns = router.urls


