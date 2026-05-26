from rest_framework import serializers
from .models import Wishlist, WishlistItem
from products.serializers import ProductListSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_id', 'added_at']


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    count = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'items', 'count']

    def get_count(self, obj):
        return obj.items.count()
