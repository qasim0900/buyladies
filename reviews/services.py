"""
reviews/services.py  —  Business Logic Layer
Review submission and retrieval rules.
"""

from __future__ import annotations

from core.interfaces import IReviewRepository
from core.result import Err, Ok, Result


class ReviewService:

    def __init__(self, repository: IReviewRepository) -> None:
        self._repo = repository

    def get_product_reviews(self, product_slug: str):
        return self._repo.get_for_product(product_slug)

    def submit_review(self, user, product_slug: str, data: dict) -> Result:
        """
        Business rules:
        - Product must exist and be active.
        - One review per user per product.
        - Rating must be 1–5 (enforced at serializer level, validated here too).
        """
        product = self._repo.get_product(product_slug)
        if not product:
            return Err("Product not found.")

        if self._repo.exists(product_slug, user):
            return Err("You have already reviewed this product.")

        rating = data.get("rating")
        if rating is None or not (1 <= int(rating) <= 5):
            return Err("Rating must be between 1 and 5.")

        review = self._repo.create(user, product, data)
        return Ok(review)
