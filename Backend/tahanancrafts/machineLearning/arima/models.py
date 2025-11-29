from django.db import models
from django.conf import settings

class ForecastResult(models.Model):
    """
    Stores ARIMA forecasting results.
    """
    name = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    params = models.JSONField(null=True, blank=True)  # store ARIMA params & metadata
    series = models.JSONField(null=True, blank=True)  # original timeseries as {dates: [], values: []}
    forecast = models.JSONField(null=True, blank=True)  # {date_str: value}
    conf_int = models.JSONField(null=True, blank=True)  # {date_str: [low, high]}
    aicc = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Forecast {self.id} - {self.name or 'unnamed'}"
