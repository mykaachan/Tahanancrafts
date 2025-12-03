from rest_framework import serializers
from products.models import Rating
from users.models import CustomUser


class ProductRatingSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id',
            'user',
            'name',            
            'product',
            'product_name',
            'order_item',
            'score',
            'review',
            'anonymous',       
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        
        return Rating.objects.create(**validated_data)