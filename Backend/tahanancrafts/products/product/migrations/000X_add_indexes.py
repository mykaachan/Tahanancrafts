from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('product', '000X_previous'),
    ]
    operations = [
        migrations.AddIndex(
            model_name='orderitem',
            index=models.Index(fields=['product_id'], name='orderitem_product_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['status'], name='order_status_idx'),
        ),
    ]