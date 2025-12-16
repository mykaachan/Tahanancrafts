from rest_framework import serializers
from .models import Conversation, Message, Notification
from users.models import CustomUser, Profile

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"

class ConversationSerializer(serializers.ModelSerializer):
    other_user_name = serializers.SerializerMethodField()
    other_user_initial = serializers.SerializerMethodField()
    other_user_avatar = serializers.SerializerMethodField()

    current_user_name = serializers.SerializerMethodField()
    current_user_initial = serializers.SerializerMethodField()
    current_user_avatar = serializers.SerializerMethodField()

    last_message = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "user1",
            "user2",
            "other_user_name",
            "other_user_initial",
            "other_user_avatar",
            "current_user_name",
            "current_user_initial",
            "current_user_avatar",
            "last_message",
            "messages",
        ]

    # ------------------------------------------------------
    # Get CURRENT user from the URL: /conversations/<user_id>/
    # ------------------------------------------------------
    def get_current_user(self, obj):
        request = self.context.get("request")
        user_id = request.parser_context["kwargs"].get("user_id")

        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    # ------------------------------------------------------
    # Get OTHER user in the conversation
    # ------------------------------------------------------
    def get_other_user(self, obj):
        current_user = self.get_current_user(obj)
        if not current_user:
            return None

        return obj.user2 if obj.user1 == current_user else obj.user1

    # ------------------------------------------------------
    # CURRENT USER FIELDS
    # ------------------------------------------------------
    def get_current_user_name(self, obj):
        u = self.get_current_user(obj)
        if not u:
            return "Unknown"
        return u.name or u.username or "Unknown"

    def get_current_user_initial(self, obj):
        u = self.get_current_user(obj)
        if not u:
            return "U"

        profile = getattr(u, "profile", None)
        if profile and profile.initials:
            return profile.initials

        if u.name:
            parts = u.name.split()
            return "".join([p[0].upper() for p in parts[:2]])

        return "U"

    def get_current_user_avatar(self, obj):
        u = self.get_current_user(obj)
        if not u:
            return None

        profile = getattr(u, "profile", None)
        if profile and profile.avatar:
            try:
                return profile.avatar.url
            except:
                return None
        return None

    # ------------------------------------------------------
    # OTHER USER FIELDS
    # ------------------------------------------------------
    def get_other_user_name(self, obj):
        u = self.get_other_user(obj)
        if not u:
            return "Unknown"
        return u.name or u.username or "Unknown"

    def get_other_user_initial(self, obj):
        u = self.get_other_user(obj)
        if not u:
            return "U"

        profile = getattr(u, "profile", None)
        if profile and profile.initials:
            return profile.initials

        if u.name:
            parts = u.name.split()
            return "".join([p[0].upper() for p in parts[:2]])

        return "U"

    def get_other_user_avatar(self, obj):
        u = self.get_other_user(obj)
        if not u:
            return None

        profile = getattr(u, "profile", None)
        if profile and profile.avatar:
            try:
                return profile.avatar.url
            except:
                return None
        return None

    # ------------------------------------------------------
    # LAST MESSAGE
    # ------------------------------------------------------
    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        return msg.text if msg else ""




class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notif_type",
            "icon",
            "is_read",
            "created_at",
            "artisan_id",
            "user_id",
        ]