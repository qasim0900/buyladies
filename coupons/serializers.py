from rest_framework import serializers
from .models import Coupon


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    order_amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class CouponResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['code', 'discount_type', 'discount_value', 'description']
