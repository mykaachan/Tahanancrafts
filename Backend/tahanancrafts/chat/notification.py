from .models import Notification
from users.models import CustomUser


def notify_user(user, title, message, notif_type="system", icon="🔔"):
    if not user:
        return
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notif_type=notif_type,
        icon=icon,
    )


def notify_artisan(artisan, title, message, notif_type="system", icon="🔔"):
    if not artisan:
        return
    
    Notification.objects.create(
        artisan=artisan,
        title=title,
        message=message,
        notif_type=notif_type,
        icon=icon,
    )


def notify_admin(title, message, notif_type="system", icon="🔔"):
    admins = CustomUser.objects.filter(is_superuser=True)
    for admin in admins:
        Notification.objects.create(
            user=admin,
            title=title,
            message=message,
            notif_type=notif_type,
            icon=icon,
        )

def send_notification(event, order=None, buyer=None, artisan=None, extra=None):

    extra = extra or {}

    # --------------------------
    # ORDER REQUESTS
    # --------------------------
    if event == "new_order_cod":
        notify_artisan(
            artisan,
            "New Order Request – COD",
            f"You have a new COD order #{order.id}.",
            notif_type="order",
            icon="📦"
        )

    elif event == "new_order_preorder":
        notify_artisan(
            artisan,
            "New Order Request – Preorder",
            f"A preorder was placed for order #{order.id}.",
            notif_type="order",
            icon="📦"
        )

    # --------------------------
    # PAYMENTS
    # --------------------------
    elif event == "buyer_paid_shipping":
        notify_artisan(
            artisan,
            "Buyer Paid Shipping Fee",
            f"The buyer paid the shipping fee for order #{order.id}.",
            notif_type="payment",
            icon="🧾"
        )

    elif event == "buyer_uploaded_proof":
        notify_artisan(
            artisan,
            "Buyer Uploaded Downpayment Proof",
            f"Buyer submitted payment proof for order #{order.id}.",
            notif_type="payment",
            icon="💰"
        )

        notify_user(
            buyer,
            "Payment Proof Submitted",
            "Your proof was uploaded. Seller will verify it soon.",
            notif_type="payment",
            icon="💰"
        )

    # --------------------------
    # CANCELLATIONS
    # --------------------------
    elif event == "buyer_requested_cancel":
        notify_artisan(
            artisan,
            "Buyer Requested Cancellation",
            f"Buyer requested to cancel order #{order.id}.",
            notif_type="order",
            icon="🚫"
        )

        notify_user(
            buyer,
            "Cancellation Request Sent",
            "Your cancellation request was forwarded to the artisan.",
            notif_type="order",
            icon="🚫"
        )

    # --------------------------
    # LOW STOCK
    # --------------------------
    elif event == "low_stock":
        notify_artisan(
            artisan,
            "Low Stock Alert",
            f"Your product '{extra['product_name']}' is low on stock ({extra['remaining_stock']} left).",
            notif_type="inventory",
            icon="⚠️"
        )

        notify_admin(
            f"Low Stock Warning",
            f"Product '{extra['product_name']}' from artisan '{artisan.name}' is low ({extra['remaining_stock']} remaining).",
            notif_type="inventory",
            icon="⚠️"
        )
