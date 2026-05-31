"""
orders/repositories.py  —  Data Access Layer
All ORM queries for the orders domain.
"""

from __future__ import annotations

from django.db.models import F

from core.interfaces import IOrderRepository
from products.models import ProductVariant
from .models import Order, OrderItem


class OrderRepository(IOrderRepository):

    def get_for_user(self, user):
        return (
            Order.objects.filter(user=user)
            .prefetch_related("items")
            .order_by("-created_at")
        )

    def get_by_id_for_user(self, order_id, user) -> Order | None:
        return (
            Order.objects.filter(id=order_id, user=user)
            .prefetch_related("items")
            .first()
        )

    def create(self, user, order_data: dict, items_data: list[dict]) -> Order:
        """
        Create an Order and its OrderItems atomically.
        The caller wraps this in transaction.atomic() with stock locking.
        """
        order = Order.objects.create(user=user, **order_data)

        for item in items_data:
            OrderItem.objects.create(order=order, **item)

            # Atomic stock deduction via F() — no read-modify-write race
            ProductVariant.objects.filter(pk=item["variant_id"]).update(
                stock_quantity=F("stock_quantity") - item["quantity"]
            )

        return order

    def update_status(self, order: Order, status: str) -> Order:
        order.status = status
        order.save(update_fields=["status", "updated_at"])
        return order

    def restore_stock(self, order: Order) -> None:
        """Re-add stock for all items in a cancelled order."""
        for item in order.items.select_related("variant"):
            if item.variant_id:
                ProductVariant.objects.filter(pk=item.variant_id).update(
                    stock_quantity=F("stock_quantity") + item.quantity
                )
