from django.contrib import admin
from .models import Category, Brand, Color, Size, Product, ProductImage, ProductVariant


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_active', 'sort_order']
    list_filter = ['is_active', 'parent']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['sort_order', 'name']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ['name', 'hex_code']
    search_fields = ['name']


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ['name', 'size_type', 'sort_order']
    list_filter = ['size_type']
    ordering = ['size_type', 'sort_order']


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary', 'sort_order']


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['color', 'size', 'sku', 'price_override', 'stock_quantity', 'is_active']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'brand', 'base_price', 'sale_price', 'is_featured', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_featured', 'is_new_arrival', 'is_bestseller', 'category', 'brand']
    search_fields = ['name', 'description', 'tags']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductVariantInline]
    ordering = ['-created_at']
    list_editable = ['is_featured', 'is_active']
    date_hierarchy = 'created_at'
