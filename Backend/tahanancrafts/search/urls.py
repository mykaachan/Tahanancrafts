from django.urls import path
from .views import GeneralSearchView

urlpatterns = [
    path(
        "general_search/",
        GeneralSearchView.as_view(),
        name="general-search"
    ),
]
