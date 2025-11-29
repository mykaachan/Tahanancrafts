from django.urls import path
from .views import CustomerSegmentationAPIView

urlpatterns = [
    path("customer/", CustomerSegmentationAPIView.as_view(), name="customer_segmentation"),
]
