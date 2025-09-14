from requests import request
from rest_framework import serializers  # For creating API serializers
from products.models import Product, Category, Material, ProductImage

# Serializer for additional product images
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['image']  # Only include the image field

# Main serializer for Product creation and representation
class ProductSerializer(serializers.ModelSerializer):
    # Allow selecting multiple categories and materials by their IDs
    categories = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True)
    materials = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all(), many=True)
    # Accept multiple images for the product (besides the main picture)
    images = ProductImageSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            'name', 'description', 'brandName', 
            'stock_quantity', 'regular_price', 'sales_price', 
            'categories', 'materials', 'main_image', 'images'
        ]
  # Fields to expose in the API

    # Custom create method to handle many-to-many relationships and nested images
    def create(self, validated_data):
        # Extract categories, materials, and images from the validated data
        categories = validated_data.pop('categories')
        materials = validated_data.pop('materials')
        images= validated_data.pop('images', [])
        # Create the product instance with the remaining data
        product = Product.objects.create(**validated_data)
        # Set the many-to-many relationships
        product.categories.set(categories)
        product.materials.set(materials)
        # Create associated ProductImage instances for each image
        for image_data in images:
            ProductImage.objects.create(product=product, **image_data)
        return product  # Return the created product instance

class UpdateProductSerializer(serializers.ModelSerializer):
    categories = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True)
    materials = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all(), many=True)
    images = serializers.ListField(
        child=serializers.ImageField(), required=False
    )
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'brandName', 
            'stock_quantity', 'regular_price', 'sales_price', 
            'categories', 'materials', 'main_image', 'images'
        ]

    
    def update(self, instance, validated_data):
        # Pop out related data
        categories = validated_data.pop('categories', None)
        materials = validated_data.pop('materials', None)
        images = validated_data.pop('images', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update many-to-many relationships if provided
        if categories is not None:
            instance.categories.set(categories)
        if materials is not None:
            instance.materials.set(materials)
        
        # Update nested images if provided
        if images is not None:
            instance.images.all().delete()
            for image in images:
                ProductImage.objects.create(product=instance, image=image)

        
        return instance
