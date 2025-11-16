from django.db import models
from users.models import CustomUser, Artisan
from django.conf import settings
from django.utils import timezone
from django.db import models
from decimal import Decimal



class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Material(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Product(models.Model):
    name = models.CharField(max_length=255)
    brandName = models.CharField(max_length=255, default="Unknown Brand")
    description = models.TextField()
    stock_quantity = models.PositiveIntegerField()
    regular_price = models.DecimalField(max_digits=10, decimal_places=2)
    sales_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    main_image = models.ImageField(upload_to='media/products/main/')
    categories = models.ManyToManyField(Category, related_name='products')
    materials = models.ManyToManyField(Material, related_name='products')
    is_preorder = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    artisan = models.ForeignKey(
        'users.Artisan',   # or 'yourappname.Artisan' if Artisan is in another app
        on_delete=models.CASCADE,
        related_name='products'
    )
    
    @property
    def effective_price(self):
        return self.regular_price

    def requires_preorder(self, qty=1):
        # Pre-order if: manually marked OR stock insufficient
        return self.is_preorder or self.stock_quantity < qty

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='media/products/others/')



class Cart(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        'users.CustomUser', 
        related_name='cart_items', 
        on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product, 
        related_name='cart_entries', 
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "cart"
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"
        unique_together = ('user', 'product')  # Prevent duplicate same product for same user

    def __str__(self):
        return f"{self.user.username} - {self.product.name} (x{self.quantity})"

    @property
    def total_price(self):
        """Optional helper for serializers/templates"""
        return self.product.effective_price * self.quantity


class UserActivity(models.Model):
    ACTION_CHOICES = [
        ("view", "Viewed"),
        ("like", "Liked"),
        ("cart", "Added to Cart"),
        ("purchase", "Purchased"),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)

    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} {self.action} {self.product.name}"


class Order(models.Model):
    STATUS_PENDING = "pending"
    STATUS_AWAITING_DOWNPAYMENT = "awaiting_downpayment"
    STATUS_AWAITING_SELLER_VERIFICATION = "awaiting_seller_verification"
    STATUS_PROCESSING = "processing"
    STATUS_READY_TO_SHIP = "ready_to_ship"
    STATUS_SHIPPED = "shipped"
    STATUS_DELIVERED = "delivered"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_AWAITING_DOWNPAYMENT, "Awaiting Downpayment"),
        (STATUS_AWAITING_SELLER_VERIFICATION, "Awaiting Seller Verification"),
        (STATUS_PROCESSING, "Processing"),
        (STATUS_READY_TO_SHIP, "Ready to Ship"),
        (STATUS_SHIPPED, "Shipped"),
        (STATUS_DELIVERED, "Delivered"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    shipping_address = models.ForeignKey(
        "users.ShippingAddress",    # <-- include the app name!
        on_delete=models.PROTECT,
        related_name="orders"
    )

    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default=STATUS_PENDING)

    # Payment
    payment_method = models.CharField(
        max_length=20,
        choices=[("cod", "Cash on Delivery"), ("gcash_down", "GCash Downpayment")],
        default="cod"
    )

    # Downpayment always 50% for any preorder
    downpayment_required = models.BooleanField(default=False)
    downpayment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    gcash_proof = models.ImageField(upload_to="payment_proofs/", null=True, blank=True)
    payment_verified = models.BooleanField(default=False)

    # totals
    total_items_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_totals(self):
        items_total = sum((item.subtotal for item in self.items.all()))
        self.total_items_amount = items_total
        self.grand_total = items_total + self.shipping_fee

        # Always 50% if preorder
        if self.downpayment_required:
            self.downpayment_amount = (self.grand_total * Decimal("0.50"))
        else:
            self.downpayment_amount = Decimal("0.00")

        self.save()



class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, related_name="items", on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product, related_name="order_items", on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # snapshot of product price

    def __str__(self):
        return f"{self.product.name} (x{self.quantity}) in Order #{self.order.id}"

    @property
    def subtotal(self):
        return self.price * self.quantity
    

class Rating(models.Model):
    user = models.ForeignKey(
        CustomUser, related_name="ratings", on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product, related_name="ratings", on_delete=models.CASCADE
    )
    order_item = models.ForeignKey(
        'products.OrderItem',  # reference to specific item in an order
        related_name="ratings",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Link to the specific product in the order"
    )
    score = models.PositiveSmallIntegerField(
        default=5,
        help_text="Rating score from 1 to 5"
    )
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    anonymous = models.BooleanField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "order_item"],
                name="unique_user_orderitem_rating"
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} rated {self.product.name} ({self.score}⭐)"

class UserRecommendations(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product_ids = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Recommendations for {self.user_id} (updated {self.updated_at})"
    
class Delivery(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="delivery")

    quotation_id = models.CharField(max_length=255, null=True, blank=True)
    lalamove_order_id = models.CharField(max_length=255, null=True, blank=True)
    distance_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=50, default="pending")
    pod_image_url = models.URLField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, null=True)
