"""
users/repositories.py  —  Data Access Layer
Concrete implementation of IUserRepository using Django ORM.

All database interaction for the users domain lives here.
Services never import Django models directly.
"""

from __future__ import annotations

from core.interfaces import IUserRepository
from core.exceptions import NotFoundError
from .models import CustomUser, Address


class UserRepository(IUserRepository):

    def get_by_id(self, user_id) -> CustomUser | None:
        return CustomUser.objects.filter(id=user_id, is_active=True).first()

    def get_by_email(self, email: str) -> CustomUser | None:
        return CustomUser.objects.filter(email__iexact=email).first()

    def create(self, email: str, password: str, **kwargs) -> CustomUser:
        return CustomUser.objects.create_user(email=email, password=password, **kwargs)

    def update(self, user: CustomUser, **kwargs) -> CustomUser:
        for field, value in kwargs.items():
            setattr(user, field, value)
        user.save(update_fields=list(kwargs.keys()) + ["updated_at"])
        return user

    def get_addresses(self, user: CustomUser):
        return Address.objects.filter(user=user).order_by("-is_default", "created_at")

    def get_address(self, user: CustomUser, address_id) -> Address | None:
        return Address.objects.filter(id=address_id, user=user).first()

    def create_address(self, user: CustomUser, data: dict) -> Address:
        if data.get("is_default"):
            Address.objects.filter(user=user).update(is_default=False)
        return Address.objects.create(user=user, **data)

    def update_address(self, address: Address, data: dict) -> Address:
        if data.get("is_default"):
            Address.objects.filter(user=address.user).exclude(pk=address.pk).update(is_default=False)
        for field, value in data.items():
            setattr(address, field, value)
        address.save()
        return address

    def delete_address(self, address: Address) -> None:
        address.delete()
