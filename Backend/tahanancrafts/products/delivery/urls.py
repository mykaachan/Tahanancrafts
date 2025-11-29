from django.urls import path
from .views import GetQuotationView, BookOrderView
from .webhook import lalamove_webhook

urlpatterns = [
    path("quotation/", GetQuotationView.as_view(), name="lalamove-quotation"),
    path("book/", BookOrderView.as_view(), name="lalamove-book"),
    path("webhook/", lalamove_webhook, name="lalamove-webhook"),
]
