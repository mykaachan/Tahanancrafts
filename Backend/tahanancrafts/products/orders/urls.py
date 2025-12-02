from django.urls import path, include
from.views import UploadPaymentProofView, MyOrdersView, CancelOrderView, ConfirmReceivedView, UploadPaymentProofView, VerifyPaymentView

urlpatterns = [
    path("payment/upload-proof/", UploadPaymentProofView.as_view(), name="upload-payment-proof"),
    path("my-orders/", MyOrdersView.as_view(), name="my-orders"),
    path("cancel/", CancelOrderView.as_view(), name="order-cancel"),
    path("confirm-received/", ConfirmReceivedView.as_view(), name="order-confirm-received"),
    path('verify-payment/', VerifyPaymentView.as_view(), name="verify-payment"),
]


