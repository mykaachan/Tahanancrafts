from django.urls import path
from .views import SendMessageView, UserConversationsView, search_users, mark_seen

urlpatterns = [
    path("conversations/<int:user_id>/", UserConversationsView.as_view()),
    path("messages/send/", SendMessageView.as_view()),
    path("users/search/", search_users),

    path("messages/<int:conversation_id>/mark-seen/", mark_seen),
]
