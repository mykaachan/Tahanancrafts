from django.db import models
from users.models import CustomUser, Artisan
from django.conf import settings
from django.utils import timezone


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
    created_at = models.DateTimeField(auto_now_add=True)

    artisan = models.ForeignKey(
        'users.Artisan',   # or 'yourappname.Artisan' if Artisan is in another app
        on_delete=models.CASCADE,
        related_name='products'
    )
    

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='media/products/others/')

from django.db import models
from products.models import Product  # adjust path if needed

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
        return self.product.price * self.quantity


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
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "Unpaid"),
        ("paid", "Paid"),
        ("refunded", "Refunded"),
    ]

    user = models.ForeignKey(
        CustomUser, related_name="orders", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default="unpaid"
    )
    shipping_address = models.TextField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # optional tracking fields
    tracking_number = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

    def calculate_total(self):
        """Recalculate total based on all OrderItems."""
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save()
        return total


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