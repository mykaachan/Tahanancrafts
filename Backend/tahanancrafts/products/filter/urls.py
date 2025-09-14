from django.urls import path, include
from.views import ReviewTestView

urlpatterns = [
    path('filter_categories/', ReviewTestView.as_view(), name='filter-categories'),  # For filtering products by categories 
    path('filter_materials/', ReviewTestView.as_view(), name='filter-materials'),  # For filtering products by materials
]


