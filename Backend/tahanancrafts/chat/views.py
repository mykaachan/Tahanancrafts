from rest_framework import generics
from django.db import models
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from rest_framework.permissions import AllowAny
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from users.models import CustomUser
from rest_framework.decorators import api_view, permission_classes

class UserConversationsView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return Conversation.objects.filter(
            models.Q(user1_id=user_id) | models.Q(user2_id=user_id)
        )
    
@api_view(["GET"])
@permission_classes([AllowAny])
def search_users(request):
    query = request.GET.get("q", "")

    users = CustomUser.objects.filter(name__icontains=query)[:10]

    results = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
        }
        for u in users
    ]

    return Response(results)

@api_view(["POST"])
@permission_classes([AllowAny])

def mark_seen(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found"}, status=404)

    # Mark all messages NOT sent by the current user as seen
    user_id = request.data.get("user_id")

    Message.objects.filter(
        conversation=conversation,
        sender_id__ne=user_id,  # NOT the current user
        seen=False
    ).update(seen=True)

    return Response({"status": "seen updated"})


class CreateMessageView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]

class SendMessageView(APIView):
    permission_classes = [AllowAny]

    """
    Creates conversation automatically if it doesn't exist.
    """


    def post(self, request):
        sender_id = request.data.get("sender")
        receiver_id = request.data.get("receiver")
        text = request.data.get("text")

        if not sender_id or not receiver_id or not text:
            return Response({"error": "Missing required fields."}, status=400)

        # 1️⃣ Check if conversation already exists
        conversation = Conversation.objects.filter(
            Q(user1_id=sender_id, user2_id=receiver_id) |
            Q(user1_id=receiver_id, user2_id=sender_id)
        ).first()

        # 2️⃣ If not exist → auto-create conversation
        if not conversation:
            conversation = Conversation.objects.create(
                user1_id=sender_id,
                user2_id=receiver_id
            )

        # 3️⃣ Create the message
        message = Message.objects.create(
            conversation=conversation,
            sender_id=sender_id,
            text=text
        )

        return Response({
            "conversation": ConversationSerializer(conversation).data,
            "message": MessageSerializer(message).data
        }, status=status.HTTP_201_CREATED)