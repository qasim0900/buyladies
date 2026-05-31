"""
tests/test_products_service.py
Unit tests for ProductService.

Coverage targets:
- Product detail found / not-found
- Featured / new-arrivals / bestsellers delegation
- Category and brand listing delegation
- Slug lookup is forwarded correctly
"""

import pytest
from unittest.mock import MagicMock
from products.services import ProductService


class TestProductService_Detail:
    def test_get_detail_found(self, product_service, stub_product, mock_product_repo):
        mock_product_repo.get_by_slug.return_value = stub_product
        result = product_service.get_product_detail("floral-kurta")

        assert result.is_ok
        assert result.value == stub_product
        mock_product_repo.get_by_slug.assert_called_once_with("floral-kurta")

    def test_get_detail_not_found(self, product_service, mock_product_repo):
        mock_product_repo.get_by_slug.return_value = None
        result = product_service.get_product_detail("ghost-slug")

        assert result.is_failure
        assert "ghost-slug" in result.error

    def test_slug_forwarded_verbatim(self, product_service, mock_product_repo):
        mock_product_repo.get_by_slug.return_value = None
        product_service.get_product_detail("MY-SLUG-123")
        mock_product_repo.get_by_slug.assert_called_with("MY-SLUG-123")


class TestProductService_Collections:
    def test_featured_limit_respected(self, mock_product_repo):
        svc = ProductService(mock_product_repo)
        svc.get_featured_products()
        mock_product_repo.get_featured.assert_called_once_with(12)

    def test_new_arrivals_limit_respected(self, mock_product_repo):
        svc = ProductService(mock_product_repo)
        svc.get_new_arrivals()
        mock_product_repo.get_new_arrivals.assert_called_once_with(12)

    def test_bestsellers_limit_respected(self, mock_product_repo):
        svc = ProductService(mock_product_repo)
        svc.get_bestsellers()
        mock_product_repo.get_bestsellers.assert_called_once_with(12)

    def test_get_categories_delegates(self, product_service, mock_product_repo):
        product_service.get_categories()
        mock_product_repo.get_all_categories.assert_called_once()

    def test_get_brands_delegates(self, product_service, mock_product_repo):
        product_service.get_brands()
        mock_product_repo.get_all_brands.assert_called_once()

    def test_get_product_list_delegates(self, product_service, mock_product_repo):
        product_service.get_product_list()
        mock_product_repo.get_active_list.assert_called_once()
