from rest_framework import serializers
from products.models import Delivery

class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = [
            "quotation_id",
            "pickup_stop_id",
            "dropoff_stop_id",
            "delivery_fee",
            "distance_m",
            "quotation_expires_at",
            "lalamove_order_id",
            "tracking_link",
            "status",
            "driver_id",
            "driver_name",
            "driver_phone",
            "driver_plate_number",
        ]
