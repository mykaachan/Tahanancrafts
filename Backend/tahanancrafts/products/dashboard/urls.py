from django.urls import path
from .views import ArtisanDashboardView, ArtisanTransactionHistoryView, MonthlySalesView

urlpatterns = [
    path('artisan/<int:artisan_id>/', ArtisanDashboardView.as_view(), name='artisan-dashboard'),
    path('history/<int:artisan_id>/', ArtisanTransactionHistoryView.as_view(), name='history'),
    path('monthly-sales/<int:artisan_id>/', MonthlySalesView.as_view(), name='monthly-sales'),

]
