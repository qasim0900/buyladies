"""
cart/views.py  —  Presentation Layer
HTTP adapters only. All cart rules live in CartService.
"""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .repositories import CartRepository
from .serializers import CartSerializer
from .services import CartService

_svc = CartService(CartRepository())


def _session_key(request) -> str | None:
    """Ensure session exists and return its key."""
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        result = _svc.get_cart(
            user=request.user,
            session_key=_session_key(request),
        )
        if result.is_failure:
            return Response({"detail": result.error}, status=status.HTTP_400_BAD_REQUEST)
        return Response(CartSerializer(result.value, context={"request": request}).data)


class AddToCartView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            return Response(
                {"detail": "quantity must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = _svc.add_to_cart(
            user=request.user,
            session_key=_session_key(request),
            variant_id=request.data.get("variant_id"),
            quantity=quantity,
        )
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(CartSerializer(result.value, context={"request": request}).data)


class UpdateCartItemView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, item_id):
        try:
            quantity = int(request.data.get("quantity", 0))
        except (TypeError, ValueError):
            return Response(
                {"detail": "Invalid quantity."}, status=status.HTTP_400_BAD_REQUEST
            )

        result = _svc.update_item(
            user=request.user,
            session_key=_session_key(request),
            item_id=item_id,
            quantity=quantity,
        )
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(CartSerializer(result.value, context={"request": request}).data)


class RemoveCartItemView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, item_id):
        result = _svc.remove_item(
            user=request.user,
            session_key=_session_key(request),
            item_id=item_id,
        )
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(CartSerializer(result.value, context={"request": request}).data)


class ClearCartView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request):
        _svc.clear_cart(
            user=request.user,
            session_key=_session_key(request),
        )
        return Response({"detail": "Cart cleared."})
