"""
coupons/views.py  —  Presentation Layer
HTTP adapters only. All coupon rules live in CouponService.
"""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .repositories import CouponRepository
from .serializers import CouponValidateSerializer
from .services import CouponService

_svc = CouponService(CouponRepository())


class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = _svc.validate(
            code=serializer.validated_data["code"],
            order_amount=serializer.validated_data["order_amount"],
        )
        if result.is_failure:
            return Response(
                {"valid": False, "detail": result.error},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(result.value)
