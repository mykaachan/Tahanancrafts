from rest_framework import serializers
from products.models import Product
from users.models import CustomUser
from users.models import Artisan, ArtisanPhoto


# PRODUCT SERIALIZER (only basic fields needed)
class ArtisanProductSerializer(serializers.ModelSerializer):
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "regular_price", "sales_price", "main_image", "created_at"]

    def get_main_image(self, obj):
        return obj.main_image.url if obj.main_image else None
    



# ARTISAN PHOTO SERIALIZER
class ArtisanPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtisanPhoto
        fields = ["id", "photo"]


# ARTISAN LIST / DETAIL SERIALIZER (WITH LATEST PRODUCTS)
class ArtisanWithProductsSerializer(serializers.ModelSerializer):
    photos = ArtisanPhotoSerializer(many=True, read_only=True)
    latest_products = serializers.SerializerMethodField()

    class Meta:
        model = Artisan
        fields = [
            "id", "name", "short_description", "location", "about_shop",
            "vision", "mission", "main_photo", "gcash_qr",
            "photos", "latest_products"
        ]

    def get_latest_products(self, obj):
        qs = Product.objects.filter(artisan=obj).order_by("-created_at")[:5]
        return ArtisanProductSerializer(qs, many=True).data


# ARTISAN UPDATE SERIALIZER (ALL OPTIONAL)
class ArtisanUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artisan
        fields = [
            "name", "short_description", "location",
            "about_shop", "vision", "mission",
            "main_photo", "gcash_qr"
        ]
        extra_kwargs = {
            field: {"required": False, "allow_null": True, "allow_blank": True}
            for field in fields
        }

class ArtisanPhotoUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtisanPhoto
        fields = ["photo"]
        extra_kwargs = {"photo": {"required": True}}

class ArtisanStorySerializer(serializers.ModelSerializer):
    photos = ArtisanPhotoSerializer(many=True, read_only=True)
    latest_products = serializers.SerializerMethodField()

    class Meta:
        model = Artisan
        fields = [
            "id",
            "name",
            "short_description",
            "location",
            "about_shop",
            "vision",
            "mission",
            "main_photo",
            "photos",
            "latest_products",
        ]

    def get_latest_products(self, artisan):
        # Return 6 latest products
        products = Product.objects.filter(artisan=artisan).order_by("-created_at")[:6]
        return ArtisanProductSerializer(products, many=True).data

