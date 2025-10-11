from django.urls import path, include

urlpatterns = [
    path('recommendations/', include('machineLearning.recommendations.urls')),
    path('predictions/', include('machineLearning.arima.urls')),
    path('clustering/', include('machineLearning.segmentation.urls')),
]