from rest_framework import serializers  # For creating API serializers
from products.models import Product  # Your product model

class filterCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['categories']  # Only include the categories field

class filterMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['materials']  # Only include the materials field
        