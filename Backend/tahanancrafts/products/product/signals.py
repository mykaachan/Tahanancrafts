from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import OrderItem, Product
from django.db.models import Sum, Q

@receiver([post_save, post_delete], sender=OrderItem)
def update_product_sold_count(sender, instance, **kwargs):
    product = instance.product
    valid = ['completed','delivered','to_receive','to_review']
    total = product.order_items.filter(order__status__in=valid).aggregate(total=Sum('quantity'))['total'] or 0
    Product.objects.filter(pk=product.pk).update(sold_count=total)