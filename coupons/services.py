"""
coupons/services.py  —  Business Logic Layer
Coupon validation rules.
"""

from __future__ import annotations

from decimal import Decimal

from core.interfaces import ICouponRepository
from core.result import Err, Ok, Result


class CouponService:

    def __init__(self, repository: ICouponRepository) -> None:
        self._repo = repository

    def validate(self, code: str, order_amount: Decimal) -> Result:
        """
        Validate a coupon against an order amount.

        Business rules:
        - Code must exist and be active.
        - Must not be expired.
        - Must not have exceeded max_uses.
        - order_amount must meet min_order_amount.
        """
        if not code or not code.strip():
            return Err("Coupon code is required.")

        coupon = self._repo.get_by_code(code.strip().upper())
        if not coupon:
            return Err("Invalid coupon code.")

        if not coupon.is_active:
            return Err("This coupon is no longer active.")

        if not coupon.is_valid:
            return Err("This coupon has expired or reached its usage limit.")

        if order_amount < coupon.min_order_amount:
            return Err(
                f"Minimum order amount of PKR {coupon.min_order_amount} required."
            )

        discount = coupon.calculate_discount(order_amount)

        return Ok(
            {
                "valid": True,
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "discount_value": str(coupon.discount_value),
                "discount_amount": str(discount),
                "description": coupon.description,
            }
        )
