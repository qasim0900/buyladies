"""
users/views.py  —  Presentation Layer
HTTP adapters only. All business logic lives in UserService.
"""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .repositories import UserRepository
from .serializers import AddressSerializer, RegisterSerializer, UserSerializer
from .services import UserService

_svc = UserService(UserRepository())


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        result = _svc.register(
            email=d["email"],
            password=d["password"],
            password2=d["password2"],
            first_name=d.get("first_name", ""),
            last_name=d.get("last_name", ""),
        )
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_400_BAD_REQUEST
            )

        payload = result.value
        return Response(
            {
                "user": UserSerializer(
                    payload["user"], context={"request": request}
                ).data,
                "refresh": payload["refresh"],
                "access": payload["access"],
            },
            status=status.HTTP_201_CREATED,
        )


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            UserSerializer(request.user, context={"request": request}).data
        )

    def patch(self, request):
        result = _svc.update_profile(request.user, request.data)
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            UserSerializer(result.value, context={"request": request}).data
        )


class AddressListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        addresses = _svc.list_addresses(request.user)
        return Response(AddressSerializer(addresses, many=True).data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = _svc.create_address(request.user, serializer.validated_data)
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            AddressSerializer(result.value).data, status=status.HTTP_201_CREATED
        )


class AddressDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        from .models import Address
        address = Address.objects.filter(id=pk, user=request.user).first()
        if not address:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AddressSerializer(address).data)

    def patch(self, request, pk):
        serializer = AddressSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        result = _svc.update_address(request.user, pk, serializer.validated_data)
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(AddressSerializer(result.value).data)

    def delete(self, request, pk):
        result = _svc.delete_address(request.user, pk)
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        result = _svc.logout(request.data.get("refresh", ""))
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response({"detail": "Successfully logged out."})
