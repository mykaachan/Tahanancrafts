from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from users.models import ShippingAddress
from .serializers import ShippingAddressSerializer
from django.shortcuts import get_object_or_404
from django.conf import settings
import requests
from rest_framework.permissions import AllowAny


# 🔥 Optional auto-geocode function (free Nominatim)
def geocode_address(full):
    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": full, "format": "json"}
        )
        data = response.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except:
        pass
    return None, None


# ---------------------------------------------------------
# 📌 GET ALL ADDRESSES FOR USER
# ---------------------------------------------------------
class UserAddressList(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        addresses = ShippingAddress.objects.filter(user_id=user_id)
        serializer = ShippingAddressSerializer(addresses, many=True)
        return Response(serializer.data, status=200)



# ---------------------------------------------------------
# 📌 CREATE NEW ADDRESS
# ---------------------------------------------------------
class CreateAddress(APIView):
    permission_classes = [AllowAny]  # TEMPORARY, change later

    def post(self, request):
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"error": "user_id is required"}, status=400)

        serializer = ShippingAddressSerializer(data=request.data)
        if serializer.is_valid():
            address_obj = serializer.save(user_id=user_id)

            # Auto-geocode
            full = (
                f"{address_obj.address}, "
                f"{address_obj.barangay}, "
                f"{address_obj.city}, "
                f"{address_obj.province}, "
                f"{address_obj.region}"
            )

            lat, lng = geocode_address(full)
            if lat and lng:
                address_obj.lat = lat
                address_obj.lng = lng
                address_obj.save()

            return Response(ShippingAddressSerializer(address_obj).data, status=201)

        return Response(serializer.errors, status=400)

# ---------------------------------------------------------
# 📌 SET DEFAULT ADDRESS
# ---------------------------------------------------------
class SetDefaultAddress(APIView):
    permission_classes = [AllowAny]

    def post(self, request, address_id):
        user_id = request.data.get("user_id")

        ShippingAddress.objects.filter(user_id=user_id, is_default=True).update(is_default=False)

        address = get_object_or_404(ShippingAddress, id=address_id, user_id=user_id)
        address.is_default = True
        address.save()

        return Response({"message": "Default address updated"}, status=200)

# ---------------------------------------------------------
# 📌 UPDATE ADDRESS
# ---------------------------------------------------------
class UpdateAddress(APIView):
    permission_classes = [AllowAny]  # TEMPORARY

    def put(self, request, address_id):
        address = get_object_or_404(ShippingAddress, id=address_id)

        old_data = {
            "address": address.address,
            "barangay": address.barangay,
            "city": address.city,
            "province": address.province,
            "region": address.region,
        }

        serializer = ShippingAddressSerializer(address, data=request.data, partial=True)

        if serializer.is_valid():
            updated = serializer.save()

            # If address-related fields changed → re-geocode
            new_data = {
                "address": updated.address,
                "barangay": updated.barangay,
                "city": updated.city,
                "province": updated.province,
                "region": updated.region,
            }

            if new_data != old_data:
                full = (
                    f"{updated.address}, "
                    f"{updated.barangay}, "
                    f"{updated.city}, "
                    f"{updated.province}, "
                    f"{updated.region}"
                )

                lat, lng = geocode_address(full)
                if lat and lng:
                    updated.lat = lat
                    updated.lng = lng
                    updated.save()

            return Response(ShippingAddressSerializer(updated).data, status=200)

        return Response(serializer.errors, status=400)


# ---------------------------------------------------------
# 📌 DELETE ADDRESS
# ---------------------------------------------------------
class DeleteAddress(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, address_id):
        address = get_object_or_404(ShippingAddress, id=address_id)
        address.delete()
        return Response({"message": "Address deleted"}, status=200)
    
@api_view(['GET'])
@permission_classes([AllowAny])   #  <-- MAKE PUBLIC
def artisan_qr_view(request, artisan_id):
    from users.models import Artisan
    artisan = Artisan.objects.get(id=artisan_id)
    qr_url = artisan.gcash_qr.url if artisan.gcash_qr else None
    return Response({"gcash_qr": qr_url})

