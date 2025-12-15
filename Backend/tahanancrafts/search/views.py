from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from products.models import Product
from users.models import Artisan   # adjust if your artisan model path differs


class GeneralSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        query = request.query_params.get("query", "").strip()

        if not query:
            return Response(
                {"results": []},
                status=status.HTTP_200_OK
            )

        results = []

        # =========================
        # 🔍 PRODUCT SEARCH
        # =========================
        products = Product.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(materials__name__icontains=query)
        ).distinct()

        for p in products:
            results.append({
                "type": "product",
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": str(p.sales_price or p.regular_price),
            })

        # =========================
        # 🔍 ARTISAN SEARCH
        # =========================
        artisans = Artisan.objects.filter(
            Q(name__icontains=query)
        ).distinct()

        for a in artisans:
            results.append({
                "type": "artisan",
                "id": a.id,
                "name": a.name,
                "location": a.location if hasattr(a, "location") else "",
            })

        return Response(
            {"results": results},
            status=status.HTTP_200_OK
        )
