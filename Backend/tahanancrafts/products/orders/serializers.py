from rest_framework import serializers
from products.models import (
    Order, OrderItem, Delivery, OrderTimeline, PaymentProof, Product
)
from users.models import Artisan, ShippingAddress, CustomUser

class SimpleArtisanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artisan
        fields = ["id", "name", "gcash_qr"]

class ShippingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = ["id" , "full_name", "phone", "address"]
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id","name"]


class SimpleProductSerializer(serializers.ModelSerializer):
    artisan = SimpleArtisanSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "main_image", "description", "artisan"]

class OrderItemSerializer(serializers.ModelSerializer):
    product = SimpleProductSerializer()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "price", "subtotal"]

    def get_subtotal(self, obj):
        return obj.price * obj.quantity


# -----------------------------
# DELIVERY INFO
# -----------------------------
class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = [
            "lalamove_order_id",
            "tracking_link",
            "status",
            "driver_id",
            "driver_name",
            "driver_phone",
            "driver_plate_number",
            "pod_image_url",
            "delivery_fee",
            "distance_m",
        ]



# -----------------------------
# ORDER TIMELINE
# -----------------------------
class OrderTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTimeline
        fields = ["id", "status", "description", "created_at","order","reason"]

class PaymentProofSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentProof
        fields = "__all__"
        read_only_fields = ["id", "extracted_text", "is_verified", "created_at"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    delivery = DeliverySerializer()
    timeline = OrderTimelineSerializer(many=True)
    payment_proofs = PaymentProofSerializer(many=True)

    # ✅ ADD THESE
    buyer_name = serializers.SerializerMethodField()
    shipping_full_name = serializers.SerializerMethodField()
    shipping_phone = serializers.SerializerMethodField()
    shipping_address = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "payment_method",
            "payment_verified",
            "downpayment_required",
            "downpayment_amount",
            "total_items_amount",
            "shipping_fee",
            "grand_total",
            "created_at",
            "message_to_seller",

            # ✅ NEW
            "buyer_name",
            "shipping_full_name",
            "shipping_phone",
            "shipping_address",

            "items",
            "delivery",
            "timeline",
            "payment_proofs",
            "shipping_address_id",
            "user_id",
        ]

    # =========================
    # Serializer method fields
    # =========================
    def get_buyer_name(self, obj):
        return obj.user.name if obj.user else None

    def get_shipping_full_name(self, obj):
        if obj.shipping_address:
            return obj.shipping_address.full_name
        return None

    def get_shipping_phone(self, obj):
        if obj.shipping_address:
            return obj.shipping_address.phone
        return None

    def get_shipping_address(self, obj):
        if obj.shipping_address:
            return obj.shipping_address.address
        return None
