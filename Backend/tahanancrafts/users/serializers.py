from rest_framework import serializers
from users.models import ShippingAddress

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = [
            "id",
            "user",
            "full_name",
            "phone",
            "address",
            "barangay",
            "city",
            "province",
            "region",
            "postal_code",
            "landmark",
            "lat",
            "lng",
            "is_default",
        ]
        read_only_fields = ["id", "lat", "lng", "user"]