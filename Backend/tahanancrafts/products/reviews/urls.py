from django.urls import path, include
from .views import ReviewTestView, ProductRatingViewSet, CreateReview
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'ratings', ProductRatingViewSet, basename='product-rating')

urlpatterns = [
    path('test_review/', ReviewTestView.as_view(), name='test-review'),
    path('create-review/', CreateReview.as_view(), name="create-review"),

    path('', include(router.urls)),
]
