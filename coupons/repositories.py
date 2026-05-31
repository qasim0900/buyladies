"""
coupons/repositories.py  —  Data Access Layer
"""

from __future__ import annotations

from django.db.models import F

from core.interfaces import ICouponRepository
from .models import Coupon


class CouponRepository(ICouponRepository):

    def get_by_code(self, code: str) -> Coupon | None:
        return Coupon.objects.filter(code=code.upper()).first()

    def lock_for_update(self, coupon: Coupon) -> Coupon:
        return Coupon.objects.select_for_update().get(pk=coupon.pk)

    def increment_uses(self, coupon: Coupon) -> None:
        Coupon.objects.filter(pk=coupon.pk).update(uses_count=F("uses_count") + 1)
