"""
cart/services.py  —  Business Logic Layer
Cart domain rules: stock validation, quantity limits, session handling.
"""

from __future__ import annotations

from core.interfaces import ICartRepository
from core.result import Err, Ok, Result


class CartService:
    """
    All cart business rules in one place.

    Business rules enforced here:
    - quantity must be >= 1.
    - cannot add more than available stock.
    - anonymous carts are keyed by session; authenticated carts by user.
    """

    MAX_ITEM_QUANTITY = 50

    def __init__(self, repository: ICartRepository) -> None:
        self._repo = repository

    def get_cart(self, user=None, session_key: str | None = None) -> Result:
        if user and user.is_authenticated:
            cart = self._repo.get_or_create_for_user(user)
        elif session_key:
            cart = self._repo.get_or_create_for_session(session_key)
        else:
            return Err("Cannot identify cart without user or session.")
        return Ok(cart)

    def add_to_cart(
        self,
        user=None,
        session_key: str | None = None,
        variant_id=None,
        quantity: int = 1,
    ) -> Result:
        if quantity < 1:
            return Err("Quantity must be at least 1.")
        if quantity > self.MAX_ITEM_QUANTITY:
            return Err(f"Cannot add more than {self.MAX_ITEM_QUANTITY} of a single item.")

        variant = self._repo.get_variant(variant_id)
        if not variant:
            return Err("Product variant not found or unavailable.")

        if variant.stock_quantity < quantity:
            return Err(f"Only {variant.stock_quantity} item(s) in stock.")

        # Get or create the bare cart (without prefetch) for mutation
        if user and user.is_authenticated:
            from cart.models import Cart
            cart_bare, _ = Cart.objects.get_or_create(user=user)
        elif session_key:
            from cart.models import Cart
            cart_bare, _ = Cart.objects.get_or_create(session_key=session_key)
        else:
            return Err("Cannot identify cart.")

        # Check if item already in cart — enforce stock limit on combined qty
        from cart.models import CartItem
        existing = CartItem.objects.filter(cart=cart_bare, variant=variant).first()
        if existing:
            new_qty = existing.quantity + quantity
            if new_qty > variant.stock_quantity:
                return Err(f"Only {variant.stock_quantity} item(s) in stock.")
            if new_qty > self.MAX_ITEM_QUANTITY:
                return Err(f"Cannot have more than {self.MAX_ITEM_QUANTITY} of one item.")
            existing.quantity = new_qty
            existing.save(update_fields=["quantity"])
        else:
            CartItem.objects.create(cart=cart_bare, variant=variant, quantity=quantity)

        cart = self._repo.refresh(cart_bare)
        return Ok(cart)

    def update_item(
        self,
        user=None,
        session_key: str | None = None,
        item_id=None,
        quantity: int = 0,
    ) -> Result:
        cart_bare = self._get_bare_cart(user, session_key)
        if not cart_bare:
            return Err("Cart not found.")

        item = self._repo.get_item(cart_bare, item_id)
        if not item:
            return Err("Cart item not found.")

        if quantity <= 0:
            self._repo.remove_item(item)
        else:
            if quantity > item.variant.stock_quantity:
                return Err(f"Only {item.variant.stock_quantity} item(s) in stock.")
            if quantity > self.MAX_ITEM_QUANTITY:
                return Err(f"Cannot set quantity above {self.MAX_ITEM_QUANTITY}.")
            self._repo.update_item_quantity(item, quantity)

        cart = self._repo.refresh(cart_bare)
        return Ok(cart)

    def remove_item(
        self,
        user=None,
        session_key: str | None = None,
        item_id=None,
    ) -> Result:
        cart_bare = self._get_bare_cart(user, session_key)
        if not cart_bare:
            return Err("Cart not found.")

        item = self._repo.get_item(cart_bare, item_id)
        if item:
            self._repo.remove_item(item)

        cart = self._repo.refresh(cart_bare)
        return Ok(cart)

    def clear_cart(self, user=None, session_key: str | None = None) -> Result:
        cart_bare = self._get_bare_cart(user, session_key)
        if cart_bare:
            self._repo.clear(cart_bare)
        return Ok()

    def _get_bare_cart(self, user, session_key):
        from cart.models import Cart
        if user and user.is_authenticated:
            return Cart.objects.filter(user=user).first()
        if session_key:
            return Cart.objects.filter(session_key=session_key).first()
        return None
