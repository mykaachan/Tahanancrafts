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

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Product successfully added", "product": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
