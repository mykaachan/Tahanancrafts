# products/serializers.py
from rest_framework import serializers
from products.models import Cart, Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'regular_price', 'main_image', 'description']

class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    artisan_qr = serializers.SerializerMethodField()
    artisan_name = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id',
            'user',
            'product',
            'product_id',
            'quantity',
            'created_at',
            'total_price',
            'artisan_qr',    
            'artisan_name',   
        ]
        read_only_fields = ['id', 'created_at', 'user', 'total_price']

    def get_artisan_qr(self, obj):
        artisan = obj.product.artisan
        if artisan and artisan.gcash_qr:
            return artisan.gcash_qr.url
        return None

    def get_artisan_name(self, obj):
        artisan = obj.product.artisan
        if artisan:
            return artisan.name
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)

        cart_item, created = Cart.objects.get_or_create(
            user=user,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return cart_item
