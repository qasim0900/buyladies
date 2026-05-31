"""
orders/views.py  —  Presentation Layer
HTTP adapters only. All order logic lives in OrderService.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .repositories import OrderRepository
from .serializers import CreateOrderSerializer, OrderSerializer
from .services import OrderService

_svc = OrderService(OrderRepository())


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return _svc.get_user_orders(self.request.user)


class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        result = _svc.get_order_detail(request.user, pk)
        if result.is_failure:
            return Response({"detail": result.error}, status=status.HTTP_404_NOT_FOUND)
        return Response(
            OrderSerializer(result.value, context={"request": request}).data
        )


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = _svc.place_order(
            user=request.user,
            order_input=serializer.validated_data,
            request=request,
        )
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            OrderSerializer(result.value, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        result = _svc.cancel_order(request.user, pk)
        if result.is_failure:
            code = (
                status.HTTP_404_NOT_FOUND
                if "not found" in result.error.lower()
                else status.HTTP_400_BAD_REQUEST
            )
            return Response({"detail": result.error}, status=code)
        return Response({"detail": "Order cancelled successfully."})
