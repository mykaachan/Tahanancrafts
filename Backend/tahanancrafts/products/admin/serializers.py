from rest_framework import serializers
from users.models import CustomUser, Artisan
from products.models import Product, Order, OrderItem


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "role",
            "username",   # <-- keep this, no source needed
            "avatar",
            "initials",
        ]

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            return obj.profile.avatar.url

        # fallback auto-generated initials placeholder
        if hasattr(obj, "profile"):
            return obj.profile.avatar_or_default  

        return None

    def get_initials(self, obj):
        if hasattr(obj, "profile") and obj.profile.initials:
            return obj.profile.initials

        # automatic fallback from name
        if obj.name:
            parts = obj.name.strip().split()
            if len(parts) >= 2:
                return (parts[0][0] + parts[1][0]).upper()
            return obj.name[0].upper()

        return "U"


class ArtisanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artisan
        fields = "__all__"
        
class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)  # <-- IMPORTANT

    class Meta:
        model = Order
        fields = "__all__"

