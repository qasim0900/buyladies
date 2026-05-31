"""
tests/test_reviews_service.py
Unit tests for ReviewService.

Coverage targets:
- Submit review: success, product not found, duplicate review, invalid rating
- Get reviews: delegates to repository correctly
"""

import pytest
from unittest.mock import MagicMock
from reviews.services import ReviewService


class TestReviewService_Submit:
    def test_submit_success(self, review_service, stub_user, stub_product, mock_review_repo):
        mock_review_repo.get_product.return_value = stub_product
        mock_review_repo.exists.return_value = False
        mock_review = MagicMock()
        mock_review_repo.create.return_value = mock_review

        result = review_service.submit_review(
            stub_user, "floral-kurta", {"rating": 5, "body": "Great product!"}
        )

        assert result.is_ok
        assert result.value == mock_review

    def test_product_not_found(self, review_service, stub_user, mock_review_repo):
        mock_review_repo.get_product.return_value = None

        result = review_service.submit_review(
            stub_user, "ghost-slug", {"rating": 4, "body": "Fine"}
        )

        assert result.is_failure
        assert "not found" in result.error.lower()

    def test_duplicate_review_rejected(self, review_service, stub_user, stub_product, mock_review_repo):
        mock_review_repo.get_product.return_value = stub_product
        mock_review_repo.exists.return_value = True

        result = review_service.submit_review(
            stub_user, "floral-kurta", {"rating": 3, "body": "Already reviewed"}
        )

        assert result.is_failure
        assert "already reviewed" in result.error.lower()

    def test_rating_below_minimum(self, review_service, stub_user, stub_product, mock_review_repo):
        mock_review_repo.get_product.return_value = stub_product
        mock_review_repo.exists.return_value = False

        result = review_service.submit_review(
            stub_user, "floral-kurta", {"rating": 0, "body": "Bad rating"}
        )

        assert result.is_failure
        assert "1" in result.error and "5" in result.error

    def test_rating_above_maximum(self, review_service, stub_user, stub_product, mock_review_repo):
        mock_review_repo.get_product.return_value = stub_product
        mock_review_repo.exists.return_value = False

        result = review_service.submit_review(
            stub_user, "floral-kurta", {"rating": 6, "body": "Above max"}
        )

        assert result.is_failure

    def test_missing_rating(self, review_service, stub_user, stub_product, mock_review_repo):
        mock_review_repo.get_product.return_value = stub_product
        mock_review_repo.exists.return_value = False

        result = review_service.submit_review(
            stub_user, "floral-kurta", {"body": "No rating given"}
        )

        assert result.is_failure


class TestReviewService_GetReviews:
    def test_delegates_to_repository(self, review_service, mock_review_repo):
        mock_qs = MagicMock()
        mock_review_repo.get_for_product.return_value = mock_qs

        result = review_service.get_product_reviews("floral-kurta")

        assert result == mock_qs
        mock_review_repo.get_for_product.assert_called_once_with("floral-kurta")
