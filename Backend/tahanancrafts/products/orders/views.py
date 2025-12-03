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
        PaymentProof.objects.create(
            order=order,
            payment_type=payment_type,
            proof_image=proof_image
        )

        # Update order status
        order.status = Order.STATUS_AWAITING_VERIFICATION
        order.save()

        # Add timeline
        order.add_timeline(
            status=Order.STATUS_AWAITING_VERIFICATION,
            description="Buyer uploaded payment proof. Awaiting seller verification."
        )

        # Notify artisan (NO EMAIL)
        artisan = order.items.first().product.artisan
        send_notification(
            event="buyer_uploaded_proof",
            order=order,
            buyer=order.user,
            artisan=artisan
        )

        return Response({
            "message": "Payment proof uploaded successfully.",
            "order_status": order.status
        }, status=201)



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

        product_ids = artisan.products.values_list("id", flat=True)

        order_ids = (
            OrderItem.objects
            .filter(product_id__in=product_ids)
            .values_list("order_id", flat=True)
            .distinct()
        )

        orders = Order.objects.filter(id__in=order_ids).order_by("-created_at")

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=200)

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
        order = get_object_or_404(Order, id=request.data.get("order_id"), user=request.user)
        def update_status(order, new_status, description):
            order.status = new_status
            order.save()
            order.add_timeline(new_status, description)

        if order.status != Order.STATUS_SHIPPED:
            return Response({"error": "Order is not shipped yet"}, status=400)

        update_status(order, Order.STATUS_DELIVERED, "Buyer confirmed delivery.")

        # Optional auto-complete:
        update_status(order, Order.STATUS_COMPLETED, "Order completed.")

        return Response({"message": "Order delivered"}, status=200)



class VerifyPaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order = get_object_or_404(Order, id=request.data.get("order_id"))
        action = request.data.get("action")
        
        def update_status(order, new_status, description):
            order.status = new_status
            order.save()
            order.add_timeline(new_status, description)

        if action == "approve":
            order.payment_verified = True
            update_status(order, Order.STATUS_PROCESSING, "Seller approved payment.")

        elif action == "reject":
            order.payment_verified = False
            update_status(order, Order.STATUS_AWAITING_PAYMENT, "Payment rejected. Buyer must re-upload proof.")

        else:
            return Response({"error": "Invalid action"}, status=400)

        return Response({"message": "Payment updated"}, status=200)
    

class GetOrderForBookingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)

        try:
            delivery = order.delivery
        except Delivery.DoesNotExist:
            return Response(
                {"error": "delivery object missing"},
                status=400
            )

        shipping = order.shipping_address

        return Response({
            "order": {
                "id": order.id,
                "shipping_name": shipping.full_name,
                "shipping_phone": shipping.phone,
                "shipping_address": shipping.address,
                "shipping_city": shipping.city,
                "shipping_barangay": shipping.barangay,
            },
            "delivery": {
                "quotation_id": delivery.quotation_id,
                "pickup_stop_id": delivery.pickup_stop_id,
                "dropoff_stop_id": delivery.dropoff_stop_id,
            }
        }, status=200)