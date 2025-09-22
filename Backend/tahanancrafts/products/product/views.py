# views.py
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, serializers as drf_serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from products.models import Product, Category, Material
from .serializers import ProductSerializer, UpdateProductSerializer, ProductReadSerializer

# LIST (uses ProductReadSerializer so the frontend gets readable fields)
class ProductListView(ListAPIView):
    serializer_class = ProductReadSerializer

    def get_queryset(self):
        qs = Product.objects.all().prefetch_related('categories', 'materials', 'images')
        serializer_class = ProductSerializer
        category = self.request.query_params.get("category")
        material = self.request.query_params.get("material")


        if category:
            # accept either name or id
            if category.isdigit():
                qs = qs.filter(categories__id=category)
            else:
                qs = qs.filter(categories__name__icontains=category)

        if material:
            if material.isdigit():
                qs = qs.filter(materials__id=material)
            else:
                qs = qs.filter(materials__name__icontains=material)

        return qs.distinct()


# Category List (keeps same shape as you attempted)
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


# CREATE product (keeps your parser_classes and validations)
class AddProductView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        data = request.data

        # Debug print
        print("Incoming Data keys:", list(data.keys()))

        required_fields = ["name", "description", "brandName", "stock_quantity", "regular_price", "categories", "materials"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return Response({"error": f"Missing required fields: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

        # validate categories (works with form-data lists)
        categories = data.getlist("categories") if hasattr(data, "getlist") else data.get("categories", [])
        invalid_cats = [cid for cid in categories if not Category.objects.filter(id=cid).exists()]
        if invalid_cats:
            return Response({"error": f"Invalid category IDs: {invalid_cats}"}, status=status.HTTP_400_BAD_REQUEST)

        # validate materials
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


# DELETE -- keeps your original behavior (id in body), but also accepts ?id=... for convenience
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


# UPDATE -- corrected serializer usage (instance + data)
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
            serializer.save()  # calls your custom update()
            return Response({"message": "Product updated successfully", "product": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# READ single product -- accepts ?id=... or id in kwargs
class ReadProductView(APIView):
    def get(self, request, *args, **kwargs):
        product_id = request.query_params.get('id') or kwargs.get('id')
        if not product_id:
            return Response({"error": "Product id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductReadSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
