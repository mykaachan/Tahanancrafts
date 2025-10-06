from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, serializers as drf_serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from django.db.models import Q

from products.models import Product, Category, Material,ProductImage
from .serializers import ProductSerializer, UpdateProductSerializer, ProductReadSerializer


# LIST (Product list with search + filters)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .serializers import ProductReadSerializer
from products.models import Product

class ProductListView(APIView):

    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
    def get(self, request, id):
        try:
            product = Product.objects.get(id=id)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

