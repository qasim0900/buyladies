"""
tests/test_users_service.py
Unit tests for UserService — pure Python, no DB, no HTTP.

Coverage targets:
- Happy path registration
- Duplicate email rejection
- Password mismatch rejection
- Weak password rejection
- Profile update (valid + invalid fields)
- Logout (valid + invalid token)
- Address CRUD
"""

import pytest
from decimal import Decimal
from unittest.mock import MagicMock, patch
from users.services import UserService


class TestUserService_Register:
    def test_register_success(self, mock_user_repo):
        mock_user_repo.get_by_email.return_value = None
        mock_user_repo.create.return_value = MagicMock(
            pk="uuid-1", email="alice@example.com"
        )
        svc = UserService(mock_user_repo)

        with patch("users.services.RefreshToken") as mock_rt:
            mock_rt.for_user.return_value = MagicMock(
                __str__=lambda self: "refresh-tok",
                access_token=MagicMock(__str__=lambda self: "access-tok"),
            )
            result = svc.register(
                email="alice@example.com",
                password="Str0ngP@ss!",
                password2="Str0ngP@ss!",
                first_name="Alice",
                last_name="Smith",
            )

        assert result.is_ok
        assert "user" in result.value
        assert "access" in result.value
        assert "refresh" in result.value

    def test_register_duplicate_email(self, mock_user_repo):
        mock_user_repo.get_by_email.return_value = MagicMock()
        svc = UserService(mock_user_repo)

        result = svc.register(
            email="alice@example.com",
            password="Str0ngP@ss!",
            password2="Str0ngP@ss!",
        )

        assert result.is_failure
        assert "already exists" in result.error

    def test_register_password_mismatch(self, mock_user_repo):
        mock_user_repo.get_by_email.return_value = None
        svc = UserService(mock_user_repo)

        result = svc.register(
            email="alice@example.com",
            password="Str0ngP@ss!",
            password2="DifferentP@ss!",
        )

        assert result.is_failure
        assert "do not match" in result.error

    def test_register_missing_email(self, mock_user_repo):
        svc = UserService(mock_user_repo)
        result = svc.register(email="", password="Str0ngP@ss!", password2="Str0ngP@ss!")
        assert result.is_failure

    def test_register_missing_password(self, mock_user_repo):
        svc = UserService(mock_user_repo)
        result = svc.register(email="x@example.com", password="", password2="")
        assert result.is_failure

    def test_register_weak_password(self, mock_user_repo):
        mock_user_repo.get_by_email.return_value = None
        svc = UserService(mock_user_repo)

        result = svc.register(
            email="alice@example.com",
            password="123",
            password2="123",
        )

        assert result.is_failure

    def test_register_email_normalized(self, mock_user_repo):
        mock_user_repo.get_by_email.return_value = None
        created_user = MagicMock(pk="uuid-1", email="alice@example.com")
        mock_user_repo.create.return_value = created_user
        svc = UserService(mock_user_repo)

        with patch("users.services.RefreshToken") as mock_rt:
            mock_rt.for_user.return_value = MagicMock(
                __str__=lambda self: "r",
                access_token=MagicMock(__str__=lambda self: "a"),
            )
            svc.register(
                email="  ALICE@EXAMPLE.COM  ",
                password="Str0ngP@ss!",
                password2="Str0ngP@ss!",
            )

        call_kwargs = mock_user_repo.create.call_args[1]
        assert call_kwargs["email"] == "alice@example.com"


class TestUserService_ProfileUpdate:
    def test_update_valid_fields(self, user_service, stub_user, mock_user_repo):
        mock_user_repo.update.return_value = stub_user

        result = user_service.update_profile(stub_user, {"first_name": "Bob"})

        assert result.is_ok
        mock_user_repo.update.assert_called_once_with(stub_user, first_name="Bob")

    def test_update_ignores_email_field(self, user_service, stub_user, mock_user_repo):
        mock_user_repo.update.return_value = stub_user

        result = user_service.update_profile(
            stub_user, {"email": "hacked@evil.com", "first_name": "Bob"}
        )

        # email must NOT be forwarded
        call_kwargs = mock_user_repo.update.call_args[1]
        assert "email" not in call_kwargs

    def test_update_no_valid_fields_returns_error(self, user_service, stub_user):
        result = user_service.update_profile(stub_user, {"email": "hacked@evil.com"})
        assert result.is_failure
        assert "No valid fields" in result.error


class TestUserService_Logout:
    def test_logout_valid_token(self, user_service):
        with patch("users.services.RefreshToken") as mock_rt:
            instance = MagicMock()
            mock_rt.return_value = instance
            result = user_service.logout("valid-refresh-token")

        assert result.is_ok
        instance.blacklist.assert_called_once()

    def test_logout_invalid_token(self, user_service):
        with patch("users.services.RefreshToken", side_effect=Exception("bad token")):
            result = user_service.logout("garbage")

        assert result.is_failure
        assert "Invalid" in result.error


class TestUserService_Addresses:
    def test_create_address_success(self, user_service, stub_user, mock_user_repo):
        mock_address = MagicMock()
        mock_user_repo.create_address.return_value = mock_address

        result = user_service.create_address(
            stub_user,
            {
                "full_name": "Alice Smith",
                "address_line1": "123 Main St",
                "city": "Lahore",
                "state": "Punjab",
                "postal_code": "54000",
            },
        )

        assert result.is_ok
        assert result.value == mock_address

    def test_create_address_missing_required_field(self, user_service, stub_user):
        result = user_service.create_address(
            stub_user, {"city": "Lahore"}
        )
        assert result.is_failure

    def test_delete_address_not_found(self, user_service, stub_user, mock_user_repo):
        mock_user_repo.get_address.return_value = None
        result = user_service.delete_address(stub_user, "non-existent-id")
        assert result.is_failure
        assert "not found" in result.error.lower()

    def test_delete_address_success(self, user_service, stub_user, mock_user_repo):
        mock_address = MagicMock()
        mock_user_repo.get_address.return_value = mock_address

        result = user_service.delete_address(stub_user, "some-id")

        assert result.is_ok
        mock_user_repo.delete_address.assert_called_once_with(mock_address)
