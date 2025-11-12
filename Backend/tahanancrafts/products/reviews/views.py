from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from products.models import Rating
from .serializers import ProductRatingSerializer

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

