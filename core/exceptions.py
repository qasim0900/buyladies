"""
core/exceptions.py
Domain-level exceptions — technology-agnostic.

The service layer raises these; the presentation layer (views)
maps them to appropriate HTTP responses.  Never import Django or
DRF here so that services remain independently testable.
"""

from __future__ import annotations


class DomainException(Exception):
    """Base for all domain / business-rule violations."""

    default_message: str = "A domain error occurred."

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.default_message
        super().__init__(self.message)


class ValidationError(DomainException):
    """Input failed business-rule validation."""
    default_message = "Validation failed."


class NotFoundError(DomainException):
    """Requested resource does not exist."""
    default_message = "Resource not found."


class PermissionDeniedError(DomainException):
    """Caller lacks permission for the requested action."""
    default_message = "Permission denied."


class ConflictError(DomainException):
    """State conflict — e.g. duplicate, already-exists."""
    default_message = "Resource conflict."


class OutOfStockError(DomainException):
    """Requested stock quantity is unavailable."""
    default_message = "Item is out of stock."


class CouponError(DomainException):
    """Coupon validation or application failure."""
    default_message = "Coupon is not valid."


class OrderError(DomainException):
    """Order lifecycle violation."""
    default_message = "Order operation failed."


class AuthenticationError(DomainException):
    """Invalid credentials or token."""
    default_message = "Authentication failed."
