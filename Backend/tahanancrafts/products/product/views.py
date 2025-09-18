from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import ProductSerializer, UpdateProductSerializer
from products.models import Product, Category, Material
from rest_framework.generics import ListAPIView
from products.models import Product
from .serializers import ProductSerializer
from rest_framework import serializers

class ProductListView(ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get("category")
        material = self.request.query_params.get("material")

        # Filter by category (id or name)
        if category:
            queryset = queryset.filter(categories__name__icontains=category) | queryset.filter(categories__id=category)

        # Filter by material (id or name)
        if material:
            queryset = queryset.filter(materials__name__icontains=material) | queryset.filter(materials__id=material)

        return queryset.distinct()

# Category List
class CategoryListView(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.ModelSerializer

    class _CategorySerializer(serializers.ModelSerializer):
        class Meta:
            model = Category
            fields = ["id", "name"]

    serializer_class = _CategorySerializer


# Material List
class MaterialListView(ListAPIView):
    queryset = Material.objects.all()
    serializer_class = serializers.ModelSerializer

    class _MaterialSerializer(serializers.ModelSerializer):
        class Meta:
            model = Material
            fields = ["id", "name"]

    serializer_class = _MaterialSerializer

class AddProductView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        data = request.data

        # ✅ Debug: show incoming request data
        print("Incoming Data:", data)

        # ✅ Check for required fields manually
        required_fields = ["name", "description", "brandName", "stock_quantity", "regular_price", "categories", "materials"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return Response(
                {"error": f"Missing required fields: {', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Validate categories
        categories = data.getlist("categories") if hasattr(data, "getlist") else data.get("categories", [])
        invalid_categories = [cat_id for cat_id in categories if not Category.objects.filter(id=cat_id).exists()]
        if invalid_categories:
            return Response(
                {"error": f"Invalid category IDs: {invalid_categories}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Validate materials
        materials = data.getlist("materials") if hasattr(data, "getlist") else data.get("materials", [])
        invalid_materials = [mat_id for mat_id in materials if not Material.objects.filter(id=mat_id).exists()]
        if invalid_materials:
            return Response(
                {"error": f"Invalid material IDs: {invalid_materials}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Run serializer
        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            product = serializer.save()
            return Response(
                {"message": "Product successfully added ✅", "product": serializer.data},
                status=status.HTTP_201_CREATED
            )

        # ❌ If serializer fails, show detailed errors
        print("Serializer Errors:", serializer.errors)
        return Response(
            {"error": "Serializer validation failed", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class ProductTestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "GET product works!"})
    def post(self, request):
        return Response({"message": "POST product works too!"})
    
class DeleteProductView(APIView):
    def delete(self, request, *args, **kwargs):
        product_id = request.data.get('id')
        if not product_id:
            return Response({"error": "Product id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(id=product_id)
            product.delete()
            return Response({"message": "Product deleted"}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

class UpdateProductView(APIView):
    def put(self, request, *args, **kwargs):
        serializer = UpdateProductSerializer(data=request.data)
        if serializer.is_valid():
            product_id = request.data.get('id')
            try:
                product = Product.objects.get(id=product_id)
                serializer.update(product, serializer.validated_data)
                return Response({"message": "Product updated successfully"}, status=status.HTTP_200_OK)
            except Product.DoesNotExist:
                return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class ReadProductView(APIView):
    def get(self, request, *args, **kwargs):
        product_id = request.data.get('id')
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
