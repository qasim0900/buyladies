"""
wishlist/services.py  —  Business Logic Layer
Wishlist toggle and retrieval rules.
"""

from __future__ import annotations

from core.interfaces import IWishlistRepository
from core.result import Err, Ok, Result


class WishlistService:

    def __init__(self, repository: IWishlistRepository) -> None:
        self._repo = repository

    def get_wishlist(self, user) -> Result:
        wishlist = self._repo.get_or_create(user)
        return Ok(wishlist)

    def toggle(self, user, product_id) -> Result:
        """
        Add product to wishlist if not present; remove if present.
        Returns: {'added': bool, 'message': str}
        """
        if not product_id:
            return Err("product_id is required.")

        wishlist = self._repo.get_or_create(user)
        product = self._repo.get_product(product_id)
        if not product:
            return Err("Product not found.")

        if self._repo.has_product(wishlist, product_id):
            self._repo.remove_product(wishlist, product_id)
            return Ok({"added": False, "message": "Removed from wishlist."})

        self._repo.add_product(wishlist, product)
        return Ok({"added": True, "message": "Added to wishlist."})
