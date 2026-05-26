"""
INT-001 FIX: Entire order creation is wrapped in transaction.atomic().
INT-001 FIX: Stock deduction uses select_for_update() to prevent overselling.
INT-002 FIX: Coupon uses_count incremented via F() expression (atomic at DB level).

Failure mode analysis:
  - If ANY item is out of stock → rollback entire order (atomicity).
  - If DB dies mid-order   → transaction rolls back, cart preserved.
  - If coupon races        → select_for_update serialises concurrent applies.
"""

import logging
from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import generics, status, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from cart.models import Cart, CartItem
from coupons.models import Coupon
from products.models import ProductVariant

logger = logging.getLogger('buyladies')

FREE_SHIPPING_THRESHOLD = Decimal('2000')
SHIPPING_COST = Decimal('150')


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related('items')
            .order_by('-created_at')
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related('items')
        )


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            order = self._place_order(request, data)
        except ValidationError:
            raise
        except Exception as exc:
            logger.error('Order creation failed for user=%s: %s', request.user.pk, exc, exc_info=True)
            return Response(
                {'detail': 'Order could not be placed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            OrderSerializer(order, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    @transaction.atomic
    def _place_order(self, request, data):
        """
        Atomic order placement — all-or-nothing.
        Holds DB-level row locks on variants and coupon to prevent races.
        """
        # 1. Validate cart has items
        try:
            cart = (
                Cart.objects
                .prefetch_related(
                    'items__variant__product',
                    'items__variant__color',
                    'items__variant__size',
                    'items__variant__product__images',
                )
                .get(user=request.user)
            )
        except Cart.DoesNotExist:
            raise ValidationError({'detail': 'Cart is empty.'})

        cart_items = list(cart.items.all())
        if not cart_items:
            raise ValidationError({'detail': 'Cart is empty.'})

        # 2. Compute subtotal from prefetched data (no extra queries)
        subtotal = sum(item.subtotal for item in cart_items)

        # 3. Validate and lock coupon (select_for_update prevents concurrent over-use)
        coupon = None
        discount_amount = Decimal('0')
        coupon_code = data.get('coupon_code', '').strip().upper()

        if coupon_code:
            try:
                coupon = Coupon.objects.select_for_update().get(
                    code=coupon_code, is_active=True
                )
                if not coupon.is_valid:
                    raise ValidationError({'detail': f'Coupon "{coupon_code}" is expired or has reached its usage limit.'})
                discount_amount = coupon.calculate_discount(subtotal)
            except Coupon.DoesNotExist:
                raise ValidationError({'detail': f'Coupon "{coupon_code}" is not valid.'})

        # 4. Shipping
        shipping_cost = Decimal('0') if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_COST
        total_amount = subtotal - discount_amount + shipping_cost

        # 5. Create Order record
        order_fields = {k: v for k, v in data.items() if k != 'coupon_code'}
        order = Order.objects.create(
            user=request.user,
            subtotal=subtotal,
            discount_amount=discount_amount,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            coupon_code=coupon_code,
            **order_fields,
        )
        logger.info('Order created order_number=%s user=%s total=%s',
                    order.order_number, request.user.pk, total_amount)

        # 6. Lock variants, verify stock, create OrderItems, deduct inventory
        for item in cart_items:
            # Row-level lock prevents concurrent orders from overselling
            locked_variant = (
                ProductVariant.objects
                .select_for_update()
                .select_related('product', 'color', 'size')
                .get(pk=item.variant_id)
            )

            if locked_variant.stock_quantity < item.quantity:
                product_name = locked_variant.product.name
                raise ValidationError({
                    'detail': (
                        f'"{product_name}" only has {locked_variant.stock_quantity} '
                        f'unit(s) in stock, but {item.quantity} requested.'
                    )
                })

            variant_parts = []
            if locked_variant.color:
                variant_parts.append(locked_variant.color.name)
            if locked_variant.size:
                variant_parts.append(locked_variant.size.name)

            # Resolve product image (uses prefetch cache)
            img_url = ''
            try:
                product_images = list(locked_variant.product.images.all())
                primary_img = next(
                    (img for img in product_images if img.is_primary), None
                ) or (product_images[0] if product_images else None)
                if primary_img and primary_img.image:
                    img_url = request.build_absolute_uri(primary_img.image.url)
            except Exception:
                pass

            OrderItem.objects.create(
                order=order,
                variant=locked_variant,
                product_name=locked_variant.product.name,
                variant_info=' / '.join(variant_parts),
                product_image=img_url,
                quantity=item.quantity,
                unit_price=locked_variant.price,
                total_price=item.subtotal,
            )

            # Atomic stock deduction via F() expression (no read-modify-write race)
            ProductVariant.objects.filter(pk=locked_variant.pk).update(
                stock_quantity=F('stock_quantity') - item.quantity
            )

        # 7. INT-002 FIX: Atomic coupon usage increment via F()
        if coupon:
            Coupon.objects.filter(pk=coupon.pk).update(
                uses_count=F('uses_count') + 1
            )

        # 8. Clear cart
        cart.items.all().delete()

        return order


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in ('pending', 'confirmed'):
            return Response(
                {'detail': f'Orders in "{order.status}" status cannot be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            order.status = 'cancelled'
            order.save(update_fields=['status', 'updated_at'])

            # Restore inventory on cancellation
            for item in order.items.select_related('variant'):
                if item.variant_id:
                    ProductVariant.objects.filter(pk=item.variant_id).update(
                        stock_quantity=F('stock_quantity') + item.quantity
                    )

        logger.info('Order cancelled order_number=%s user=%s', order.order_number, request.user.pk)
        return Response({'detail': 'Order cancelled successfully.'})
