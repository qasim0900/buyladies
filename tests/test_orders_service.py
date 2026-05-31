"""
tests/test_orders_service.py
Unit tests for OrderService.

Coverage targets:
- get_user_orders delegates to repo
- get_order_detail: found / not-found
- cancel_order: success, not found, wrong status
- Cancellable statuses enforced

Note: cancel_order uses `transaction.atomic()` which touches the DB connection.
We patch `orders.services.transaction` to keep these as pure unit tests.
"""

import pytest
from unittest.mock import MagicMock, patch, PropertyMock
from orders.services import OrderService, CANCELLABLE_STATUSES


class TestOrderService_GetOrders:
    def test_get_user_orders_delegates(self, stub_user, mock_order_repo):
        mock_qs = MagicMock()
        mock_order_repo.get_for_user.return_value = mock_qs
        svc = OrderService(mock_order_repo)

        result = svc.get_user_orders(stub_user)

        assert result == mock_qs
        mock_order_repo.get_for_user.assert_called_once_with(stub_user)


class TestOrderService_GetDetail:
    def test_found(self, stub_user, mock_order_repo):
        mock_order = MagicMock()
        mock_order_repo.get_by_id_for_user.return_value = mock_order
        svc = OrderService(mock_order_repo)

        result = svc.get_order_detail(stub_user, "order-uuid")

        assert result.is_ok
        assert result.value == mock_order

    def test_not_found(self, stub_user, mock_order_repo):
        mock_order_repo.get_by_id_for_user.return_value = None
        svc = OrderService(mock_order_repo)

        result = svc.get_order_detail(stub_user, "ghost-uuid")

        assert result.is_failure
        assert "not found" in result.error.lower()


class TestOrderService_CancelOrder:
    """
    Patch transaction.atomic so cancel_order stays a pure unit test.
    The context manager `with transaction.atomic():` becomes a no-op.
    """

    def _make_atomic_patch(self):
        """Return a patch that turns transaction.atomic into a no-op context manager."""
        from contextlib import contextmanager

        @contextmanager
        def noop_atomic():
            yield

        return patch("orders.services.transaction.atomic", noop_atomic)

    def test_cancel_success_pending(self, stub_user, mock_order_repo):
        mock_order = MagicMock()
        mock_order.status = "pending"
        mock_order.order_number = "BL123456"
        mock_order_repo.get_by_id_for_user.return_value = mock_order
        svc = OrderService(mock_order_repo)

        with self._make_atomic_patch():
            result = svc.cancel_order(stub_user, "order-uuid")

        assert result.is_ok
        mock_order_repo.update_status.assert_called_once_with(mock_order, "cancelled")
        mock_order_repo.restore_stock.assert_called_once_with(mock_order)

    def test_cancel_success_confirmed(self, stub_user, mock_order_repo):
        mock_order = MagicMock()
        mock_order.status = "confirmed"
        mock_order.order_number = "BL123457"
        mock_order_repo.get_by_id_for_user.return_value = mock_order
        svc = OrderService(mock_order_repo)

        with self._make_atomic_patch():
            result = svc.cancel_order(stub_user, "order-uuid")

        assert result.is_ok

    def test_cancel_not_found(self, stub_user, mock_order_repo):
        mock_order_repo.get_by_id_for_user.return_value = None
        svc = OrderService(mock_order_repo)

        result = svc.cancel_order(stub_user, "ghost-uuid")

        assert result.is_failure
        assert "not found" in result.error.lower()

    @pytest.mark.parametrize("bad_status", ["shipped", "delivered", "refunded", "cancelled"])
    def test_cancel_non_cancellable_status(self, bad_status, stub_user, mock_order_repo):
        mock_order = MagicMock()
        mock_order.status = bad_status
        mock_order_repo.get_by_id_for_user.return_value = mock_order
        svc = OrderService(mock_order_repo)

        result = svc.cancel_order(stub_user, "order-uuid")

        assert result.is_failure
        assert bad_status in result.error

    def test_cancellable_statuses_constant(self):
        assert "pending" in CANCELLABLE_STATUSES
        assert "confirmed" in CANCELLABLE_STATUSES
        assert "shipped" not in CANCELLABLE_STATUSES
        assert "delivered" not in CANCELLABLE_STATUSES

    def test_stock_restored_on_cancel(self, stub_user, mock_order_repo):
        mock_order = MagicMock()
        mock_order.status = "pending"
        mock_order.order_number = "BL999"
        mock_order_repo.get_by_id_for_user.return_value = mock_order
        svc = OrderService(mock_order_repo)

        with self._make_atomic_patch():
            svc.cancel_order(stub_user, "order-uuid")

        mock_order_repo.restore_stock.assert_called_once_with(mock_order)


class TestOrderService_PlaceOrder:
    def test_place_order_empty_cart_returns_error(self, stub_user, mock_order_repo):
        svc = OrderService(mock_order_repo)

        with patch("orders.services.transaction.atomic", lambda f: f):
            result = svc.place_order(stub_user, {}, request=None)

        assert result.is_failure
