from decimal import Decimal
from collections import defaultdict
from products.models import Order, OrderItem, Product, Cart
from users.models import ShippingAddress

def create_orders_from_cart(user, shipping_address_id, cart_items):
    shipping_address = ShippingAddress.objects.get(id=shipping_address_id, user=user)

    # 1. GROUP CART ITEMS BY ARTISAN
    grouped = defaultdict(list)

    for item in cart_items:
        product = Product.objects.get(id=item["product_id"])
        artisan_id = product.artisan.id
        grouped[artisan_id].append({
            "product": product,
            "quantity": item["quantity"]
        })

    created_orders = []

    # 2. PROCESS EACH ARTISAN GROUP SEPARATELY
    for artisan_id, items in grouped.items():

        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            status=Order.STATUS_PENDING,
            payment_method="cod",
        )

        downpayment_needed = False

        # add order items
        for entry in items:
            product = entry["product"]
            qty = int(entry["quantity"])

            if product.requires_preorder(qty):
                downpayment_needed = True

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                price=product.effective_price,
            )

        # apply DP and payment method
        if downpayment_needed:
            order.downpayment_required = True
            order.payment_method = "gcash_down"
        else:
            order.downpayment_required = False
            order.payment_method = "cod"

        order.calculate_totals()

        created_orders.append(order)

    # DELETE CART after all orders created
    Cart.objects.filter(user=user).delete()

    return created_orders
