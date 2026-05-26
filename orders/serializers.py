from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductVariantSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'variant', 'product_name', 'variant_info', 'product_image', 'quantity', 'unit_price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status', 'payment_method',
            'subtotal', 'discount_amount', 'shipping_cost', 'total_amount', 'coupon_code',
            'shipping_full_name', 'shipping_phone', 'shipping_address_line1',
            'shipping_address_line2', 'shipping_city', 'shipping_state',
            'shipping_postal_code', 'shipping_country', 'tracking_number',
            'notes', 'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'order_number', 'status', 'payment_status', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD)
    shipping_full_name = serializers.CharField(max_length=200)
    shipping_phone = serializers.CharField(max_length=20)
    shipping_address_line1 = serializers.CharField(max_length=255)
    shipping_address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_postal_code = serializers.CharField(max_length=20)
    shipping_country = serializers.CharField(max_length=100, default='Pakistan')
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
