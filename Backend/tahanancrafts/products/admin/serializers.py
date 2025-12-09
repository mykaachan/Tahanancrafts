from rest_framework import serializers
from users.models import CustomUser, Artisan
from products.models import Product, Order, OrderItem


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "name", "email", "phone", "role"]


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

