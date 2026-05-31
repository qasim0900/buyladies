"""
products/services.py  —  Business Logic Layer
Product domain rules: filtering, validation, catalogue logic.
"""

from __future__ import annotations

from core.exceptions import NotFoundError
from core.interfaces import IProductRepository
from core.result import Err, Ok, Result


class ProductService:
    """
    Thin orchestration layer for the products domain.
    Business rules:
      - Only active products are surfaced to the public.
      - Slug lookups are case-insensitive at the DB level (via index).
      - Collection limits are enforced here, not in the view.
    """

    FEATURED_LIMIT = 12
    NEW_ARRIVALS_LIMIT = 12
    BESTSELLERS_LIMIT = 12

    def __init__(self, repository: IProductRepository) -> None:
        self._repo = repository

    def get_product_list(self):
        """Return the base queryset; filtering/ordering applied by the view."""
        return self._repo.get_active_list()

    def get_product_detail(self, slug: str) -> Result:
        product = self._repo.get_by_slug(slug)
        if not product:
            return Err(f"Product '{slug}' not found.")
        return Ok(product)

    def get_featured_products(self):
        return self._repo.get_featured(self.FEATURED_LIMIT)

    def get_new_arrivals(self):
        return self._repo.get_new_arrivals(self.NEW_ARRIVALS_LIMIT)

    def get_bestsellers(self):
        return self._repo.get_bestsellers(self.BESTSELLERS_LIMIT)

    def get_categories(self):
        return self._repo.get_all_categories()

    def get_brands(self):
        return self._repo.get_all_brands()

    def get_colors(self):
        return self._repo.get_all_colors()

    def get_sizes(self):
        return self._repo.get_all_sizes()
