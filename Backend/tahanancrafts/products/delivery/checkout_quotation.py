# products/delivery/views_checkout.py
import time, json, hmac, hashlib, requests, datetime
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from users.models import ShippingAddress, Artisan
from products.models import Delivery  # Final model you selected


BASE_URL = "https://rest.sandbox.lalamove.com"


def _sign(secret, path, body_str, timestamp):
    raw = f"{timestamp}\r\nPOST\r\n{path}\r\n\r\n{body_str}"
    return hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()


class CheckoutQuotationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        shipping_address_id = request.data.get("shipping_address_id")
        artisan_id = request.data.get("artisan_id")

        if not shipping_address_id or not artisan_id:
            return Response(
                {"error": "shipping_address_id and artisan_id are required"},
                status=400
            )

        shipping = get_object_or_404(ShippingAddress, id=shipping_address_id)
        artisan = get_object_or_404(Artisan, id=artisan_id)

        if not (shipping.lat and shipping.lng):
            return Response({"error": "Shipping address missing coordinates"}, status=400)

        if not (artisan.pickup_lat and artisan.pickup_lng):
            return Response({"error": "Artisan missing pickup coordinates"}, status=400)

        api_key = settings.LALAMOVE_API_KEY
        secret = settings.LALAMOVE_SECRET
        path = "/v3/quotations"
        url = BASE_URL + path
        market = "PH"

        timestamp = str(int(time.time() * 1000))

        dt = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
        schedule_at = dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")

        payload = {
            "data": {
                "scheduleAt": schedule_at,
                "serviceType": "MOTORCYCLE",
                "language": "en_PH",
                "isRouteOptimized": False,
                "specialRequests": [],

                "stops": [
                    {
                        "coordinates": {
                            "lat": str(artisan.pickup_lat),
                            "lng": str(artisan.pickup_lng)
                        },
                        "address": artisan.pickup_address
                    },
                    {
                        "coordinates": {
                            "lat": str(shipping.lat),
                            "lng": str(shipping.lng)
                        },
                        "address": f"{shipping.address}, {shipping.barangay}, {shipping.city}"
                    }
                ]
            }
        }

        body_str = json.dumps(payload, separators=(",", ":"))
        signature = _sign(secret, path, body_str, timestamp)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"hmac {api_key}:{timestamp}:{signature}",
            "market": market,
        }

        response = requests.post(url, headers=headers, data=body_str)
        data = response.json()

        if response.status_code != 201:
            return Response(data, status=response.status_code)

        quotation = data["data"]

        temp_delivery = Delivery.objects.create(
            order=None,                      # Saved later when order is created
            quotation_id=quotation["quotationId"],
            pickup_stop_id=quotation["stops"][0]["stopId"],
            dropoff_stop_id=quotation["stops"][1]["stopId"],
            delivery_fee=quotation["priceBreakdown"]["total"],
            distance_m=quotation["distance"]["value"],
            quotation_expires_at=quotation["expiresAt"],
            status="quotation_created"
        )

        return Response({
            "quotation": quotation,
            "temp_delivery_id": temp_delivery.id
        }, status=201)
