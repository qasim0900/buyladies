from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Coupon
from .serializers import CouponValidateSerializer


class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code'].upper()
        order_amount = serializer.validated_data['order_amount']

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'detail': 'Invalid coupon code.'}, status=status.HTTP_400_BAD_REQUEST)

        if not coupon.is_valid:
            return Response({'valid': False, 'detail': 'This coupon has expired or is no longer valid.'}, status=status.HTTP_400_BAD_REQUEST)

        if order_amount < coupon.min_order_amount:
            return Response({
                'valid': False,
                'detail': f'Minimum order amount of PKR {coupon.min_order_amount} required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        discount = coupon.calculate_discount(order_amount)
        return Response({
            'valid': True,
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': str(coupon.discount_value),
            'discount_amount': str(discount),
            'description': coupon.description,
        })
