from rest_framework import serializers  # For creating API serializers
# products/serializers.py
from products.models import Rating, Product
from users.models import CustomUser


class ProductRatingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id',
            'user',
            'name',
            'product',
            'product_name',
            'order',
            'score',
            'review',
            'created_at',
            'updated_at',
            'anonymous',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        """
        Update rating if the user already reviewed this product,
        otherwise create a new one.
        """
        user = validated_data['user']
        product = validated_data['product']
        existing = Rating.objects.filter(user=user, product=product).first()
        if existing:
            existing.score = validated_data.get('score', existing.score)
            existing.review = validated_data.get('review', existing.review)
            existing.save()
            return existing
        return super().create(validated_data)
