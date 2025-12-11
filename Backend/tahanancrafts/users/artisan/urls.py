from django.urls import path
from .views import ArtisanStories, ArtisanTestView, ArtisanListWithProductsView, ArtisanUpdateView, ArtisanAddPhotoView, ArtisanDeletePhotoView, ArtisanStoryView
urlpatterns = [
    path('artisan-stories/', ArtisanStories.as_view(), name='artisan-stories'),
    path('artisan-test/', ArtisanTestView.as_view(), name='artisan-test'),
    path("artisans/list/", ArtisanListWithProductsView.as_view(), name="artisan-list-products"),
    path("update/<int:artisan_id>/", ArtisanUpdateView.as_view(), name="artisan-update"),
    path("add-photo/<int:artisan_id>/", ArtisanAddPhotoView.as_view(), name="artisan-add-photo"),
    path("delete-photo/<int:photo_id>/", ArtisanDeletePhotoView.as_view(), name="artisan-delete-photo"),
    path("story/<int:artisan_id>/", ArtisanStoryView.as_view(), name="artisan-story"),
]
