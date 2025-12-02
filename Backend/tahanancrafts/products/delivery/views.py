# products/delivery/views.py
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from products.models import Order, Delivery
from users.models import ShippingAddress
from products.delivery.services import create_quotation, create_order_from_quotation


# products/delivery/views.py
class GetQuotationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"error": "order_id required"}, status=400)

        order = get_object_or_404(Order, id=order_id)
        shipping = order.shipping_address

        artisan = order.items.first().product.artisan
        if not artisan.pickup_lat:
            return Response({"error": "Artisan pickup location missing"}, 400)

        drop_address = f"{shipping.address}, {shipping.barangay}, {shipping.city}"

        response = create_quotation(
            pickup_lat=artisan.pickup_lat,
            pickup_lng=artisan.pickup_lng,
            pickup_address=artisan.pickup_address,
            drop_lat=shipping.lat,
            drop_lng=shipping.lng,
            drop_address=drop_address
        )

        if response.status_code != 201:
            return Response(response.json(), response.status_code)

        data = response.json()["data"]

        delivery, _ = Delivery.objects.get_or_create(order=order)
        delivery.quotation_id = data["quotationId"]
        delivery.pickup_stop_id = data["stops"][0]["stopId"]
        delivery.dropoff_stop_id = data["stops"][1]["stopId"]
        delivery.delivery_fee = data["priceBreakdown"]["total"]
        delivery.distance_m = data["distance"]["value"]
        delivery.quotation_expires_at = data["expiresAt"]
        delivery.save()

        return Response(data, 201)

class BookOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"error": "order_id required"}, status=400)

        order = get_object_or_404(Order, id=order_id)
        delivery = get_object_or_404(Delivery, order=order)

        # Normalize phone to E.164
        def normalize_phone(phone):
            phone = phone.strip()
            if phone.startswith("+63"):
                return phone
            if phone.startswith("0"):
                return "+63" + phone[1:]
            return phone

        buyer_phone = normalize_phone(order.shipping_address.phone)

        response = create_order_from_quotation(
            quotation_id=delivery.quotation_id,
            pickup_stop_id=delivery.pickup_stop_id,
            drop_stop_id=delivery.dropoff_stop_id,
            buyer_name=order.shipping_address.full_name,
            buyer_phone=buyer_phone
        )

        if response.status_code != 201:
            return Response(response.json(), response.status_code)

        data = response.json()["data"]

        delivery.lalamove_order_id = data["orderId"]
        delivery.status = data["status"]
        delivery.tracking_link = data["shareLink"]
        delivery.save()

        return Response(data, 201)

