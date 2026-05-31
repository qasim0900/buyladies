"""
reviews/views.py  —  Presentation Layer
HTTP adapters only. All review rules live in ReviewService.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .repositories import ReviewRepository
from .serializers import CreateReviewSerializer, ReviewSerializer
from .services import ReviewService

_svc = ReviewService(ReviewRepository())


class ProductReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return _svc.get_product_reviews(self.kwargs["product_slug"])


class CreateReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_slug):
        serializer = CreateReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = _svc.submit_review(
            user=request.user,
            product_slug=product_slug,
            data=serializer.validated_data,
        )
        if result.is_failure:
            return Response(
                {"detail": result.error}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            ReviewSerializer(result.value).data, status=status.HTTP_201_CREATED
        )
