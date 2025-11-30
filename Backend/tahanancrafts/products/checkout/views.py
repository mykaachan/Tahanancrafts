# products/product/views_checkout.py
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.shortcuts import get_object_or_404

from users.models import ShippingAddress
from products.models import Order, OrderItem, Cart, Delivery, Product
from users.models import CustomUser

class CheckoutCreateOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Expected request JSON:
        {
          "user_id": <int>,
          "cart_item_ids": [<cart_id>, ...],
          "shipping_address_id": <int>,
          "payment_option": "sf_only"|"partial"|"full",
          "partial_amount": <number>,
          "pay_now": <number>,
          "cod_amount": <number>,

          # Lalamove quotation fields (from frontend)
          "quotationId": "<...>",
          "pickup_stop_id": "<...>",
          "dropoff_stop_id": "<...>",
          "delivery_fee": "<string or number>",
          "distance_m": <int>,
          "quotation_expires_at": "<iso timestamp>"
        }
        """
        data = request.data
        user_id = data.get("user_id")
        cart_item_ids = data.get("cart_item_ids", [])
        shipping_address_id = data.get("shipping_address_id")
        message_to_seller = request.data.get("message_to_seller", "")


        if not user_id or not cart_item_ids or not shipping_address_id:
            return Response({"error": "user_id, cart_item_ids and shipping_address_id are required"}, status=400)

        user = get_object_or_404(CustomUser, id=user_id)
        shipping = get_object_or_404(ShippingAddress, id=shipping_address_id)

        # Quotation fields (optional but recommended)
        quotation_id = data.get("quotationId")
        pickup_stop_id = data.get("pickup_stop_id")
        dropoff_stop_id = data.get("dropoff_stop_id")
        delivery_fee = data.get("delivery_fee")  # string or number
        distance_m = data.get("distance_m")
        quotation_expires_at = data.get("quotation_expires_at")

        payment_option = data.get("payment_option", "cod")
        partial_amount = data.get("partial_amount", 0)
        pay_now = data.get("pay_now", 0)
        cod_amount = data.get("cod_amount", 0)

        with transaction.atomic():
            # Create Order
            order = Order.objects.create(
                user=user,
                shipping_address=shipping,
                payment_method="cod" if payment_option in ["sf_only", "partial", "full", "cod"] else payment_option,

                # NEW FIELDS
                partial_payment = partial_amount,
                cod_payment = cod_amount,
                message_to_seller = message_to_seller,
        )


            # Create OrderItems from cart_item_ids
            items_added = []
            total_items_amount = 0
            for cart_id in cart_item_ids:
                try:
                    cart_item = Cart.objects.select_related("product").get(id=cart_id, user=user)
                except Cart.DoesNotExist:
                    transaction.set_rollback(True)
                    return Response({"error": f"Cart item {cart_id} not found"}, status=400)

                product = cart_item.product
                snapshot_price = product.sales_price if product.sales_price is not None else product.regular_price

                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=cart_item.quantity,
                    price=snapshot_price
                )

                total_items_amount += float(snapshot_price) * cart_item.quantity
                items_added.append(order_item)

                # remove cart item
                cart_item.delete()

            # Set order totals (shipping fee may be passed)
            shipping_fee_decimal = float(delivery_fee) if delivery_fee is not None else 0.0
            order.total_items_amount = total_items_amount
            order.shipping_fee = shipping_fee_decimal
            order.grand_total = total_items_amount + shipping_fee_decimal

            # If any of the products are preorder set flags (simple check)
            downpayment_required = any([p.product.is_preorder for p in order.items.all()])
            order.downpayment_required = downpayment_required
            if downpayment_required:
                order.downpayment_amount = (order.grand_total * 0.5)
            order.save()

            # Create Delivery record (linked to order)
            delivery = Delivery.objects.create(
                order=order,
                quotation_id=quotation_id,
                pickup_stop_id=pickup_stop_id,
                dropoff_stop_id=dropoff_stop_id,
                delivery_fee=delivery_fee or 0,
                distance_m=distance_m or 0,
                quotation_expires_at=quotation_expires_at,
                status="quotation_attached"
            )

            # return minimal summary
            return Response({
                "order_id": order.id,
                "order_status": order.status,
                "delivery_id": delivery.id,
                "message": "Order created, delivery attached"
            }, status=201)
