"""
wishlist/views.py  —  Presentation Layer
HTTP adapters only. All wishlist rules live in WishlistService.
"""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .repositories import WishlistRepository
from .serializers import WishlistSerializer
from .services import WishlistService

_svc = WishlistService(WishlistRepository())


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        result = _svc.get_wishlist(request.user)
        return Response(
            WishlistSerializer(result.value, context={"request": request}).data
        )


class ToggleWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        result = _svc.toggle(request.user, request.data.get("product_id"))
        if result.is_failure:
            code = (
                status.HTTP_404_NOT_FOUND
                if "not found" in result.error.lower()
                else status.HTTP_400_BAD_REQUEST
            )
            return Response({"detail": result.error}, status=code)
        return Response(result.value)
