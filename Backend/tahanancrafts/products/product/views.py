from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, serializers as drf_serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from django.db.models import Q

from products.models import Product, Category, Material
from .serializers import ProductSerializer, UpdateProductSerializer, ProductReadSerializer


# LIST (Product list with search + filters)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .serializers import ProductReadSerializer
from products.models import Product

class ProductListView(APIView):
    def get(self, request, *args, **kwargs):
        return self.filter_products(request.query_params)

    def post(self, request, *args, **kwargs):
        return self.filter_products(request.data)

    def filter_products(self, params):
        category = params.get("category", "")
        material = params.get("material", "")

        qs = Product.objects.all().prefetch_related("categories", "materials", "images")

        if category:
            if str(category).isdigit():
                qs = qs.filter(categories__id=category)
            else:
                qs = qs.filter(categories__name__icontains=category)

        if material:
            if str(material).isdigit():
                qs = qs.filter(materials__id=material)
            else:
                qs = qs.filter(materials__name__icontains=material)

        serializer = ProductReadSerializer(qs.distinct(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Category List
class CategoryListView(ListAPIView):
    queryset = Category.objects.all()

    class _CategorySerializer(drf_serializers.ModelSerializer):
        class Meta:
            model = Category
            fields = ["id", "name"]

    serializer_class = _CategorySerializer


# Material List
class MaterialListView(ListAPIView):
    queryset = Material.objects.all()

    class _MaterialSerializer(drf_serializers.ModelSerializer):
        class Meta:
            model = Material
            fields = ["id", "name"]

    serializer_class = _MaterialSerializer


# CREATE product
class AddProductView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        data = request.data
        print("Incoming Data keys:", list(data.keys()))

        required_fields = ["name", "description", "brandName", "stock_quantity", "regular_price", "categories", "materials"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return Response({"error": f"Missing required fields: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

        categories = data.getlist("categories") if hasattr(data, "getlist") else data.get("categories", [])
        invalid_cats = [cid for cid in categories if not Category.objects.filter(id=cid).exists()]
        if invalid_cats:
            return Response({"error": f"Invalid category IDs: {invalid_cats}"}, status=status.HTTP_400_BAD_REQUEST)

        materials = data.getlist("materials") if hasattr(data, "getlist") else data.get("materials", [])
        invalid_mats = [mid for mid in materials if not Material.objects.filter(id=mid).exists()]
        if invalid_mats:
            return Response({"error": f"Invalid material IDs: {invalid_mats}"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            product = serializer.save()
            return Response({"message": "Product successfully added ✅", "product": serializer.data}, status=status.HTTP_201_CREATED)

        print("Serializer errors:", serializer.errors)
        return Response({"error": "Serializer validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


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
    def get(self, request, *args, **kwargs):
        product_id = kwargs.get('id')
        if not product_id:
            return Response({"error": "Product id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductReadSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
