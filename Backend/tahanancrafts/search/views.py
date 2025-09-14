from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from products.models import Product
from django.db.models import Q


class GeneralSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        query = request.query_params.get('query', None)
        if not query:
            return Response({"error": "No query provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Search across name, description, category name, and material name
        # for products muna kasi wala pang artisans/sellers sa models
        products = Product.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(categories__name__icontains=query) |
            Q(materials__name__icontains=query)
        ).distinct()

        results = []
        for p in products:
            results.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "stock_quantity": p.stock_quantity,
                "regular_price": str(p.regular_price),
                "sales_price": str(p.sales_price) if p.sales_price else None,
                "main_picture": p.main_picture.url if p.main_picture else None,
                "categories": [c.name for c in p.categories.all()],
                "materials": [m.name for m in p.materials.all()],
                "created_at": p.created_at,
                "other_images": [img.image.url for img in p.images.all()]
            })

        return Response({"results": results}, status=status.HTTP_200_OK)