from rest_framework import serializers
from .models import ForecastResult

class ForecastResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastResult
        fields = "__all__"
