"""
core/interfaces.py
Abstract base classes (interfaces) that all repositories must implement.

Depending on abstractions, not concretions — satisfies the Dependency
Inversion Principle (D in SOLID).  Services receive repositories through
their constructor, making them trivially mockable in unit tests.
"""

from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

T = TypeVar("T")
ID = TypeVar("ID")


class BaseRepository(ABC, Generic[T, ID]):
    """
    Generic CRUD contract.  Concrete repositories extend this and add
    domain-specific query methods.
    """

    @abstractmethod
    def get_by_id(self, entity_id: ID) -> T | None:
        """Return entity by primary key, or None if not found."""

    @abstractmethod
    def save(self, entity: T) -> T:
        """Persist a new or updated entity and return it."""

    @abstractmethod
    def delete(self, entity: T) -> None:
        """Remove an entity from the store."""


class IUserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: Any):
        pass

    @abstractmethod
    def get_by_email(self, email: str):
        pass

    @abstractmethod
    def create(self, email: str, password: str, **kwargs):
        pass

    @abstractmethod
    def update(self, user, **kwargs):
        pass

    @abstractmethod
    def get_addresses(self, user):
        pass

    @abstractmethod
    def get_address(self, user, address_id):
        pass

    @abstractmethod
    def create_address(self, user, data: dict):
        pass

    @abstractmethod
    def update_address(self, address, data: dict):
        pass

    @abstractmethod
    def delete_address(self, address) -> None:
        pass


class IProductRepository(ABC):
    @abstractmethod
    def get_active_list(self, filters: dict | None = None):
        pass

    @abstractmethod
    def get_by_slug(self, slug: str):
        pass

    @abstractmethod
    def get_featured(self, limit: int = 12):
        pass

    @abstractmethod
    def get_new_arrivals(self, limit: int = 12):
        pass

    @abstractmethod
    def get_bestsellers(self, limit: int = 12):
        pass

    @abstractmethod
    def get_all_categories(self):
        pass

    @abstractmethod
    def get_all_brands(self):
        pass


class ICartRepository(ABC):
    @abstractmethod
    def get_for_user(self, user):
        pass

    @abstractmethod
    def get_for_session(self, session_key: str):
        pass

    @abstractmethod
    def get_or_create_for_user(self, user):
        pass

    @abstractmethod
    def get_or_create_for_session(self, session_key: str):
        pass

    @abstractmethod
    def get_item(self, cart, item_id):
        pass

    @abstractmethod
    def add_item(self, cart, variant, quantity: int):
        pass

    @abstractmethod
    def update_item_quantity(self, item, quantity: int):
        pass

    @abstractmethod
    def remove_item(self, item) -> None:
        pass

    @abstractmethod
    def clear(self, cart) -> None:
        pass


class IOrderRepository(ABC):
    @abstractmethod
    def get_for_user(self, user):
        pass

    @abstractmethod
    def get_by_id_for_user(self, order_id, user):
        pass

    @abstractmethod
    def create(self, user, order_data: dict, items: list[dict]) -> Any:
        pass


class ICouponRepository(ABC):
    @abstractmethod
    def get_by_code(self, code: str):
        pass

    @abstractmethod
    def lock_for_update(self, coupon):
        pass

    @abstractmethod
    def increment_uses(self, coupon) -> None:
        pass


class IReviewRepository(ABC):
    @abstractmethod
    def get_for_product(self, product_slug: str):
        pass

    @abstractmethod
    def exists(self, product_slug: str, user) -> bool:
        pass

    @abstractmethod
    def create(self, user, product, data: dict):
        pass


class IWishlistRepository(ABC):
    @abstractmethod
    def get_or_create(self, user):
        pass

    @abstractmethod
    def has_product(self, wishlist, product_id) -> bool:
        pass

    @abstractmethod
    def add_product(self, wishlist, product):
        pass

    @abstractmethod
    def remove_product(self, wishlist, product_id) -> None:
        pass
