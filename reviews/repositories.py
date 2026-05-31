"""
reviews/repositories.py  —  Data Access Layer
"""

from __future__ import annotations

from core.interfaces import IReviewRepository
from products.models import Product
from .models import Review


class ReviewRepository(IReviewRepository):

    def get_for_product(self, product_slug: str):
        return (
            Review.objects.filter(
                product__slug=product_slug, is_approved=True
            )
            .select_related("user")
            .order_by("-created_at")
        )

    def get_product(self, product_slug: str) -> Product | None:
        return Product.objects.filter(slug=product_slug, is_active=True).first()

    def exists(self, product_slug: str, user) -> bool:
        return Review.objects.filter(
            product__slug=product_slug, user=user
        ).exists()

    def create(self, user, product: Product, data: dict) -> Review:
        return Review.objects.create(user=user, product=product, **data)
