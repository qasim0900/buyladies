"""
PERF-003 FIX: All cart views now use a rich prefetch_related chain so that
CartItemSerializer.get_product_image() and CartItem.subtotal (which accesses
variant.product) never issue extra DB queries.

One CartView GET = exactly 2 queries:
  Q1: SELECT cart WHERE user_id = ?
  Q2: SELECT cart_items + variants + products + images (JOIN chain via prefetch)
"""

from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Prefetch

from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import ProductVariant, ProductImage


def _cart_prefetch_qs():
    """
    Returns a Cart queryset with the full item hierarchy prefetched.
    Avoids N+1 for:
      - variant.product (name, slug, price)
      - variant.color, variant.size
      - variant.product.images (for product thumbnail)
    """
    return Cart.objects.prefetch_related(
        Prefetch(
            'items',
            queryset=CartItem.objects.select_related(
                'variant__product',
                'variant__color',
                'variant__size',
            ).prefetch_related(
                Prefetch(
                    'variant__product__images',
                    queryset=ProductImage.objects.order_by('sort_order', 'id'),
                )
            ).order_by('added_at'),
        )
    )


def get_or_create_cart(request):
    """
    Returns a fully prefetched Cart for the current user or session.
    Always returns the same cart object with the rich prefetch chain applied.
    """
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key)

    # Apply the prefetch chain to the already-retrieved cart
    return _cart_prefetch_qs().get(pk=cart.pk)


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart, context={'request': request}).data)


class AddToCartView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        variant_id = request.data.get('variant_id')
        try:
            quantity = max(1, int(request.data.get('quantity', 1)))
        except (TypeError, ValueError):
            return Response(
                {'detail': 'quantity must be a positive integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not variant_id:
            return Response(
                {'detail': 'variant_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            variant = ProductVariant.objects.select_related('product').get(
                id=variant_id, is_active=True
            )
        except ProductVariant.DoesNotExist:
            return Response(
                {'detail': 'Product variant not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if variant.stock_quantity < quantity:
            return Response(
                {'detail': f'Only {variant.stock_quantity} item(s) in stock.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_bare, _ = Cart.objects.get_or_create(
            **(
                {'user': request.user}
                if request.user.is_authenticated
                else {'session_key': request.session.session_key or self._ensure_session(request)}
            )
        )

        item, created = CartItem.objects.get_or_create(
            cart=cart_bare, variant=variant,
            defaults={'quantity': quantity},
        )
        if not created:
            new_qty = item.quantity + quantity
            if new_qty > variant.stock_quantity:
                return Response(
                    {'detail': f'Only {variant.stock_quantity} item(s) in stock.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = new_qty
            item.save(update_fields=['quantity'])

        # Return fully prefetched cart
        cart = _cart_prefetch_qs().get(pk=cart_bare.pk)
        return Response(CartSerializer(cart, context={'request': request}).data)

    @staticmethod
    def _ensure_session(request):
        request.session.create()
        return request.session.session_key


class UpdateCartItemView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, item_id):
        cart_bare = _get_cart_bare(request)
        if not cart_bare:
            return Response({'detail': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            item = CartItem.objects.select_related('variant').get(id=item_id, cart=cart_bare)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            quantity = int(request.data.get('quantity', item.quantity))
        except (TypeError, ValueError):
            return Response({'detail': 'Invalid quantity.'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            item.delete()
        else:
            if quantity > item.variant.stock_quantity:
                return Response(
                    {'detail': f'Only {item.variant.stock_quantity} item(s) in stock.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = quantity
            item.save(update_fields=['quantity'])

        cart = _cart_prefetch_qs().get(pk=cart_bare.pk)
        return Response(CartSerializer(cart, context={'request': request}).data)


class RemoveCartItemView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, item_id):
        cart_bare = _get_cart_bare(request)
        if not cart_bare:
            return Response({'detail': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)
        CartItem.objects.filter(id=item_id, cart=cart_bare).delete()
        cart = _cart_prefetch_qs().get(pk=cart_bare.pk)
        return Response(CartSerializer(cart, context={'request': request}).data)


class ClearCartView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request):
        cart_bare = _get_cart_bare(request)
        if cart_bare:
            cart_bare.items.all().delete()
        return Response({'detail': 'Cart cleared.'})


def _get_cart_bare(request):
    """Returns the raw Cart (no prefetch) for mutation operations."""
    if request.user.is_authenticated:
        return Cart.objects.filter(user=request.user).first()
    session_key = request.session.session_key
    if session_key:
        return Cart.objects.filter(session_key=session_key).first()
    return None
