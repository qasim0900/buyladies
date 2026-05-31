"""
tests/test_coupon_service.py
Unit tests for CouponService.

Coverage targets:
- Valid coupon → correct discount payload
- Non-existent coupon
- Expired / exhausted coupon (is_valid = False)
- Inactive coupon
- Order below min_order_amount
- Empty code string
- Correct discount amount returned
"""

import pytest
from decimal import Decimal
from unittest.mock import MagicMock
from coupons.services import CouponService


class TestCouponService_Validate:
    def test_valid_coupon_returns_ok(self, coupon_service, stub_coupon, mock_coupon_repo):
        mock_coupon_repo.get_by_code.return_value = stub_coupon

        result = coupon_service.validate("SAVE10", Decimal("1000"))

        assert result.is_ok
        assert result.value["valid"] is True
        assert result.value["code"] == "SAVE10"
        assert "discount_amount" in result.value

    def test_nonexistent_coupon(self, coupon_service, mock_coupon_repo):
        mock_coupon_repo.get_by_code.return_value = None
        result = coupon_service.validate("GHOST99", Decimal("1000"))
        assert result.is_failure
        assert "Invalid" in result.error

    def test_inactive_coupon(self, coupon_service, stub_coupon, mock_coupon_repo):
        stub_coupon.is_active = False
        mock_coupon_repo.get_by_code.return_value = stub_coupon
        result = coupon_service.validate("SAVE10", Decimal("1000"))
        assert result.is_failure
        assert "active" in result.error.lower()

    def test_expired_coupon(self, coupon_service, stub_coupon, mock_coupon_repo):
        stub_coupon.is_active = True
        stub_coupon.is_valid = False
        mock_coupon_repo.get_by_code.return_value = stub_coupon

        result = coupon_service.validate("SAVE10", Decimal("1000"))
        assert result.is_failure
        assert "expired" in result.error.lower()

    def test_order_below_minimum(self, coupon_service, stub_coupon, mock_coupon_repo):
        stub_coupon.min_order_amount = Decimal("2000")
        mock_coupon_repo.get_by_code.return_value = stub_coupon

        result = coupon_service.validate("SAVE10", Decimal("100"))
        assert result.is_failure
        assert "2000" in result.error

    def test_empty_code_returns_error(self, coupon_service):
        result = coupon_service.validate("", Decimal("500"))
        assert result.is_failure

    def test_whitespace_only_code(self, coupon_service):
        result = coupon_service.validate("   ", Decimal("500"))
        assert result.is_failure

    def test_discount_amount_in_response(self, coupon_service, stub_coupon, mock_coupon_repo):
        stub_coupon.calculate_discount.return_value = Decimal("200.00")
        mock_coupon_repo.get_by_code.return_value = stub_coupon

        result = coupon_service.validate("SAVE10", Decimal("2000"))

        assert result.is_ok
        assert result.value["discount_amount"] == "200.00"

    def test_code_uppercased_before_lookup(self, coupon_service, mock_coupon_repo):
        mock_coupon_repo.get_by_code.return_value = None
        coupon_service.validate("save10", Decimal("500"))
        mock_coupon_repo.get_by_code.assert_called_with("SAVE10")
