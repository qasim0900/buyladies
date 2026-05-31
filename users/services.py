"""
users/services.py  —  Business Logic Layer
All user domain rules live here.  No HTTP, no Django request objects.

Follows SRP: one class, one domain concern.
Follows DIP: depends on IUserRepository abstraction, not ORM directly.
"""

from __future__ import annotations

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from core.exceptions import (
    AuthenticationError,
    ConflictError,
    NotFoundError,
    ValidationError,
)
from core.interfaces import IUserRepository
from core.result import Err, Ok, Result


class UserService:
    """
    Encapsulates all user-related business rules.

    Injected dependencies make unit testing trivial:
        repo = MockUserRepository()
        service = UserService(repo)
    """

    def __init__(self, repository: IUserRepository) -> None:
        self._repo = repository

    # ------------------------------------------------------------------
    # Registration
    # ------------------------------------------------------------------

    def register(
        self,
        email: str,
        password: str,
        password2: str,
        first_name: str = "",
        last_name: str = "",
    ) -> Result:
        """
        Register a new user.

        Business rules:
        - Email must be unique.
        - Passwords must match.
        - Password must pass Django's password validators.
        """
        if not email or not password:
            return Err("Email and password are required.")

        if password != password2:
            return Err("Passwords do not match.")

        try:
            validate_password(password)
        except DjangoValidationError as exc:
            return Err(" ".join(exc.messages))

        if self._repo.get_by_email(email):
            return Err("An account with this email already exists.")

        user = self._repo.create(
            email=email.lower().strip(),
            password=password,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
        )

        tokens = self._generate_tokens(user)
        return Ok({"user": user, **tokens})

    # ------------------------------------------------------------------
    # Token generation
    # ------------------------------------------------------------------

    def generate_tokens(self, user) -> dict:
        return self._generate_tokens(user)

    def logout(self, refresh_token: str) -> Result:
        """Blacklist the supplied refresh token."""
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Ok()
        except Exception:
            return Err("Invalid or expired token.")

    # ------------------------------------------------------------------
    # Profile
    # ------------------------------------------------------------------

    def get_profile(self, user_id) -> Result:
        user = self._repo.get_by_id(user_id)
        if not user:
            return Err("User not found.")
        return Ok(user)

    def update_profile(self, user, data: dict) -> Result:
        """
        Update mutable profile fields.
        Email changes are intentionally excluded (require separate verification flow).
        """
        allowed_fields = {"first_name", "last_name", "phone"}
        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            return Err("No valid fields to update.")

        updated_user = self._repo.update(user, **update_data)
        return Ok(updated_user)

    # ------------------------------------------------------------------
    # Addresses
    # ------------------------------------------------------------------

    def list_addresses(self, user):
        return self._repo.get_addresses(user)

    def create_address(self, user, data: dict) -> Result:
        if not data.get("full_name") or not data.get("address_line1"):
            return Err("Full name and address line 1 are required.")
        address = self._repo.create_address(user, data)
        return Ok(address)

    def update_address(self, user, address_id, data: dict) -> Result:
        address = self._repo.get_address(user, address_id)
        if not address:
            return Err("Address not found.")
        updated = self._repo.update_address(address, data)
        return Ok(updated)

    def delete_address(self, user, address_id) -> Result:
        address = self._repo.get_address(user, address_id)
        if not address:
            return Err("Address not found.")
        self._repo.delete_address(address)
        return Ok()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _generate_tokens(user) -> dict:
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
