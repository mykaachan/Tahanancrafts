from rest_framework import serializers

class DashboardSerializer(serializers.Serializer):
    pending_orders = serializers.IntegerField()
    processing_orders = serializers.IntegerField()
    shipped_orders = serializers.IntegerField()
    delivered_orders = serializers.IntegerField()
    refund_orders = serializers.IntegerField()
    cancelled_orders = serializers.IntegerField()

    total_sales = serializers.FloatField()

    sales_per_products = serializers.ListField()
    sales_per_categories = serializers.ListField()

    total_orders = serializers.IntegerField()
    shop_performance = serializers.FloatField(allow_null=True)
    top_selling_products = serializers.ListField()
