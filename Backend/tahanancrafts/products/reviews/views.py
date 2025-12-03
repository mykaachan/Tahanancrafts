from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from products.models import Rating
from .serializers import ProductRatingSerializer
from products.models import Order, OrderTimeline,OrderItem, Product
from users.models import CustomUser
from django.shortcuts import get_object_or_404

class ReviewTestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "GET review works!"})
    def post(self, request):
        return Response({"message": "POST review works too!"})

# products/views.py


class ProductRatingViewSet(viewsets.ModelViewSet):
    serializer_class = ProductRatingSerializer
    permission_classes = [permissions.AllowAny]  # anyone can view

    def get_queryset(self):
        queryset = Rating.objects.select_related('user', 'product')
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset.order_by('-created_at')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CreateReview(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get("user")
        order_item_id = request.data.get("order_item")
        product_id = request.data.get("product")
        score = request.data.get("score")
        review_text = request.data.get("review")
        anonymous = request.data.get("anonymous", False)

        if not (user_id and order_item_id and product_id and score):
            return Response({"error": "Missing required fields"}, status=400)

        # Fetch required objects
        user = get_object_or_404(CustomUser, id=user_id)
        order_item = get_object_or_404(OrderItem, id=order_item_id)
        order = order_item.order
        product = get_object_or_404(Product, id=product_id)

        # Check if user owns the order item
        if order.user.id != user.id:
            return Response({"error": "You are not allowed to review this item"}, status=403)

        # Prevent duplicate review per order_item
        if Rating.objects.filter(order_item=order_item).exists():
            return Response({"error": "You already reviewed this item"}, status=400)

        # Create review
        rating = Rating.objects.create(
            user=user,
            product=product,
            order_item=order_item,
            score=score,
            review=review_text,
            anonymous=anonymous
        )

        # Mark order_item as reviewed
        order_item.reviewed = True
        order_item.save()

        # Check if ALL items in the order are reviewed → update order status
        all_reviewed = order.items.filter(reviewed=True).count() == order.items.count()
        if all_reviewed:
            order.status = Order.STATUS_COMPLETED
            order.save()

            # Add order timeline
            OrderTimeline.objects.create(
                order=order,
                status=Order.STATUS_COMPLETED,
                description="Buyer reviewed all purchased product."
            )

        OrderTimeline.objects.create(
            order=order,
            status=Order.STATUS_TO_REVIEW,
            description=f"Reviewed product: {product.name}"
        )

        return Response({
            "message": "Review submitted successfully.",
            "review_id": rating.id
        }, status=201)

