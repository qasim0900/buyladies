"""
tests/test_wishlist_service.py
Unit tests for WishlistService.

Coverage targets:
- Toggle add: product not in wishlist → added
- Toggle remove: product already in wishlist → removed
- Missing product_id → error
- Product not found → error
- get_wishlist delegates to repository
"""

import pytest
from unittest.mock import MagicMock
from wishlist.services import WishlistService


class TestWishlistService_Toggle:
    def test_add_product_when_not_in_wishlist(
        self, wishlist_service, stub_user, stub_product, mock_wishlist_repo
    ):
        mock_wishlist = MagicMock()
        mock_wishlist_repo.get_or_create.return_value = mock_wishlist
        mock_wishlist_repo.get_product.return_value = stub_product
        mock_wishlist_repo.has_product.return_value = False

        result = wishlist_service.toggle(stub_user, "prod-uuid-001")

        assert result.is_ok
        assert result.value["added"] is True
        mock_wishlist_repo.add_product.assert_called_once_with(mock_wishlist, stub_product)

    def test_remove_product_when_already_in_wishlist(
        self, wishlist_service, stub_user, stub_product, mock_wishlist_repo
    ):
        mock_wishlist = MagicMock()
        mock_wishlist_repo.get_or_create.return_value = mock_wishlist
        mock_wishlist_repo.get_product.return_value = stub_product
        mock_wishlist_repo.has_product.return_value = True

        result = wishlist_service.toggle(stub_user, "prod-uuid-001")

        assert result.is_ok
        assert result.value["added"] is False
        mock_wishlist_repo.remove_product.assert_called_once_with(
            mock_wishlist, "prod-uuid-001"
        )

    def test_missing_product_id_returns_error(self, wishlist_service, stub_user):
        result = wishlist_service.toggle(stub_user, None)
        assert result.is_failure
        assert "product_id" in result.error.lower()

    def test_empty_product_id_returns_error(self, wishlist_service, stub_user):
        result = wishlist_service.toggle(stub_user, "")
        assert result.is_failure

    def test_product_not_found(
        self, wishlist_service, stub_user, mock_wishlist_repo
    ):
        mock_wishlist_repo.get_or_create.return_value = MagicMock()
        mock_wishlist_repo.get_product.return_value = None

        result = wishlist_service.toggle(stub_user, "ghost-prod")

        assert result.is_failure
        assert "not found" in result.error.lower()


class TestWishlistService_GetWishlist:
    def test_get_wishlist_delegates_and_wraps_in_ok(
        self, wishlist_service, stub_user, mock_wishlist_repo
    ):
        mock_wishlist = MagicMock()
        mock_wishlist_repo.get_or_create.return_value = mock_wishlist

        result = wishlist_service.get_wishlist(stub_user)

        assert result.is_ok
        assert result.value == mock_wishlist
        mock_wishlist_repo.get_or_create.assert_called_once_with(stub_user)
