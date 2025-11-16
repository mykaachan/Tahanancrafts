from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, serializers as drf_serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from django.db.models import Q
import machineLearning.recommendations.recommendation as reco
from users.models import Artisan, CustomUser
from products.models import Product, Category, Material,ProductImage, UserActivity, UserRecommendations
from .serializers import ProductSerializer, UpdateProductSerializer, ProductReadSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from checkout.services.checkout_service import create_orders_from_cart



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

            serializer = ProductReadSerializer(product)
            return Response(serializer.data)

        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        
class RecommendedProductsView(APIView):
    def get(self, request, product_id):
        try:
            recommended_products = reco.get_recommendations(product_id)
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

class ProductPersonalizedView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            rec = UserRecommendations.objects.get(user_id=user_id)
            product_ids = rec.product_ids or []
            if not product_ids:
                raise UserRecommendations.DoesNotExist

            qs = Product.objects.filter(id__in=product_ids).prefetch_related("images", "categories", "materials")
            # preserve order
            products_sorted = sorted(qs, key=lambda p: product_ids.index(p.id))
            serializer = ProductReadSerializer(products_sorted, many=True)
            return Response(serializer.data)
        except UserRecommendations.DoesNotExist:
            fallback = Product.objects.order_by("-created_at")[:10]
            serializer = ProductReadSerializer(fallback, many=True)
            return Response(serializer.data)

# --- FEATURED (top 1) ---
class FeaturedProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            fallback = Product.objects.order_by("-created_at")[:1]
            return Response(ProductReadSerializer(fallback, many=True).data)

        try:
            rec = UserRecommendations.objects.get(user_id=user_id)
            if not rec.product_ids:
                fallback = Product.objects.order_by("-created_at")[:1]
                return Response(ProductReadSerializer(fallback, many=True).data)

            top_id = rec.product_ids[0]
            product = Product.objects.filter(id=top_id)
            return Response(ProductReadSerializer(product, many=True).data)
        except UserRecommendations.DoesNotExist:
            fallback = Product.objects.order_by("-created_at")[:1]
            return Response(ProductReadSerializer(fallback, many=True).data)

# --- PRODUCT DETAIL: RECOMMEND (fast category-based fallback) ---
class ProductDetailRecommendedView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        # fast: use category overlap for similar products (no heavy ML)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        same_category = Product.objects.filter(categories__in=product.categories.all()).exclude(id=product_id).distinct().prefetch_related("images")[:8]
        if same_category and same_category.count() >= 3:
            serializer = ProductSerializer(same_category, many=True)
            return Response(serializer.data)

        # fallback: newest products (random subset)
        fallback = Product.objects.exclude(id=product_id).order_by("-created_at")[:8]
        return Response(ProductSerializer(fallback, many=True).data)

    
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
    
@api_view(['GET'])
@permission_classes([AllowAny])
def top_selling_products(request, artisan_id=None):
    """
    Returns top 4 products for an artisan prioritized by:
    1. Purchases
    2. Likes (if no purchases)
    3. Views (if no likes)
    """
    actions = UserActivity.objects.all()

    if artisan_id:
        actions = actions.filter(product__artisan_id=artisan_id)

    # Try to get top by purchase
    purchases = (
        actions.filter(action='purchase')
        .values('product')
        .annotate(count=Count('id'))
        .order_by('-count')[:4]
    )

    product_ids = [p['product'] for p in purchases]

    # If no purchases, fallback to likes
    if not product_ids:
        likes = (
            actions.filter(action='like')
            .values('product')
            .annotate(count=Count('id'))
            .order_by('-count')[:4]
        )
        product_ids = [l['product'] for l in likes]

    # If no likes either, fallback to views
    if not product_ids:
        views = (
            actions.filter(action='view')
            .values('product')
            .annotate(count=Count('id'))
            .order_by('-count')[:4]
        )
        product_ids = [v['product'] for v in views]

    # If still none, just show first few products from that artisan
    if not product_ids:
        if artisan_id:
            products = Product.objects.filter(artisan_id=artisan_id)[:4]
        else:
            products = Product.objects.all()[:4]
    else:
        products = list(Product.objects.filter(id__in=product_ids))
        # Preserve order (so the top-ranked products stay on top)
        products.sort(key=lambda p: product_ids.index(p.id))

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

class CheckoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cart_items = request.data.get("cart_items", [])
        shipping_address_id = request.data.get("shipping_address_id")

        if not cart_items:
            return Response({"error": "Cart is empty"}, status=400)

        if not shipping_address_id:
            return Response({"error": "shipping_address_id required"}, status=400)

        try:
            orders = create_orders_from_cart(
                user=request.user,
                shipping_address_id=shipping_address_id,
                cart_items=cart_items
            )
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        # Build response for ALL orders
        result = []

        for order in orders:
            if order.downpayment_required:
                first_item = order.items.first()
                artisan = first_item.product.artisan
                qr = artisan.gcash_qr.url if artisan.gcash_qr else None
            else:
                qr = None

            result.append({
                "order_id": order.id,
                "payment_method": order.payment_method,
                "downpayment_required": order.downpayment_required,
                "downpayment_amount": str(order.downpayment_amount),
                "grand_total": str(order.grand_total),
                "total_items_amount": str(order.total_items_amount),
                "shipping_fee": str(order.shipping_fee),
                "gcash_qr": qr,
            })

        return Response(result, status=201)
