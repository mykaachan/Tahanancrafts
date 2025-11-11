from django.urls import path, include
from.views import ReviewTestView

urlpatterns = [
    path('test_review/', ReviewTestView.as_view(), name='test-review'),
]


