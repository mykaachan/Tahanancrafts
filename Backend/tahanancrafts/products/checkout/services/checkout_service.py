from decimal import Decimal
from collections import defaultdict
from products.models import Order, OrderItem, Product, CartItem, Cart
from users.models import ShippingAddress

def create_orders_from_cart(user, shipping_address_id, cart_item_ids):

    # Validate shipping address
    shipping_address = ShippingAddress.objects.get(id=shipping_address_id, user=user)

    # Fetch actual cart items
    cart_items = CartItem.objects.filter(id__in=cart_item_ids, user=user)

    if not cart_items.exists():
        raise Exception("No valid cart items found.")

    # 1. GROUP CART ITEMS BY ARTISAN
    grouped = defaultdict(list)

    for c in cart_items:
        product = c.product
        artisan_id = product.artisan.id

        grouped[artisan_id].append({
            "product": product,
            "quantity": c.quantity
        })

    created_orders = []

    # 2. PROCESS EACH ARTISAN GROUP
    for artisan_id, items in grouped.items():

        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            status=Order.STATUS_PENDING,
            payment_method="cod",     # default
        )

        downpayment_needed = False

        # Add order items
        for entry in items:
            product = entry["product"]
            qty = int(entry["quantity"])

            # Mark if preorder requires downpayment
            if product.requires_preorder(qty):
                downpayment_needed = True

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                price=product.effective_price,
            )

        # Apply DP rules
        if downpayment_needed:
            order.downpayment_required = True
            order.payment_method = "gcash_down"
        else:
            order.downpayment_required = False
            order.payment_method = "cod"

        order.calculate_totals()

        created_orders.append(order)

    # Remove purchased cart items only
    CartItem.objects.filter(id__in=cart_item_ids).delete()

    return created_orders
