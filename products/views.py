"""
products/views.py  —  Presentation Layer
Thin HTTP adapters. All catalogue logic lives in ProductService.
"""

from rest_framework import filters, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Product
from .repositories import ProductRepository
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ColorSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    SizeSerializer,
)
from .services import ProductService

_svc = ProductService(ProductRepository())


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="lte")
    category = django_filters.CharFilter(field_name="category__slug")
    brand = django_filters.CharFilter(field_name="brand__slug")
    on_sale = django_filters.BooleanFilter(method="filter_on_sale")

    class Meta:
        model = Product
        fields = ["category", "brand", "is_featured", "is_new_arrival", "is_bestseller"]

    def filter_on_sale(self, queryset, name, value):
        if value:
            return queryset.filter(sale_price__isnull=False)
        return queryset


class CategoryListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return _svc.get_categories()


class BrandListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = BrandSerializer
    pagination_class = None

    def get_queryset(self):
        return _svc.get_brands()


class ColorListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ColorSerializer
    pagination_class = None

    def get_queryset(self):
        return _svc.get_colors()


class SizeListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SizeSerializer
    pagination_class = None

    def get_queryset(self):
        return _svc.get_sizes()


class ProductListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "tags", "brand__name", "category__name"]
    ordering_fields = ["base_price", "created_at", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return _svc.get_product_list()


class ProductDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        result = _svc.get_product_detail(slug)
        if result.is_failure:
            return Response({"detail": result.error}, status=404)
        return Response(
            ProductDetailSerializer(result.value, context={"request": request}).data
        )


class FeaturedProductsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        return _svc.get_featured_products()


class NewArrivalsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        return _svc.get_new_arrivals()


class BestSellersView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        return _svc.get_bestsellers()
