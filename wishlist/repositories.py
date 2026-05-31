"""
wishlist/repositories.py  —  Data Access Layer
"""

from __future__ import annotations

from django.db.models import Prefetch

from core.interfaces import IWishlistRepository
from products.models import Product, ProductImage
from .models import Wishlist, WishlistItem


class WishlistRepository(IWishlistRepository):

    def get_or_create(self, user) -> Wishlist:
        wishlist, _ = Wishlist.objects.get_or_create(user=user)
        return (
            Wishlist.objects.prefetch_related(
                Prefetch(
                    "items",
                    queryset=WishlistItem.objects.select_related(
                        "product__category", "product__brand"
                    ).prefetch_related(
                        Prefetch(
                            "product__images",
                            queryset=ProductImage.objects.order_by("sort_order"),
                        )
                    ).order_by("-added_at"),
                )
            ).get(pk=wishlist.pk)
        )

    def get_product(self, product_id) -> Product | None:
        return Product.objects.filter(id=product_id, is_active=True).first()

    def has_product(self, wishlist: Wishlist, product_id) -> bool:
        return WishlistItem.objects.filter(
            wishlist=wishlist, product_id=product_id
        ).exists()

    def add_product(self, wishlist: Wishlist, product: Product) -> WishlistItem:
        item, _ = WishlistItem.objects.get_or_create(
            wishlist=wishlist, product=product
        )
        return item

    def remove_product(self, wishlist: Wishlist, product_id) -> None:
        WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).delete()
