from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.shortcuts import get_object_or_404
from users.models import Artisan, CustomUser

from products.models import (
    Order, OrderTimeline, OrderItem, Delivery,
    PaymentProof, Product
)

from .serializers import OrderSerializer
from .ocr_utils import (
    extract_text_from_image,
    extract_reference_number,
    extract_amount,
    extract_sender_account
)

from users.utils import send_payment_received_email
from chat.notification import send_notification   # ⭐ Notification System

class UploadPaymentProofView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        payment_type = request.data.get("payment_type", "downpayment")
        proof_image = request.FILES.get("proof_image")

        if not order_id or not proof_image:
            return Response({"error": "order_id and proof_image required"}, status=400)

        order = get_object_or_404(Order, id=order_id)

        # Create payment proof entry
        proof = PaymentProof.objects.create(
            order=order,
            payment_type=payment_type,
            proof_image=proof_image
        )

        # Add timeline
        order.add_timeline(
            status="payment_proof_uploaded",
            description="Buyer uploaded a payment proof."
        )

        # Notify artisan
        artisan = order.artisan
        send_notification(
            event="buyer_uploaded_proof",
            order=order,
            buyer=order.user,
            artisan=artisan
        )

        return Response({"message": "Payment proof uploaded successfully."}, status=201)



class MyOrdersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.user.id if request.user.is_authenticated else request.GET.get("user_id")

        if not user_id:
            return Response({"error": "Missing user_id"}, status=400)

        user = get_object_or_404(CustomUser, id=user_id)
        orders = Order.objects.filter(user=user).order_by("-created_at")

        return Response(OrderSerializer(orders, many=True).data, status=200)

    
class ArtisanOrdersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, artisan_id):
        artisan = get_object_or_404(Artisan, id=artisan_id)
        orders = Order.objects.filter(artisan=artisan).order_by("-created_at")
        return Response(OrderSerializer(orders, many=True).data, status=200)

class CancelOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        order = get_object_or_404(Order, id=order_id, user=request.user)

        if order.status not in [
            Order.STATUS_AWAITING_PAYMENT,
            Order.STATUS_AWAITING_VERIFICATION,
        ]:
            return Response({"error": "Order cannot be cancelled at this stage."}, status=400)

        order.status = Order.STATUS_CANCELLED
        order.save()

        order.add_timeline("cancelled", "Buyer cancelled the order.")

        send_notification(
            "buyer_requested_cancel",
            order=order,
            buyer=request.user,
            artisan=order.artisan
        )

        return Response({"message": "Order cancelled."}, status=200)

class ConfirmReceivedView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        user_id = request.data.get("user_id")

        user = request.user if request.user.is_authenticated else get_object_or_404(CustomUser, id=user_id)
        order = get_object_or_404(Order, id=order_id, user=user)

        if order.status != Order.STATUS_SHIPPED:
            return Response({"error": "Order is not yet shipped."}, status=400)

        order.status = Order.STATUS_DELIVERED
        order.save()

        order.add_timeline(
            status="delivered",
            description="Buyer confirmed the delivery."
        )

        send_notification(
            "order_delivered",
            order=order,
            buyer=user,
            artisan=order.artisan
        )

        return Response({"message": "Order delivery confirmed."}, status=200)


class VerifyPaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        action = request.data.get("action")   # approve or reject

        order = get_object_or_404(Order, id=order_id)
        buyer = order.user
        artisan = order.artisan

        if action == "approve":
            order.payment_verified = True
            order.status = Order.STATUS_PROCESSING
            order.save()

            order.add_timeline(
                status="payment_verified",
                description="Artisan approved the buyer's payment."
            )

            send_notification(
                "payment_verified",
                order=order,
                buyer=buyer,
                artisan=artisan
            )

            return Response({"message": "Payment approved."}, status=200)

        elif action == "reject":
            order.payment_verified = False
            order.status = Order.STATUS_AWAITING_PAYMENT
            order.save()

            order.add_timeline(
                status="payment_rejected",
                description="Artisan rejected the buyer's payment proof."
            )

            send_notification(
                "payment_rejected",
                order=order,
                buyer=buyer,
                artisan=artisan
            )

            return Response({"message": "Payment rejected."}, status=200)

        return Response({"error": "Invalid action"}, status=400)
