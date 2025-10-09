from django.db import models
from users.models import CustomUser

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
