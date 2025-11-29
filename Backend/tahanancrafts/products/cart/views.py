# products/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import CartSerializer
from products.models import Cart, Product, UserActivity
from users.models import CustomUser
from rest_framework import status


class CartView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get("user_id")
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        # Validate user
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Validate product
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        cart_item, created = Cart.objects.get_or_create(
            user=user,
            product=product,
            defaults={"quantity": quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        UserActivity.objects.create(
            user=user,
            product=product,
            action="Added to cart"
        )

        return Response({"message": "✅ Added to cart successfully!"}, status=status.HTTP_201_CREATED)

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"error": "Missing user_id"}, status=400)

        cart_items = Cart.objects.filter(user_id=user_id).select_related(
            "product", "product__artisan"
        )

        grouped = {}

        for item in cart_items:
            artisan = item.product.artisan
            artisan_id = artisan.id
            artisan_name = artisan.name
            artisan_qr = request.build_absolute_uri(artisan.gcash_qr.url) if artisan.gcash_qr else None

            if artisan_id not in grouped:
                grouped[artisan_id] = {
                    "artisan_id": artisan_id,
                    "artisan_name": artisan_name,
                    "artisan_qr": artisan_qr,
                    "items": []
                }

            grouped[artisan_id]["items"].append({
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "description": item.product.description,
                    "price": float(item.product.sales_price or item.product.regular_price),
                    "main_image": (
                        request.build_absolute_uri(item.product.main_image.url)
                        if item.product.main_image
                        else None
                    ),
                },
                "quantity": item.quantity,
                "total_price": float(
                    (item.product.sales_price or item.product.regular_price) * item.quantity
                ),
            })

        return Response(list(grouped.values()), status=200)




class CartListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        cart_items = Cart.objects.filter(user_id=user_id).select_related("product", "product__artisan")

        data = [
            {
                "id": item.id,
                "product_id": item.product.id,
                "product_name": item.product.name,
                "quantity": item.quantity,
                "price": float(item.product.sales_price or item.product.regular_price),
                "total_price": float((item.product.sales_price or item.product.regular_price) * item.quantity),

                "artisan_name": item.product.artisan.name,
                "artisan_qr": (
                    request.build_absolute_uri(item.product.artisan.gcash_qr.url)
                    if item.product.artisan.gcash_qr
                    else None
                ),
            }
            for item in cart_items
        ]
        return Response(data)


class CartDetailView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk, user_id):
        try:
            cart_item = Cart.objects.get(pk=pk, user_id=user_id)
        except Cart.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartSerializer(
            cart_item,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cart_item = Cart.objects.get(pk=pk, user_id=user_id)
        except Cart.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
        
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


