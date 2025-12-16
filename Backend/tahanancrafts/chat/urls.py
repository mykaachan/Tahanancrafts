from django.urls import path
from .views import SendMessageView, UserConversationsView, search_users, mark_seen, UserNotificationsView,ArtisanNotificationsView, MarkNotificationReadView

urlpatterns = [
    path("conversations/<int:user_id>/", UserConversationsView.as_view()),
    path("messages/send/", SendMessageView.as_view()),
    path("users/search/", search_users),

    path("messages/<int:conversation_id>/mark-seen/", mark_seen),
    path("user/<int:user_id>/", UserNotificationsView.as_view()),
    path("artisan/<int:artisan_id>/", ArtisanNotificationsView.as_view()),
    path("read/<int:notif_id>/", MarkNotificationReadView.as_view()),

]
