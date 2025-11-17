from django.urls import path
from .views import SendMessageView, UserConversationsView

urlpatterns = [
    path("conversations/<int:user_id>/", UserConversationsView.as_view()),
    path("messages/send/", SendMessageView.as_view()),
]
