"""
orders/services.py  —  Business Logic Layer
Order placement, cancellation, and lifecycle rules.

Critical guarantees:
- Order creation is fully atomic (transaction.atomic).
- Stock deduction uses select_for_update() to prevent overselling.
- Coupon use-count is incremented via F() (atomic at DB level).
"""

from __future__ import annotations

import logging
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from core.interfaces import IOrderRepository
from core.result import Err, Ok, Result

logger = logging.getLogger("buyladies")

FREE_SHIPPING_THRESHOLD = Decimal("2000")
SHIPPING_COST = Decimal("150")

CANCELLABLE_STATUSES = frozenset({"pending", "confirmed"})


class OrderService:

    def __init__(self, repository: IOrderRepository) -> None:
        self._repo = repository

    def get_user_orders(self, user):
        return self._repo.get_for_user(user)

    def get_order_detail(self, user, order_id) -> Result:
        order = self._repo.get_by_id_for_user(order_id, user)
        if not order:
            return Err("Order not found.")
        return Ok(order)

    def place_order(self, user, order_input: dict, request=None) -> Result:
        """
        Atomic order placement.

        Steps:
          1. Validate cart has items.
          2. Compute subtotal.
          3. Validate & lock coupon.
          4. Compute shipping.
          5. Create Order + OrderItems.
          6. Deduct stock with select_for_update.
          7. Increment coupon uses_count.
          8. Clear cart.
        """
        try:
            order = self._execute_order_placement(user, order_input, request)
            return Ok(order)
        except _OrderPlacementError as exc:
            return Err(str(exc))
        except Exception as exc:
            logger.error(
                "Order creation failed user=%s exc=%s", user.pk, exc, exc_info=True
            )
            return Err("Order could not be placed. Please try again.")

    @transaction.atomic
    def _execute_order_placement(self, user, data: dict, request):
        from cart.models import Cart, CartItem
        from coupons.models import Coupon
        from products.models import ProductVariant

        # 1. Load cart
        try:
            cart = (
                Cart.objects.prefetch_related(
                    "items__variant__product",
                    "items__variant__color",
                    "items__variant__size",
                    "items__variant__product__images",
                ).get(user=user)
            )
        except Cart.DoesNotExist:
            raise _OrderPlacementError("Cart is empty.")

        cart_items = list(cart.items.all())
        if not cart_items:
            raise _OrderPlacementError("Cart is empty.")

        # 2. Subtotal (uses prefetch cache — no extra queries)
        subtotal = sum(item.subtotal for item in cart_items)

        # 3. Coupon validation
        coupon = None
        discount_amount = Decimal("0")
        coupon_code = data.get("coupon_code", "").strip().upper()

        if coupon_code:
            try:
                coupon = Coupon.objects.select_for_update().get(
                    code=coupon_code, is_active=True
                )
            except Coupon.DoesNotExist:
                raise _OrderPlacementError(f'Coupon "{coupon_code}" is not valid.')

            if not coupon.is_valid:
                raise _OrderPlacementError(
                    f'Coupon "{coupon_code}" is expired or has reached its usage limit.'
                )
            discount_amount = coupon.calculate_discount(subtotal)

        # 4. Shipping
        shipping_cost = (
            Decimal("0") if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_COST
        )
        total_amount = subtotal - discount_amount + shipping_cost

        # 5. Build order fields
        order_fields = {k: v for k, v in data.items() if k != "coupon_code"}
        order_fields.update(
            subtotal=subtotal,
            discount_amount=discount_amount,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            coupon_code=coupon_code,
        )

        # 6. Lock variants, verify stock, build items_data
        items_data = []
        for item in cart_items:
            locked_variant = (
                ProductVariant.objects.select_for_update()
                .select_related("product", "color", "size")
                .get(pk=item.variant_id)
            )

            if locked_variant.stock_quantity < item.quantity:
                raise _OrderPlacementError(
                    f'"{locked_variant.product.name}" only has '
                    f"{locked_variant.stock_quantity} unit(s) in stock, "
                    f"but {item.quantity} requested."
                )

            variant_parts = []
            if locked_variant.color:
                variant_parts.append(locked_variant.color.name)
            if locked_variant.size:
                variant_parts.append(locked_variant.size.name)

            img_url = _resolve_product_image(locked_variant, request)

            items_data.append(
                {
                    "variant_id": locked_variant.pk,
                    "variant": locked_variant,
                    "product_name": locked_variant.product.name,
                    "variant_info": " / ".join(variant_parts),
                    "product_image": img_url,
                    "quantity": item.quantity,
                    "unit_price": locked_variant.price,
                    "total_price": item.subtotal,
                }
            )

        # 7. Persist
        order = self._repo.create(user, order_fields, items_data)
        logger.info(
            "Order created order_number=%s user=%s total=%s",
            order.order_number,
            user.pk,
            total_amount,
        )

        # 8. Atomic coupon usage increment
        if coupon:
            from coupons.models import Coupon as CouponModel
            CouponModel.objects.filter(pk=coupon.pk).update(
                uses_count=F("uses_count") + 1
            )

        # 9. Clear cart
        cart.items.all().delete()

        return order

    def cancel_order(self, user, order_id) -> Result:
        order = self._repo.get_by_id_for_user(order_id, user)
        if not order:
            return Err("Order not found.")

        if order.status not in CANCELLABLE_STATUSES:
            return Err(
                f'Orders in "{order.status}" status cannot be cancelled.'
            )

        with transaction.atomic():
            self._repo.update_status(order, "cancelled")
            self._repo.restore_stock(order)

        logger.info(
            "Order cancelled order_number=%s user=%s",
            order.order_number,
            user.pk,
        )
        return Ok(order)


def _resolve_product_image(variant, request) -> str:
    """Resolve primary product image URL from prefetch cache."""
    try:
        images = list(variant.product.images.all())
        img = next((i for i in images if i.is_primary), None) or (
            images[0] if images else None
        )
        if img and img.image and request:
            return request.build_absolute_uri(img.image.url)
    except Exception:
        pass
    return ""


class _OrderPlacementError(Exception):
    """Internal signal to convert atomic rollback into a user-facing error."""
