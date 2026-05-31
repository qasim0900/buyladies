"""
tests/conftest.py
Shared pytest fixtures for all test modules.

Design decisions:
- Django TestCase is NOT used; we use pure pytest with django.test.TestCase
  only where DB access is required.
- Repositories are mocked via unittest.mock so service tests are pure unit
  tests (no DB, no HTTP, no external state).
- Integration fixtures that DO hit the DB are clearly labelled @pytest.mark.django_db.
"""

import pytest
from decimal import Decimal
from unittest.mock import MagicMock, patch
from django.contrib.auth import get_user_model

User = get_user_model()


# ---------------------------------------------------------------------------
# Mock repository factories
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_user_repo():
    repo = MagicMock()
    repo.get_by_email.return_value = None
    repo.get_by_id.return_value = None
    return repo


@pytest.fixture
def mock_product_repo():
    return MagicMock()


@pytest.fixture
def mock_cart_repo():
    return MagicMock()


@pytest.fixture
def mock_order_repo():
    return MagicMock()


@pytest.fixture
def mock_coupon_repo():
    return MagicMock()


@pytest.fixture
def mock_review_repo():
    return MagicMock()


@pytest.fixture
def mock_wishlist_repo():
    return MagicMock()


# ---------------------------------------------------------------------------
# Service instances wired to mocks
# ---------------------------------------------------------------------------

@pytest.fixture
def user_service(mock_user_repo):
    from users.services import UserService
    return UserService(mock_user_repo)


@pytest.fixture
def product_service(mock_product_repo):
    from products.services import ProductService
    return ProductService(mock_product_repo)


@pytest.fixture
def cart_service(mock_cart_repo):
    from cart.services import CartService
    return CartService(mock_cart_repo)


@pytest.fixture
def coupon_service(mock_coupon_repo):
    from coupons.services import CouponService
    return CouponService(mock_coupon_repo)


@pytest.fixture
def review_service(mock_review_repo):
    from reviews.services import ReviewService
    return ReviewService(mock_review_repo)


@pytest.fixture
def wishlist_service(mock_wishlist_repo):
    from wishlist.services import WishlistService
    return WishlistService(mock_wishlist_repo)


# ---------------------------------------------------------------------------
# Stub domain objects
# ---------------------------------------------------------------------------

@pytest.fixture
def stub_user():
    user = MagicMock()
    user.pk = "test-uuid-001"
    user.email = "alice@example.com"
    user.first_name = "Alice"
    user.last_name = "Smith"
    user.is_authenticated = True
    user.is_active = True
    return user


@pytest.fixture
def stub_product():
    product = MagicMock()
    product.id = "prod-uuid-001"
    product.name = "Floral Kurta"
    product.slug = "floral-kurta"
    product.base_price = Decimal("2500.00")
    product.sale_price = Decimal("1999.00")
    product.is_active = True
    return product


@pytest.fixture
def stub_variant(stub_product):
    variant = MagicMock()
    variant.id = "var-uuid-001"
    variant.product = stub_product
    variant.stock_quantity = 10
    variant.is_active = True
    variant.price = Decimal("1999.00")
    return variant


@pytest.fixture
def stub_coupon():
    coupon = MagicMock()
    coupon.code = "SAVE10"
    coupon.is_active = True
    coupon.is_valid = True
    coupon.discount_type = "percentage"
    coupon.discount_value = Decimal("10")
    coupon.min_order_amount = Decimal("500")
    coupon.max_discount_amount = None
    coupon.description = "10% off on orders above PKR 500"
    coupon.calculate_discount.return_value = Decimal("100.00")
    return coupon
