# products/delivery/views.py
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from products.models import Order, Delivery
from users.models import ShippingAddress
from .test_lalamove_shell import lalamove_get_quotation, lalamove_create_order_with_quotation


class GetQuotationView(APIView):
    permission_classes = [AllowAny]
    """
    Step 1: Call Lalamove to get quotation using buyer shipping address.
    Saves quotationId + price into Delivery model.
    """
    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"error": "order_id required"}, status=400)

        order = get_object_or_404(Order, id=order_id)
        shipping = order.shipping_address

        if not shipping.lat or not shipping.lng:
            return Response({"error": "Shipping address missing coordinates"}, status=400)

        # FakeOrder replaced with real object containing lat, lng, full_address
        class OrderLocationObject:
            lat = shipping.lat
            lng = shipping.lng
            full_address = f"{shipping.address}, {shipping.barangay}, {shipping.city}"

        payload = OrderLocationObject()
        response = lalamove_get_quotation(payload)

        if response.status_code != 201:
            return Response(response.json(), status=response.status_code)

        data = response.json()["data"]

        delivery, created = Delivery.objects.get_or_create(order=order)
        delivery.quotation_id = data["quotationId"]
        delivery.price = data["priceBreakdown"]["total"]
        delivery.distance_km = float(data["distance"]["value"]) / 1000
        delivery.quotation_expires_at = data["expiresAt"]
        delivery.save()

        return Response(data, status=201)
class BookOrderView(APIView):
    permission_classes = [AllowAny]
    """
    Step 2: Book a Lalamove delivery using saved quotationId.
    """
    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"error": "order_id required"}, status=400)

        order = get_object_or_404(Order, id=order_id)
        delivery = get_object_or_404(Delivery, order=order)

        if not delivery.quotation_id:
            return Response({"error": "Quotation not created yet"}, status=400)

        # Use the QUOTATION response (which includes stopIds)
        # We need to re-fetch quotation details to get stopIds
        q_response = lalamove_get_quotation(order.shipping_address)
        quotation_data = q_response.json()["data"]

        stop_sender = quotation_data["stops"][0]["stopId"]
        stop_recipient = quotation_data["stops"][1]["stopId"]

        # Now create booking payload
        response = lalamove_create_order_with_quotation({
            "quotationId": delivery.quotation_id,
            "sender_stop": stop_sender,
            "recipient_stop": stop_recipient
        })

        if response.status_code != 201:
            return Response(response.json(), status=response.status_code)

        # Save orderId returned by Lalamove
        delivery.lalamove_order_id = response.json()["data"]["orderId"]
        delivery.status = response.json()["data"]["status"]
        delivery.save()

        return Response(response.json(), status=201)
