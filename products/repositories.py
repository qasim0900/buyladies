"""
products/repositories.py  —  Data Access Layer
Encapsulates all Django ORM queries for the products domain.
"""

from __future__ import annotations

from django.db.models import Avg, Count, Prefetch, Q

from core.interfaces import IProductRepository
from .models import Brand, Category, Color, Product, ProductImage, ProductVariant, Size


def _base_product_qs():
    """
    Canonical annotated queryset used by all list & detail views.
    - select_related:   avoids N+1 for category / brand
    - prefetch_related: avoids N+1 for images
    - annotate:         avg_rating / review_count at DB level (1 query, not N)
    """
    return (
        Product.objects.filter(is_active=True)
        .select_related("category", "brand")
        .prefetch_related(
            Prefetch(
                "images",
                queryset=ProductImage.objects.order_by("sort_order", "id"),
            )
        )
        .annotate(
            avg_rating_val=Avg(
                "reviews__rating",
                filter=Q(reviews__is_approved=True),
            ),
            review_count_val=Count(
                "reviews",
                filter=Q(reviews__is_approved=True),
                distinct=True,
            ),
        )
    )


class ProductRepository(IProductRepository):

    def get_active_list(self, filters: dict | None = None):
        return _base_product_qs()

    def get_by_slug(self, slug: str) -> Product | None:
        return (
            Product.objects.filter(is_active=True, slug=slug)
            .select_related("category", "brand")
            .prefetch_related(
                Prefetch(
                    "images",
                    queryset=ProductImage.objects.order_by("sort_order", "id"),
                ),
                Prefetch(
                    "variants",
                    queryset=ProductVariant.objects.filter(is_active=True)
                    .select_related("color", "size")
                    .order_by("color__name", "size__sort_order"),
                ),
            )
            .annotate(
                avg_rating_val=Avg(
                    "reviews__rating",
                    filter=Q(reviews__is_approved=True),
                ),
                review_count_val=Count(
                    "reviews",
                    filter=Q(reviews__is_approved=True),
                    distinct=True,
                ),
            )
            .first()
        )

    def get_featured(self, limit: int = 12):
        return _base_product_qs().filter(is_featured=True)[:limit]

    def get_new_arrivals(self, limit: int = 12):
        return _base_product_qs().filter(is_new_arrival=True).order_by("-created_at")[:limit]

    def get_bestsellers(self, limit: int = 12):
        return _base_product_qs().filter(is_bestseller=True)[:limit]

    def get_all_categories(self):
        return (
            Category.objects.filter(is_active=True, parent__isnull=True)
            .prefetch_related(
                Prefetch(
                    "subcategories",
                    queryset=Category.objects.filter(is_active=True).order_by("sort_order"),
                )
            )
            .order_by("sort_order", "name")
        )

    def get_all_brands(self):
        return Brand.objects.filter(is_active=True).order_by("name")

    def get_all_colors(self):
        return Color.objects.all().order_by("name")

    def get_all_sizes(self):
        return Size.objects.all().order_by("size_type", "sort_order")
