from django.urls import path
from .views import ArtisanStories, ArtisanTestView

urlpatterns = [
    path('artisan-stories/', ArtisanStories.as_view(), name='artisan-stories'),
    path('artisan-test/', ArtisanTestView.as_view(), name='artisan-test'),
]
