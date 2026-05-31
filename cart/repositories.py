"""
cart/repositories.py  —  Data Access Layer
All ORM queries for the cart domain.
"""

from __future__ import annotations

from django.db.models import Prefetch

from core.interfaces import ICartRepository
from products.models import ProductImage, ProductVariant
from .models import Cart, CartItem


def _rich_cart_qs():
    """Prefetch the full item hierarchy — avoids N+1 on serialization."""
    return Cart.objects.prefetch_related(
        Prefetch(
            "items",
            queryset=CartItem.objects.select_related(
                "variant__product",
                "variant__color",
                "variant__size",
            ).prefetch_related(
                Prefetch(
                    "variant__product__images",
                    queryset=ProductImage.objects.order_by("sort_order", "id"),
                )
            ).order_by("added_at"),
        )
    )


class CartRepository(ICartRepository):

    def get_for_user(self, user) -> Cart | None:
        return Cart.objects.filter(user=user).first()

    def get_for_session(self, session_key: str) -> Cart | None:
        return Cart.objects.filter(session_key=session_key).first()

    def get_or_create_for_user(self, user) -> Cart:
        cart, _ = Cart.objects.get_or_create(user=user)
        return _rich_cart_qs().get(pk=cart.pk)

    def get_or_create_for_session(self, session_key: str) -> Cart:
        cart, _ = Cart.objects.get_or_create(session_key=session_key)
        return _rich_cart_qs().get(pk=cart.pk)

    def refresh(self, cart: Cart) -> Cart:
        """Re-fetch cart with full prefetch chain after mutation."""
        return _rich_cart_qs().get(pk=cart.pk)

    def get_item(self, cart: Cart, item_id) -> CartItem | None:
        return CartItem.objects.select_related("variant").filter(
            id=item_id, cart=cart
        ).first()

    def get_variant(self, variant_id) -> ProductVariant | None:
        return (
            ProductVariant.objects.select_related("product")
            .filter(id=variant_id, is_active=True)
            .first()
        )

    def add_item(self, cart: Cart, variant: ProductVariant, quantity: int) -> CartItem:
        item, created = CartItem.objects.get_or_create(
            cart=cart, variant=variant, defaults={"quantity": quantity}
        )
        if not created:
            item.quantity += quantity
            item.save(update_fields=["quantity"])
        return item

    def update_item_quantity(self, item: CartItem, quantity: int) -> CartItem:
        item.quantity = quantity
        item.save(update_fields=["quantity"])
        return item

    def remove_item(self, item: CartItem) -> None:
        item.delete()

    def clear(self, cart: Cart) -> None:
        cart.items.all().delete()
