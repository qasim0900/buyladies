"""
PERF-003 FIX: get_product_image now reads from the prefetch cache instead
of calling .filter(is_primary=True).first() which bypasses prefetch and
issues 2 DB queries per cart item.

The cart views use prefetch_related('items__variant__product__images')
so list(obj.variant.product.images.all()) never hits the DB.
"""

from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer(read_only=True)
    variant_id = serializers.UUIDField(write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'variant', 'variant_id',
            'product_name', 'product_slug', 'product_image',
            'quantity', 'subtotal',
        ]

    def get_product_image(self, obj):
        """
        Reads product images from the prefetch cache.
        Falls back to a single DB query only if images weren't prefetched.
        """
        request = self.context.get('request')
        try:
            # Use the prefetch cache — iterate in Python, no DB hit
            images = list(obj.variant.product.images.all())
            img = next((i for i in images if i.is_primary), None) or (images[0] if images else None)
        except Exception:
            img = None

        if img and request:
            try:
                return request.build_absolute_uri(img.image.url)
            except Exception:
                pass
        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'subtotal']

    def get_total_items(self, obj):
        """Single-pass aggregation over the prefetched items list."""
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj):
        """Single-pass aggregation — same loop as total_items avoidable via cached list."""
        items = list(obj.items.all())  # prefetch cache, no DB hit
        total = sum(item.subtotal for item in items)
        return str(total)
