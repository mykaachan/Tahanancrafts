from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, serializers as drf_serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from django.db.models import Q
from machineLearning.recommendations.recommendation import get_recommendations, get_personalized_recommendations
from users.models import Artisan, CustomUser
from products.models import Product, Category, Material,ProductImage, UserActivity
from .serializers import ProductSerializer, UpdateProductSerializer, ProductReadSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication


class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        params = request.query_params
        return self.filter_products(params)

    def filter_products(self, params):
        category_param = params.get("category", "")
        material_param = params.get("material", "")

        qs = Product.objects.all().prefetch_related("categories", "materials", "images")

        # ✅ Handle multiple categories (OR logic)
        if category_param:
            category_list = [c.strip() for c in category_param.split(",") if c.strip()]
            if all(c.isdigit() for c in category_list):
                qs = qs.filter(categories__id__in=category_list)
            else:
                qs = qs.filter(categories__name__in=category_list)

        # ✅ Handle multiple materials (OR logic)
        if material_param:
            material_list = [m.strip() for m in material_param.split(",") if m.strip()]
            if all(m.isdigit() for m in material_list):
                qs = qs.filter(materials__id__in=material_list)
            else:
                qs = qs.filter(materials__name__in=material_list)

        # ✅ Distinct to avoid duplicates
        serializer = ProductReadSerializer(qs.distinct(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



# Category List
class CategoryListView(ListAPIView):
    permission_classes = [AllowAny]
    queryset = Category.objects.all()

    class _CategorySerializer(drf_serializers.ModelSerializer):
        class Meta:
            model = Category
            fields = ["id", "name"]

    serializer_class = _CategorySerializer


# Material List
class MaterialListView(ListAPIView):
    permission_classes = [AllowAny]
    queryset = Material.objects.all()

    class _MaterialSerializer(drf_serializers.ModelSerializer):
        class Meta:
            model = Material
            fields = ["id", "name"]

    serializer_class = _MaterialSerializer


# CREATE product
class AddProductView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = ProductSerializer(data=request.data)

        if serializer.is_valid():
            product = serializer.save()

            # Handle categories (expecting list of IDs)
            category_ids = request.data.getlist("categories")
            if category_ids:
                product.categories.set(Category.objects.filter(id__in=category_ids))

            # Handle materials (expecting list of IDs)
            material_ids = request.data.getlist("materials")
            if material_ids:
                product.materials.set(Material.objects.filter(id__in=material_ids))

            # Handle images (expecting multiple uploaded files)
            images = request.FILES.getlist("images")
            for img in images:
                ProductImage.objects.create(product=product, image=img)

            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)

        # if invalid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Small test view
class ProductTestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "GET product works!"})
    def post(self, request):
        return Response({"message": "POST product works too!"})


# DELETE product
class DeleteProductView(APIView):
    def delete(self, request, *args, **kwargs):
        product_id = request.data.get('id') or request.query_params.get('id') or kwargs.get('id')
        if not product_id:
            return Response({"error": "Product id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(id=product_id)
            product.delete()
            return Response({"message": "Product and related data deleted"}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


# UPDATE product
class UpdateProductView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, *args, **kwargs):
        product_id = request.data.get('id') or request.query_params.get('id') or kwargs.get('id')
        if not product_id:
            return Response({"error": "Product id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateProductSerializer(instance=product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Product updated successfully", "product": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ProductDetailView(APIView):
    # Keep public access
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]  # important

    def get(self, request, id):
        try:
            product = Product.objects.get(id=id)

            serializer = ProductSerializer(product)
            return Response(serializer.data)

        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        
class RecommendedProductsView(APIView):
    def get(self, request, product_id):
        try:
            recommended_products = get_recommendations(product_id)
            serializer = ProductSerializer(recommended_products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# products/views.py
class LogProductView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        product_id = request.data.get("product_id")
        user_id = request.data.get("user_id")  # <- get it from body
        user = None
        if user_id:
            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                pass

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        UserActivity.objects.create(
            user=user,
            product=product,
            action="View"
        )
        return Response({"message": "View logged successfully."}, status=201)

class ProductDetailRecommendedView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        recommended_products = get_recommendations(product_id, top_n=8)
        # Make sure it's always a list
        recommended_products = recommended_products or []
        serializer = ProductSerializer(recommended_products, many=True)
        return Response(serializer.data)

class ProductPersonalizedView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        recommended = get_personalized_recommendations(user_id, top_n=50)
        serializer = ProductReadSerializer(recommended, many=True)
        return Response(serializer.data)
    
# views.py
class FeaturedProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get("user_id")  # ✅ fetch from query params
        featured_products = get_personalized_recommendations(user_id, top_n=1)
        serializer = ProductReadSerializer(featured_products, many=True)
        return Response(serializer.data)

    
class ShopProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, artisan_id):
        # Fetch products by artisan
        products = Product.objects.filter(artisan__id=artisan_id).prefetch_related(
            "categories", "materials", "images"
        )
        product_serializer = ProductReadSerializer(products, many=True)

        # Fetch artisan info
        try:
            artisan_obj = Artisan.objects.get(id=artisan_id)
            artisan = {
                "name": artisan_obj.name,
                "location": artisan_obj.location,
                "main_photo": artisan_obj.main_photo.url if artisan_obj.main_photo else None,
            }
        except Artisan.DoesNotExist:
            artisan = None

        return Response({
            "products": product_serializer.data,
            "artisan": artisan
        }, status=status.HTTP_200_OK)

class LatestProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        latest_products = Product.objects.only("id", "name", "main_image").order_by("-created_at")[:3]
        data = [
            {
                "id": p.id,
                "name": p.name,
                "main_image": request.build_absolute_uri(p.main_image.url) if p.main_image else None,
            }
            for p in latest_products
        ]
        return Response(data, status=status.HTTP_200_OK)