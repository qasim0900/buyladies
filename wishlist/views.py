from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer
from products.models import Product


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist, context={'request': request})
        return Response(serializer.data)


class ToggleWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'detail': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)
        if not created:
            item.delete()
            return Response({'added': False, 'message': 'Removed from wishlist.'})

        return Response({'added': True, 'message': 'Added to wishlist.'})
