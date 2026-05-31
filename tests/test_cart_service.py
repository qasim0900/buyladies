"""
tests/test_cart_service.py
Unit tests for CartService.

Coverage targets:
- add_to_cart: success, out-of-stock, invalid quantity, variant not found
- update_item: reduce qty, set to 0 (delete), over-stock
- remove_item: success, item not in cart
- clear_cart: success
- MAX_ITEM_QUANTITY enforcement

Note: CartService uses lazy `from cart.models import Cart, CartItem` inside
methods (to avoid circular imports). Patches must target `cart.models.Cart`
and `cart.models.CartItem`, not `cart.services.*`.
"""

import pytest
from decimal import Decimal
from unittest.mock import MagicMock, patch
from cart.services import CartService


class TestCartService_AddToCart:
    def test_add_success(self, cart_service, stub_variant, mock_cart_repo):
        mock_cart_repo.get_variant.return_value = stub_variant
        mock_cart = MagicMock()
        mock_cart_repo.refresh.return_value = mock_cart

        stub_user = MagicMock()
        stub_user.is_authenticated = True

        with patch("cart.models.Cart") as mock_c, \
             patch("cart.models.CartItem") as mock_ci:
            # Cart.objects.get_or_create returns (bare_cart, created)
            bare_cart = MagicMock()
            mock_c.objects.get_or_create.return_value = (bare_cart, True)
            # No existing item
            mock_ci.objects.filter.return_value.first.return_value = None

            result = cart_service.add_to_cart(
                user=stub_user, variant_id="var-uuid-001", quantity=2
            )

        assert result.is_ok

    def test_add_quantity_zero_fails(self, cart_service):
        result = cart_service.add_to_cart(
            user=MagicMock(is_authenticated=True),
            variant_id="x",
            quantity=0,
        )
        assert result.is_failure
        assert "at least 1" in result.error

    def test_add_quantity_negative_fails(self, cart_service):
        result = cart_service.add_to_cart(
            user=MagicMock(is_authenticated=True),
            variant_id="x",
            quantity=-5,
        )
        assert result.is_failure

    def test_add_exceeds_max_quantity(self, cart_service):
        result = cart_service.add_to_cart(
            user=MagicMock(is_authenticated=True),
            variant_id="x",
            quantity=CartService.MAX_ITEM_QUANTITY + 1,
        )
        assert result.is_failure
        assert str(CartService.MAX_ITEM_QUANTITY) in result.error

    def test_add_variant_not_found(self, cart_service, mock_cart_repo):
        mock_cart_repo.get_variant.return_value = None
        result = cart_service.add_to_cart(
            user=MagicMock(is_authenticated=True),
            variant_id="ghost",
            quantity=1,
        )
        assert result.is_failure
        assert "not found" in result.error.lower()

    def test_add_out_of_stock(self, cart_service, stub_variant, mock_cart_repo):
        stub_variant.stock_quantity = 0
        mock_cart_repo.get_variant.return_value = stub_variant

        result = cart_service.add_to_cart(
            user=MagicMock(is_authenticated=True),
            variant_id="var-uuid-001",
            quantity=1,
        )

        assert result.is_failure
        assert "stock" in result.error.lower()

    def test_add_exceeds_available_stock(self, cart_service, stub_variant, mock_cart_repo):
        stub_variant.stock_quantity = 3
        mock_cart_repo.get_variant.return_value = stub_variant

        result = cart_service.add_to_cart(
            user=MagicMock(is_authenticated=True),
            variant_id="var-uuid-001",
            quantity=10,
        )

        assert result.is_failure


class TestCartService_UpdateItem:
    """
    _get_bare_cart lazily imports from cart.models; patch `cart.models.Cart`.
    """

    def _setup(self, cart_service, mock_cart_repo, stock=5):
        mock_cart = MagicMock()
        mock_item = MagicMock()
        mock_item.variant.stock_quantity = stock
        mock_cart_repo.get_item.return_value = mock_item
        mock_cart_repo.refresh.return_value = mock_cart
        return mock_cart, mock_item

    def test_update_valid_quantity(self, cart_service, mock_cart_repo):
        mock_cart, mock_item = self._setup(cart_service, mock_cart_repo)

        with patch("cart.models.Cart") as mock_c:
            mock_c.objects.filter.return_value.first.return_value = MagicMock()
            result = cart_service.update_item(
                user=MagicMock(is_authenticated=True),
                item_id="item-1",
                quantity=2,
            )

        assert result.is_ok
        mock_cart_repo.update_item_quantity.assert_called_once_with(mock_item, 2)

    def test_update_zero_quantity_deletes_item(self, cart_service, mock_cart_repo):
        mock_cart, mock_item = self._setup(cart_service, mock_cart_repo)

        with patch("cart.models.Cart") as mock_c:
            mock_c.objects.filter.return_value.first.return_value = MagicMock()
            result = cart_service.update_item(
                user=MagicMock(is_authenticated=True),
                item_id="item-1",
                quantity=0,
            )

        assert result.is_ok
        mock_cart_repo.remove_item.assert_called_once_with(mock_item)

    def test_update_exceeds_stock(self, cart_service, mock_cart_repo):
        self._setup(cart_service, mock_cart_repo, stock=2)

        with patch("cart.models.Cart") as mock_c:
            mock_c.objects.filter.return_value.first.return_value = MagicMock()
            result = cart_service.update_item(
                user=MagicMock(is_authenticated=True),
                item_id="item-1",
                quantity=100,
            )

        assert result.is_failure
        assert "stock" in result.error.lower()

    def test_update_cart_not_found(self, cart_service, mock_cart_repo):
        with patch("cart.models.Cart") as mock_c:
            mock_c.objects.filter.return_value.first.return_value = None
            result = cart_service.update_item(
                user=MagicMock(is_authenticated=True),
                item_id="item-1",
                quantity=1,
            )

        assert result.is_failure
        assert "not found" in result.error.lower()
