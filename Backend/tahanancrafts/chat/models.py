from django.db import models
from django.conf import settings
from users.models import CustomUser, Artisan

User = settings.AUTH_USER_MODEL


class Conversation(models.Model):
    user1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="conversation_user1"
    )
    user2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="conversation_user2"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation between {self.user1} and {self.user2}"

    @property
    def participants(self):
        return [self.user1, self.user2]


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    seen = models.BooleanField(default=False)   # 👈 Add this

    def __str__(self):
        return f"{self.sender}: {self.text[:20]}"


class Notification(models.Model):

    NOTIF_TYPES = [
        ("order", "Order Update"),
        ("payment", "Payment Update"),
        ("shipping", "Shipping Update"),
        ("message", "Message"),
        ("system", "System"),
        ("inventory", "Inventory Alert"),
        ("artisan", "Artisan Update"),
    ]

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE,
        null=True, blank=True, related_name="notifications"
    )
    artisan = models.ForeignKey(
        Artisan, on_delete=models.CASCADE,
        null=True, blank=True, related_name="notifications"
    )

    title = models.CharField(max_length=255)
    message = models.TextField()

    notif_type = models.CharField(max_length=50, choices=NOTIF_TYPES, default="system")
    icon = models.CharField(max_length=10, default="🔔")

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.created_at}"
