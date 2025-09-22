from requests import request
from rest_framework import serializers  # For creating API serializers
from products.models import Product, Category, Material, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']  

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    materials = MaterialSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brandName', 'description', 'stock_quantity',
            'regular_price', 'sales_price', 'main_image',
            'categories', 'materials', 'images', 'created_at'
        ]


class ProductReadSerializer(serializers.ModelSerializer):
    categories = serializers.StringRelatedField(many=True)
    materials = serializers.StringRelatedField(many=True)
    images = ProductImageSerializer(many=True, read_only=True)
    artisan = serializers.CharField(source="artisan.Name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "brandName",
            "stock_quantity", "regular_price", "sales_price",
            "main_image", "created_at", "categories",
            "materials", "images", "artisan"
        ]



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
