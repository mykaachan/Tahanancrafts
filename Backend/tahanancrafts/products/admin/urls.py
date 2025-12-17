from django.urls import path
from .views import (
    AdminDashboardAnalyticsView,
    AdminProductListView,
    AdminOrderListView,
    AdminCustomerListView,
    AdminArtisanListView,
    AdminTopArtisanView,
    AdminRecentOrdersView,
    AdminTopSellingProductsView,
)

urlpatterns = [
    path(
        "dashboard/analytics/",
        AdminDashboardAnalyticsView.as_view(),
        name="admin-dashboard-analytics"
    ),

    path(
        "products/",
        AdminProductListView.as_view(),
        name="admin-products"
    ),
    path(
        "orders/",
        AdminOrderListView.as_view(),
        name="admin-orders"
    ),
    path(
        "customers/",
        AdminCustomerListView.as_view(),
        name="admin-customers"
    ),
    path(
        "artisans/",
        AdminArtisanListView.as_view(),
        name="admin-artisans"
    ),
    path("top-artisan/", AdminTopArtisanView.as_view()),
    path("top-products/", AdminTopSellingProductsView.as_view()),
    path("recent-orders/", AdminRecentOrdersView.as_view()),

]
