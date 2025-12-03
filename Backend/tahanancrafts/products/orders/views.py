from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.shortcuts import get_object_or_404
from users.models import Artisan, CustomUser
from django.utils import timezone
from datetime import timedelta
from products.models import (
    Order, OrderTimeline, OrderItem, Delivery,
    PaymentProof, Product, Refund,
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
            description="Awaiting seller verification."
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
        reason = request.data.get("reason")  # ⭐ NEW
        user_id = request.data.get("user_id")

        if not order_id:
            return Response({"error": "order_id is required"}, status=400)

        if not reason:
            return Response({"error": "Cancellation reason is required"}, status=400)

        order = get_object_or_404(Order, id=order_id)

        # Allowed cancel statuses
        allowed_status = [
            Order.STATUS_AWAITING_PAYMENT,
            Order.STATUS_AWAITING_VERIFICATION,
            Order.STATUS_PROCESSING,
        ]

        if order.status not in allowed_status:
            return Response({"error": "Order cannot be cancelled at this stage."}, status=400)

        # Reusable update function
        def update_status(order, new_status, description):
            order.status = new_status
            order.save()

            # Timeline entry with reason
            OrderTimeline.objects.create(
                order=order,
                status=new_status,
                description=description,
                reason=reason
            )

        # Store reason inside each order item
        order_items = order.items.all()
        for item in order_items:
            item.reason = reason  
            item.save()

        # CASE 1: Awaiting payment — simple cancel
        if order.status == Order.STATUS_AWAITING_PAYMENT:
            update_status(
                order,
                Order.STATUS_CANCELLED,
                "Buyer cancelled the order before payment."
            )

        # CASE 2 & 3: Awaiting verification or processing → refund
        elif order.status in [Order.STATUS_AWAITING_VERIFICATION, Order.STATUS_PROCESSING]:
            update_status(
                order,
                Order.STATUS_REFUND,
                "Requested cancellation. Processing refund."
            )

        # Notification
        send_notification(
            "buyer_requested_cancel",
            order=order,
            buyer=request.user,
            artisan=order.artisan
        )

        return Response({"message": "Order cancelled successfully."}, status=200)


class ConfirmReceivedView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        action = request.data.get("action")
        reason = request.data.get("reason")  # ⭐ NEW

        if not order_id :
            return Response({"error": "order_id required"}, status=400)

        # FIXED: filter by user_id instead of request.user
        order = get_object_or_404(Order, id=order_id)

        # Updated function to include reason
        def update_status(order, new_status, description, reason_value=None):
            order.status = new_status
            order.save()
            OrderTimeline.objects.create(
                order=order,
                status=new_status,
                description=description,
                reason=reason_value  # ⭐ save reason in timeline
            )

        delivered_entry = OrderTimeline.objects.filter(
            order=order,
            status=Order.STATUS_DELIVERED
        ).order_by('-created_at').first()

        if delivered_entry:
            if timezone.now() >= delivered_entry.created_at + timedelta(days=7):
                if order.status == Order.STATUS_DELIVERED:
                    update_status(
                        order,
                        Order.STATUS_TO_REVIEW,
                        "System automatically marked order as received after 7 days.",
                    )
                    return Response({"message": "Order auto-marked as received."}, status=200)

        # Must be delivered or shipped
        if order.status not in [Order.STATUS_DELIVERED]:
            return Response({"error": "Order is not delivered yet."}, status=400)

        if action == "received":
            update_status(
                order,
                Order.STATUS_TO_REVIEW,
                "Buyer confirmed the order was received.",
            )
            return Response({"message": "Order marked as received."}, status=200)

        # USER ACTION: "refund"
        elif action == "refund":
            if not reason:
                return Response({"error": "Reason is required for refund action."}, status=400)

            update_status(
                order,
                Order.STATUS_REFUND,
                "Buyer requested a refund.",
                reason_value=reason
            )
            return Response({"message": "Refund request submitted."}, status=200)

        return Response({"error": "Invalid action"}, status=400)



class VerifyPaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order = get_object_or_404(Order, id=request.data.get("order_id"))
        action = request.data.get("action")
        
        def update_status(order, new_status, description):
            order.status = new_status
            order.add_timeline(new_status, description)
            order.save()

        if action == "approve":
            order.payment_verified = True
            update_status(order, Order.STATUS_PROCESSING, "Seller approved payment.")

        elif action == "reject":
            order.payment_verified = False
            update_status(order, Order.STATUS_REFUND, "Processing Refund.")

        else:
            return Response({"error": "Invalid action"}, status=400)

        return Response({"message": "Payment updated"}, status=200)
    

class GetOrderForBookingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)

        # Fetch Delivery
        try:
            delivery = order.delivery
        except Delivery.DoesNotExist:
            return Response({"error": "delivery object missing"}, status=400)

        shipping = order.shipping_address
        artisan = order.artisan  # this holds the Artisan object

        if not artisan:
            return Response({"error": "Artisan not linked to this order"}, status=400)

        # 🔥 Fetch artisan’s user record for phone/email
        artisan_user = artisan.user  # FK to CustomUser

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
            },
            "artisan": {
                "id": artisan.id,
                "name": artisan.name,
                "pickup_address": artisan.pickup_address,
                "pickup_lat": artisan.pickup_lat,
                "pickup_lng": artisan.pickup_lng,

                # 🔥 pulled from CustomUser
                "phone": artisan_user.phone if artisan_user else None,
                "email": artisan_user.email if artisan_user else None,
            }
        }, status=200)

class ToShippedView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order = get_object_or_404(Order, id=request.data.get("order_id"))
        action = request.data.get("action")

        # Delivery rows for this specific order
        deliveries = Delivery.objects.filter(order=order)

        def update_status(order, new_status, description):
            order.status = new_status
            order.add_timeline(new_status, description)  # Adds to timeline table
            order.save()

        if action == "lalamove":
            order.payment_verified = True

            # Update order status + timeline
            update_status(
                order,
                Order.STATUS_READY_TO_SHIP,
                "Ready to ship."
            )

            # Update delivery status
            deliveries.update(status="ASSIGNING_DRIVER")

            return Response({"message": "Order marked as ready to ship."}, status=200)

        elif action == "reject":
            order.payment_verified = False

            # Update order status + timeline
            update_status(
                order,
                Order.STATUS_CANCELLED,
                "Seller will process a refund if payment has been made."
            )

            return Response({"message": "Order cancelled."}, status=200)

        else:
            return Response({"error": "Invalid action"}, status=400)

class RefundProofView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        action = request.data.get("action")
        reason = request.data.get("reason")
        refund_proof = request.FILES.get("refund_proof")
        refund_amount = request.data.get("refund_amount")

        if not order_id or not action:
            return Response({"error": "order_id and action required"}, status=400)

        order = get_object_or_404(Order, id=order_id)
        user = order.user
        artisan = order.artisan

        def timeline(order, status, description, refund_obj=None, reason_text=None):
            OrderTimeline.objects.create(
                order=order,
                status=status,
                description=description,
                refund=refund_obj,
                reason=reason_text
            )

        if action == "refund":
            if not refund_proof:
                return Response({"error": "refund_proof is required."}, status=400)

            if not refund_amount:
                return Response({"error": "refund_amount is required."}, status=400)

            refund_obj = Refund.objects.create(
                order=order,
                artisan=artisan,
                user=user,
                user_name=user.name,
                refund_amount=refund_amount,
                refund_proof=refund_proof,
                refund_status=Refund.STATUS_PROCESSED
            )

            # Update order
            order.status = Order.STATUS_REFUND
            order.save()

            # Timeline entry
            timeline(
                order,
                Order.STATUS_REFUND,
                "Refund processed successfully.",
                refund_obj=refund_obj,
                reason_text=reason
            )

            return Response({"message": "Refund processed successfully."}, status=200)

        # -------------------------------
        # ACTION : cancel refund request
        # -------------------------------
        elif action == "cancel":

            # Update order status (back to delivered)
            order.status = Order.STATUS_DELIVERED
            order.save()

            # Timeline entry without refund_obj
            timeline(
                order,
                Order.STATUS_DELIVERED,
                "Seller cancelled the refund request.",
                refund_obj=None,
                reason_text=reason
            )

            return Response({"message": "Refund request cancelled."}, status=200)

        else:
            return Response({"error": "Invalid action"}, status=400)


