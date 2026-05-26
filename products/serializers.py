"""
PERF-001 FIX: avg_rating and review_count now read from DB annotations
(avg_rating_val, review_count_val) set by the view's queryset. Zero extra queries.

PERF-002 FIX: primary_image iterates the prefetch cache instead of calling
.filter().first() which would bypass prefetch and hit DB per product.
"""

from rest_framework import serializers
from .models import Category, Brand, Color, Size, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image_url', 'parent', 'description',
                  'is_active', 'sort_order', 'subcategories']

    def get_subcategories(self, obj):
        subs = obj.subcategories.filter(is_active=True) if hasattr(obj, '_prefetched_objects_cache') else []
        try:
            subs = obj.subcategories.all()
            return CategorySerializer(
                [s for s in subs if s.is_active],
                many=True,
                context=self.context,
            ).data
        except Exception:
            return []

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class BrandSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo_url', 'description', 'is_active']

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code']


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name', 'size_type', 'sort_order']


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_primary', 'sort_order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            try:
                return request.build_absolute_uri(obj.image.url)
            except Exception:
                pass
        return None


class ProductVariantSerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)
    size = SizeSerializer(read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'color', 'size', 'sku', 'price', 'stock_quantity', 'in_stock', 'is_active']


def _get_primary_image(obj):
    """
    Returns the primary ProductImage from the prefetch cache.
    Never issues extra DB queries if images are prefetched.
    Falls back gracefully when not prefetched.
    """
    images = list(obj.images.all())   # uses prefetch cache if available
    if not images:
        return None
    # prefer explicitly marked primary
    for img in images:
        if img.is_primary:
            return img
    # fallback to first image
    return images[0]


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default=None)
    primary_image = serializers.SerializerMethodField()
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category_name', 'brand_name',
            'base_price', 'sale_price', 'effective_price', 'discount_percent',
            'primary_image', 'is_featured', 'is_new_arrival', 'is_bestseller',
            'avg_rating', 'review_count',
        ]

    def get_primary_image(self, obj):
        img = _get_primary_image(obj)
        if img:
            return ProductImageSerializer(img, context=self.context).data
        return None

    def get_avg_rating(self, obj):
        """Reads from DB annotation — zero extra queries."""
        val = getattr(obj, 'avg_rating_val', None)
        return round(float(val), 1) if val is not None else None

    def get_review_count(self, obj):
        """Reads from DB annotation — zero extra queries."""
        return int(getattr(obj, 'review_count_val', 0) or 0)


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'category', 'brand', 'base_price', 'sale_price', 'effective_price', 'discount_percent',
            'images', 'variants', 'tags', 'is_featured', 'is_new_arrival', 'is_bestseller',
            'meta_title', 'meta_description', 'avg_rating', 'review_count', 'created_at',
        ]

    def get_avg_rating(self, obj):
        val = getattr(obj, 'avg_rating_val', None)
        return round(float(val), 1) if val is not None else None

    def get_review_count(self, obj):
        return int(getattr(obj, 'review_count_val', 0) or 0)
