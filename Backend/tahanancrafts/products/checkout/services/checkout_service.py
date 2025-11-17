from decimal import Decimal
from collections import defaultdict
from products.models import Order, OrderItem, Product, Cart   # FIXED
from users.models import ShippingAddress

def create_orders_from_cart(user, shipping_address_id, cart_item_ids):

    # Validate shipping address
    shipping_address = ShippingAddress.objects.get(id=shipping_address_id, user=user)

    # Fetch chosen cart rows
    cart_items = Cart.objects.filter(id__in=cart_item_ids, user=user)

    if not cart_items.exists():
        raise Exception("No valid cart items found.")

    # GROUP CART ITEMS BY ARTISAN
    grouped = defaultdict(list)

    for c in cart_items:
        product = c.product
        artisan_id = product.artisan.id

        grouped[artisan_id].append({
            "product": product,
            "quantity": c.quantity
        })

    created_orders = []

    # PROCESS PER ARTISAN
    for artisan_id, items in grouped.items():

        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            status=Order.STATUS_PENDING,
            payment_method="cod",  # default
        )

        downpayment_needed = False

        # ORDER ITEMS
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

        # APPLY PREORDER RULES
        if downpayment_needed:
            order.downpayment_required = True
            order.payment_method = "gcash_down"
        else:
            order.downpayment_required = False
            order.payment_method = "cod"

        # CALCULATE TOTALS
        order.calculate_totals()

        created_orders.append(order)

    # DELETE ONLY SELECTED CART ROWS
    Cart.objects.filter(id__in=cart_item_ids).delete()

    return created_orders
