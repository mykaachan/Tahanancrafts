from django.db.models import (
    Count, Sum, F, FloatField, ExpressionWrapper, Avg, Q
)
from rest_framework.views import APIView
from rest_framework.response import Response
from products.models import Product, Order, OrderItem
from products.dashboard.serializers import DashboardSerializer
from rest_framework.permissions import AllowAny
from django.db.models.functions import Round
from django.db.models import Sum, F, FloatField, ExpressionWrapper
from django.db.models.functions import TruncMonth

ARTISAN_FEE = 0.08  # 8%

class MonthlySalesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, artisan_id):
        delivered_statuses = ["delivered", "completed", "to_review"]

        monthly_sales = (
            OrderItem.objects.filter(
                product__artisan_id=artisan_id,
                order__status__in=delivered_statuses
            )
            .annotate(month=TruncMonth("order__created_at"))
            .values("month")
            .annotate(
                total_sales=Sum(
                    ExpressionWrapper(
                        F("price") * F("quantity") * (1 - ARTISAN_FEE),
                        output_field=FloatField()
                    )
                )
            )
            .order_by("month")
        )

        # Format for frontend
        result = [
            {
                "month": item["month"].strftime("%b %Y"),  # Example: Jan 2025
                "sales": round(item["total_sales"], 2) if item["total_sales"] else 0
            }
            for item in monthly_sales
        ]

        return Response(result)


class ArtisanDashboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, artisan_id):

        delivered_statuses = ["delivered", "to_review", "completed"]

        # ---------- ORDER COUNT METRICS ----------
        pending_orders = Order.objects.filter(
            items__product__artisan_id=artisan_id,
            status__in=["awaiting_payment", "awaiting_verification"]
        ).distinct().count()

        processing_orders = Order.objects.filter(
            items__product__artisan_id=artisan_id,
            status="processing"
        ).distinct().count()

        shipped_orders = Order.objects.filter(
            items__product__artisan_id=artisan_id,
            status__in=["ready_to_ship", "shipped", "in_transit"]
        ).distinct().count()

        delivered_orders = Order.objects.filter(
            items__product__artisan_id=artisan_id,
            status__in=delivered_statuses
        ).distinct().count()

        refund_orders = Order.objects.filter(
            items__product__artisan_id=artisan_id,
            status="refund"
        ).distinct().count()

        cancelled_orders = Order.objects.filter(
            items__product__artisan_id=artisan_id,
            status="cancelled"
        ).distinct().count()

        # ---------- TOTAL SALES ----------
        total_sales = Order.objects.filter(
            items__product__artisan_id=artisan_id,
            status__in=delivered_statuses
        ).annotate(
            net_amount=ExpressionWrapper(
                F("total_items_amount") * (1 - ARTISAN_FEE),
                output_field=FloatField()
            )
        ).aggregate(total=Sum("net_amount"))["total"] or 0

        # ---------- SALES PER PRODUCT ----------
        sales_per_products = (
            OrderItem.objects.filter(
                order__status__in=delivered_statuses + ["processing", "ready_to_ship", "shipped", "in_transit", "awaiting_payment", "awaiting_verification"],
                product__artisan_id=artisan_id
            )
            .values("product__id", "product__name", "product__main_image")
            .annotate(
                revenue=Sum(
                    ExpressionWrapper(
                        F("price") * F("quantity") * (1 - ARTISAN_FEE),
                        output_field=FloatField()
                    )
                ),

                # ⭐ Count ALL non-cancelled orders for this product
                total_orders=Count(
                    "order_id",
                    filter=~Q(order__status="cancelled"),
                    distinct=True
                ),

                # ⭐ Count only delivered-type orders
                delivered_count=Count(
                    "order_id",
                    filter=Q(order__status__in=delivered_statuses),
                    distinct=True
                )
            )
            .order_by("-revenue")
        )


        # ---------- SALES PER CATEGORY ----------
        sales_per_categories = (
            OrderItem.objects.filter(
                order__status__in=delivered_statuses,
                product__artisan_id=artisan_id
            )
            .values("product__categories__id", "product__categories__name")
            .annotate(
                revenue=Sum(
                    ExpressionWrapper(
                        F("price") * F("quantity") * (1 - ARTISAN_FEE),
                        output_field=FloatField()
                    )
                )
            )
            .order_by("-revenue")
        )

        # ---------- TOTAL ORDERS ----------
        total_orders = Order.objects.filter(
            items__product__artisan_id=artisan_id
        ).distinct().count()

        
        # ---------- SHOP PERFORMANCE ----------
        shop_performance = Product.objects.filter(
            artisan_id=artisan_id
        ).aggregate(
            avg_rating=Round(Avg("ratings__score"), 2)
        )["avg_rating"]

        # ---------- TOP SELLING PRODUCTS ----------
        top_selling_products = (
            OrderItem.objects.filter(
                order__status__in=delivered_statuses,
                product__artisan_id=artisan_id
            )
            .values("product__id", "product__name", "product__main_image")
            .annotate(num_orders=Count("order_id", distinct=True))
            .order_by("-num_orders")[:4]
        )

        # ---------- FINAL RESPONSE ----------
        data = {
            "pending_orders": pending_orders,
            "processing_orders": processing_orders,
            "shipped_orders": shipped_orders,
            "delivered_orders": delivered_orders,
            "refund_orders": refund_orders,
            "cancelled_orders": cancelled_orders,

            "total_sales": total_sales,

            "sales_per_products": list(sales_per_products),
            "sales_per_categories": list(sales_per_categories),

            "total_orders": total_orders,
            "shop_performance": shop_performance,
            "top_selling_products": list(top_selling_products),
        }

        serializer = DashboardSerializer(instance=data)
        return Response(serializer.data)
    

class ArtisanTransactionHistoryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, artisan_id):

        orders = (
            Order.objects.filter(items__product__artisan_id=artisan_id)
            .prefetch_related("items__product")
            .order_by("-created_at")
            .distinct()
        )

        history = []

        for order in orders:
            for item in order.items.all():

                history.append({
                    "order_id": order.id,
                    "status": order.status,
                    "created_at": order.created_at,
                    "product_name": item.product.name,
                    "product_description": item.product.description,
                    "quantity": item.quantity,
                    "unit_price": float(item.price),
                    "item_total": float(item.price * item.quantity),

                    # FIXED — Return URL string only
                    "image": (
                        item.product.main_image.url 
                        if item.product.main_image 
                        else None
                    )
                })

        return Response(history)

