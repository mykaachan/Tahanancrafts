from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter

from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce, ExtractMonth, ExtractYear
from decimal import Decimal

from users.models import CustomUser, Artisan
from products.models import Product, Order, OrderItem
from .serializers import (
    ProductSerializer,
    CustomerSerializer,
    ArtisanSerializer,
    OrderSerializer,
)
from .permission import IsAdmin

class AdminDashboardAnalyticsView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        print("🔥 ANALYTICS VIEW HIT")
        print("USER:", request.user)
        return Response({"ok": True})


    def get(self, request):
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
                "total_customers": CustomUser.objects.filter(role="customer").count(),
                "total_artisans": Artisan.objects.count(),
                "total_orders": Order.objects.count(),

                "artisan_total_earnings": Order.objects.aggregate(
                    total=Coalesce(
                        Sum((F("total_items_amount") * Decimal("0.92")) + F("shipping_fee"),
                            output_field=DecimalField()),
                        Decimal("0.00")
                    )
                )["total"],

                "platform_revenue": Order.objects.aggregate(
                    total=Coalesce(
                        Sum(F("total_items_amount") * Decimal("0.08"),
                            output_field=DecimalField()),
                        Decimal("0.00")
                    )
                )["total"],

                "total_sales": Order.objects.aggregate(
                    total=Coalesce(
                        Sum(F("total_items_amount") + F("shipping_fee"),
                            output_field=DecimalField()),
                        Decimal("0.00")
                    )
                )["total"],

                "monthly_platform_revenue": list(monthly_platform_revenue),
            }
        })

class AdminPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"  # optional
    max_page_size = 5

class AdminProductListView(ListAPIView):
    queryset = Product.objects.select_related("artisan").prefetch_related(
        "categories", "materials", "images"
    ).order_by("-created_at")   # ✅ FIX warning + stable pagination

    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = AdminPagination

    # 🔍 SEARCH SUPPORT
    filter_backends = [SearchFilter]
    search_fields = [
        "name",
        "description",
        "artisan__name",
        "brandName",
    ]
        
class AdminOrderListView(ListAPIView):
    queryset = Order.objects.select_related(
        "artisan", "shipping_address"
    ).prefetch_related("items")
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = AdminPagination

class AdminCustomerListView(ListAPIView):
    queryset = CustomUser.objects.filter(role="customer")
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = AdminPagination

class AdminArtisanListView(ListAPIView):
    queryset = Artisan.objects.all()
    serializer_class = ArtisanSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = AdminPagination
    from django.db.models import Count
    qs = Artisan.objects.annotate(
        order_count=Count("orders")
    ).order_by("-created_at")

class AdminTopArtisanView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        SOLD_STATUSES = ["completed", "delivered", "to_review"]

        top = (
            OrderItem.objects
            .filter(order__status__in=SOLD_STATUSES)
            .annotate(
                artisan_id=F("product__artisan__id"),
                artisan_name=F("product__artisan__name"),
                earnings=F("quantity") * F("price")
            )
            .values("artisan_id", "artisan_name")
            .annotate(total_earnings=Sum("earnings", output_field=DecimalField()))
            .order_by("-total_earnings")
            .first()
        )

        return Response(top or {})

class AdminTopSellingProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        SOLD_STATUSES = ["completed", "delivered", "to_review"]

        products = (
            OrderItem.objects
            .filter(order__status__in=SOLD_STATUSES)
            .values(
                "product__id",
                "product__name",
                "product__main_image",
                "product__artisan__name"
            )
            .annotate(total_sold=Sum("quantity"))
            .order_by("-total_sold")[:3]
        )

        return Response(products)

class AdminRecentOrdersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        orders = (
            Order.objects
            .order_by("-created_at")[:5]
            .values(
                "id",
                "status",
                "grand_total",
                "total_items_amount",
                "created_at"
            )
        )

        return Response(orders)