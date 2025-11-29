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
def geocode_address(full_address):
    api_key = settings.GOOGLE_MAPS_API_KEY

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": full_address,
        "key": api_key
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if data["status"] != "OK":
            return None, None

        location = data["results"][0]["geometry"]["location"]
        return float(location["lat"]), float(location["lng"])

    except Exception:
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
    permission_classes = [AllowAny]  # TEMPORARY

    def post(self, request):
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"error": "user_id is required"}, status=400)

        serializer = ShippingAddressSerializer(data=request.data)
        if serializer.is_valid():
            address_obj = serializer.save(user_id=user_id)

            # Create full string for geocoding
            full_address = (
                f"{address_obj.address}, "
                f"{address_obj.barangay}, "
                f"{address_obj.city}, "
                f"{address_obj.province}"
            )

            lat, lng = geocode_address(full_address)

            if lat and lng:
                address_obj.lat = lat
                address_obj.lng = lng
                address_obj.save()
            else:
                return Response(
                    {"error": "Unable to find coordinates for this address"},
                    status=400
                )

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
    permission_classes = [AllowAny]

    def put(self, request, address_id):
        address = get_object_or_404(ShippingAddress, id=address_id)

        serializer = ShippingAddressSerializer(address, data=request.data, partial=True)

        if serializer.is_valid():
            updated = serializer.save()

            # Build new address for geocoding
            full_address = (
                f"{updated.address}, "
                f"{updated.barangay}, "
                f"{updated.city}, "
                f"{updated.province}"
            )

            lat, lng = geocode_address(full_address)

            if lat and lng:
                updated.lat = lat
                updated.lng = lng
                updated.save()
            else:
                return Response(
                    {"error": "Updated address is invalid (no coordinates found)."},
                    status=400
                )

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

class UpdateArtisanPickup(APIView):
    permission_classes = [AllowAny]  # change later if needed

    def post(self, request, artisan_id):
        from users.models import Artisan

        try:
            artisan = Artisan.objects.get(id=artisan_id)
        except Artisan.DoesNotExist:
            return Response({"error": "Artisan not found"}, status=404)

        pickup_address = request.data.get("pickup_address")

        if not pickup_address:
            return Response({"error": "pickup_address is required"}, status=400)
        lat, lng = geocode_address(pickup_address)
        if not lat or not lng:
            return Response(
                {"error": "Unable to find coordinates for this pickup address"},
                status=400
            )
        artisan.pickup_address = pickup_address
        artisan.pickup_lat = lat
        artisan.pickup_lng = lng
        artisan.save()
        return Response({
            "message": "Pickup location updated",
            "artisan_id": artisan.id,
            "pickup_address": artisan.pickup_address,
            "pickup_lat": artisan.pickup_lat,
            "pickup_lng": artisan.pickup_lng
        }, status=200)