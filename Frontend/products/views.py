from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Product, ProductImage, Category
from .serializers import ProductSerializer, ProductImageSerializer, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        product = self.get_object()
        images = request.FILES.getlist('images')
        
        for image in images:
            ProductImage.objects.create(product=product, image=image)
        
        return Response({'status': 'images uploaded'}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def set_primary_image(self, request, pk=None):
        product = self.get_object()
        image_id = request.data.get('image_id')
        
        if image_id:
            # Remove primary status from all images
            ProductImage.objects.filter(product=product).update(is_primary=False)
            # Set new primary image
            image = get_object_or_404(ProductImage, id=image_id, product=product)
            image.is_primary = True
            image.save()
            
            return Response({'status': 'primary image set'})
        
        return Response({'error': 'image_id required'}, status=status.HTTP_400_BAD_REQUEST)
