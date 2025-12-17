from django.urls import path, include

urlpatterns = [
    path('predictions/', include('machineLearning.arima.urls')),
    path('clustering/', include('machineLearning.segmentation.urls')),
    path("/segmentation/", include("machineLearning.segmentation.urls")),
    path("/arima/", include("machineLearning.arima.urls")),

]