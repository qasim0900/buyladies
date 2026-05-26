from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer
from products.models import Product


class ProductReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Review.objects.filter(
            product__slug=self.kwargs['product_slug'],
            is_approved=True
        ).select_related('user').order_by('-created_at')


class CreateReviewView(generics.CreateAPIView):
    serializer_class = CreateReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product = generics.get_object_or_404(Product, slug=self.kwargs['product_slug'])
        serializer.save(user=self.request.user, product=product)

    def create(self, request, *args, **kwargs):
        if Review.objects.filter(
            product__slug=kwargs['product_slug'],
            user=request.user
        ).exists():
            return Response({'detail': 'You have already reviewed this product.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)
