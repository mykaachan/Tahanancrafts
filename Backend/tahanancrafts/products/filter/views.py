from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from products.models import Product

class filterCategoriesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        categories = Product.objects.values_list("category", flat=True).distinct()
        return Response({"categories": list(categories)}, status=200)


class filterMaterialsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        materials = Product.objects.values_list("material", flat=True).distinct()
        return Response({"materials": list(materials)}, status=200)
