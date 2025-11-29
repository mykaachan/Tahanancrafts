from django.urls import path
from .views import ARIMAForecastAPIView, ARIMAForecastGetAPIView

urlpatterns = [
    path("forecast/", ARIMAForecastAPIView.as_view(), name="arima_forecast"),
    path("forecast/<int:pk>/", ARIMAForecastGetAPIView.as_view(), name="arima_get"),
]
