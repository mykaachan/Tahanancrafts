from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from decimal import Decimal
from django.db.models.functions import ExtractMonth, ExtractYear


from users.models import CustomUser, Artisan
from products.models import  Product, Order
from .serializers import (
    ProductSerializer,
    CustomerSerializer,
    ArtisanSerializer,
    OrderSerializer,
)


class DashboardAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):

        # 1. TOTAL COUNTS
        total_customers = CustomUser.objects.filter(role="customer").count()
        total_artisans = Artisan.objects.count()
        total_orders = Order.objects.count()

        # 2. ARTISAN TOTAL EARNINGS (92% of items + shipping fee)
        artisan_earnings = Order.objects.aggregate(
            total=Coalesce(
                Sum(
                    (F("total_items_amount") * Decimal("0.92")) + F("shipping_fee"),
                    output_field=DecimalField()
                ),
                Decimal("0.00")
            )
        )["total"]

        # 3. PLATFORM REVENUE (8%)
        platform_revenue = Order.objects.aggregate(
            total=Coalesce(
                Sum(
                    F("total_items_amount") * Decimal("0.08"),
                    output_field=DecimalField()
                ),
                Decimal("0.00")
            )
        )["total"]

        total_sales = Order.objects.aggregate(
            total=Coalesce(
                Sum(
                    F("total_items_amount") + F("shipping_fee"),
                    output_field=DecimalField()
                ),
                Decimal("0.00")
            )
        )["total"]

        products = ProductSerializer(Product.objects.all(), many=True).data
        customers = CustomerSerializer(CustomUser.objects.filter(role="customer"), many=True).data
        artisans = ArtisanSerializer(Artisan.objects.all(), many=True).data
        orders = OrderSerializer(Order.objects.all(), many=True).data  # includes items now

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
                "products": products,
                "customers": customers,
                "artisans": artisans,
                "orders": orders,  # contains items now
            }
        })