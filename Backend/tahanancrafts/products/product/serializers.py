from requests import request
from rest_framework import serializers  # For creating API serializers
from products.models import Product, Category, Material, ProductImage, Rating
from users.models import Artisan
from django.db.models import Avg

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class ProductSerializer(serializers.ModelSerializer):
    artisan = serializers.PrimaryKeyRelatedField(read_only=True)  # ← FIX

    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True
    )
    materials = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(), many=True
    )
    images = ProductImageSerializer(many=True, required=False)
    brandName = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    long_description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Product
        fields = '__all__'


    def create(self, validated_data):
        categories = validated_data.pop('categories', [])
        materials = validated_data.pop('materials', [])
        images = validated_data.pop('images', [])

        # Create product
        product = Product.objects.create(**validated_data)


        # Add categories and materials
        product.categories.set(categories)
        product.materials.set(materials)

        # Save images
        for image_data in images:
            ProductImage.objects.create(product=product, **image_data)

        return product


    def update(self, instance, validated_data):
        categories_data = validated_data.pop("categories", [])
        materials_data = validated_data.pop("materials", [])
        images_data = validated_data.pop("images", [])

        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update categories
        if categories_data:
            instance.categories.clear()
            for category in categories_data:
                cat, _ = Category.objects.get_or_create(name=category["name"])
                instance.categories.add(cat)

        # Update materials
        if materials_data:
            instance.materials.clear()
            for material in materials_data:
                mat, _ = Material.objects.get_or_create(name=material["name"])
                instance.materials.add(mat)

        # Update images
        if images_data:
            instance.images.all().delete()
            for image_data in images_data:
                ProductImage.objects.create(product=instance, **image_data)

        return instance

class ArtisanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artisan
        fields = ["id", "name", "main_photo"]
        
class ProductReadSerializer(serializers.ModelSerializer):
    categories = serializers.StringRelatedField(many=True)
    materials = serializers.StringRelatedField(many=True)
    images = ProductImageSerializer(many=True, read_only=True)
    artisan = ArtisanSerializer(read_only=True)
    avg_rating = serializers.SerializerMethodField()
    order_count = serializers.IntegerField(read_only=True)


    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "long_description",   # ✅ ADD THIS
            "brandName",
            "stock_quantity", "regular_price", "sales_price",
            "main_image", "created_at", "categories",
            "materials", "images", "artisan","avg_rating","total_orders", "order_count"
        ]


    def get_avg_rating(self, obj):
        avg = Rating.objects.filter(product=obj).aggregate(Avg("score"))["score__avg"]
        return round(avg, 1) if avg else 0.0


class UpdateProductSerializer(serializers.ModelSerializer):

    # Make all M2M optional
    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        many=True,
        required=False
    )

    materials = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        many=True,
        required=False
    )

    # WRITE-ONLY image uploads (prevents the crash)
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = Product
        fields = [
            'name', 'description', 'long_description', 'brandName',
            'stock_quantity', 'regular_price', 'sales_price',
            'categories', 'materials',
            'main_image', 'images'
        ]
        extra_kwargs = {
            'name': {'required': False},
            'description': {'required': False},
            'long_description': {'required': False},
            'brandName': {'required': False},
            'stock_quantity': {'required': False},
            'regular_price': {'required': False},
            'sales_price': {'required': False},
            'main_image': {'required': False},
        }

    def update(self, instance, validated_data):

        categories = validated_data.pop('categories', None)
        materials = validated_data.pop('materials', None)
        images = validated_data.pop('images', None)

        # Update simple attributes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update relationships if sent
        if categories is not None:
            instance.categories.set(categories)

        if materials is not None:
            instance.materials.set(materials)

        # Update product gallery images
        if images is not None:
            instance.images.all().delete()
            for img in images:
                ProductImage.objects.create(product=instance, image=img)

        return instance
