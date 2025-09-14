from django.contrib import admin
from .models import Product, ProductImage, Category


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'brand_name', 'regular_price', 'is_published', 'created_at']
    list_filter = ['category', 'is_published', 'created_at']
    search_fields = ['name', 'brand_name', 'description']
    inlines = [ProductImageInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']
