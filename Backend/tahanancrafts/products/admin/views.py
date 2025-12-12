from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce, ExtractMonth, ExtractYear
from decimal import Decimal

from users.models import CustomUser, Artisan
from products.models import Product, Order, ProductImage
from .serializers import CustomerSerializer, ArtisanSerializer, OrderSerializer

class DashboardAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):

        # ---- ANALYTICS (fast & lightweight) ----
        total_customers = CustomUser.objects.filter(role="customer").count()
        total_artisans = Artisan.objects.count()
        total_orders = Order.objects.count()

        artisan_earnings = Order.objects.aggregate(
            total=Coalesce(
                Sum((F("total_items_amount") * Decimal("0.92")) + F("shipping_fee"),
                    output_field=DecimalField()),
                Decimal("0.00")
            )
        )["total"]

        platform_revenue = Order.objects.aggregate(
            total=Coalesce(
                Sum(F("total_items_amount") * Decimal("0.08"),
                    output_field=DecimalField()),
                Decimal("0.00")
            )
        )["total"]

        total_sales = Order.objects.aggregate(
            total=Coalesce(
                Sum(F("total_items_amount") + F("shipping_fee"),
                    output_field=DecimalField()),
                Decimal("0.00")
            )
        )["total"]

        # ---- MONTHLY PLATFORM REVENUE ----
        monthly_platform_revenue = (
            Order.objects.annotate(
                month=ExtractMonth("created_at"),
                year=ExtractYear("created_at"),
                platform_fee=F("total_items_amount") * Decimal("0.08"),
            )
            .values("month", "year")
            .annotate(total=Sum("platform_fee"))
            .order_by("year", "month")
        )

        # ---- LISTS (OPTIMIZED) ----
        # Instead of loading thousands → load only first 10
        products_qs = Product.objects.prefetch_related(
            "categories", "materials", "images"
        ).select_related("artisan")[:10]

        products_data = []
        for p in products_qs:
            products_data.append({
                "id": p.id,
                "name": p.name,
                "brandName": p.brandName,
                "description": p.description,
                "long_description": p.long_description,
                "stock_quantity": p.stock_quantity,
                "regular_price": str(p.regular_price),
                "sales_price": str(p.sales_price),
                "main_image": p.main_image.url if p.main_image else None,
                "categories": [c.name for c in p.categories.all()],
                "materials": [m.name for m in p.materials.all()],
                "images": [img.image.url for img in p.images.all()],
                "is_preorder": p.is_preorder,
                "total_orders": p.total_orders,
                "created_at": p.created_at,
                "artisan": p.artisan_id,
            })

        customers = CustomerSerializer(
            CustomUser.objects.filter(role="customer")[:10],
            many=True
        ).data

        artisans = ArtisanSerializer(
            Artisan.objects.all()[:10], many=True
        ).data

        orders = OrderSerializer(
            Order.objects.select_related("artisan", "shipping_address")
            .prefetch_related("items")[:10],
            many=True
        ).data

        return Response({
            "analytics": {
                "total_customers": total_customers,
                "total_artisans": total_artisans,
                "total_orders": total_orders,
                "artisan_total_earnings": artisan_earnings,
                "platform_revenue": platform_revenue,
                "total_sales": total_sales,
                "monthly_platform_revenue": list(monthly_platform_revenue),
            },
            "lists": {
                "products": products_data,
                "customers": customers,
                "artisans": artisans,
                "orders": orders,
            }
        })
