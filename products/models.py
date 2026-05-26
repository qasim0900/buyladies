"""
ARCH-003 FIX: Added composite indexes for the most common query patterns:
  - (is_active, is_new_arrival) — New Arrivals section
  - (is_active, is_bestseller)  — Best Sellers section
  - (brand, is_active)          — Brand filter page
  - (sale_price)                — On Sale filter
These eliminate full table scans on filtered list views.
"""

import uuid
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    parent = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='subcategories'
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'
        ordering = ['sort_order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['parent']),
            models.Index(fields=['is_active', 'sort_order']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Brand(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    logo = models.ImageField(upload_to='brands/', null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'brands'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Color(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    hex_code = models.CharField(max_length=10, blank=True)

    class Meta:
        db_table = 'colors'
        ordering = ['name']

    def __str__(self):
        return self.name


class Size(models.Model):
    SIZE_TYPES = [
        ('clothing', 'Clothing'),
        ('shoes', 'Shoes'),
        ('accessories', 'Accessories'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    size_type = models.CharField(max_length=20, choices=SIZE_TYPES, default='clothing')
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'sizes'
        ordering = ['size_type', 'sort_order']

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=300, db_index=True)
    slug = models.SlugField(max_length=320, unique=True, blank=True)
    description = models.TextField(blank=True)
    short_description = models.CharField(max_length=500, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name='products'
    )
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products'
    )
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tags = models.CharField(max_length=500, blank=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_new_arrival = models.BooleanField(default=False, db_index=True)
    is_bestseller = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['is_featured', 'is_active']),
            models.Index(fields=['-created_at']),
            # ARCH-003: New composite indexes for common filter patterns
            models.Index(fields=['is_active', 'is_new_arrival'], name='idx_product_active_new'),
            models.Index(fields=['is_active', 'is_bestseller'], name='idx_product_active_best'),
            models.Index(fields=['brand', 'is_active'], name='idx_product_brand_active'),
            models.Index(fields=['sale_price'], name='idx_product_sale_price'),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            self.slug = base
            # Handle slug collisions
            counter = 1
            while Product.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f'{base}-{counter}'
                counter += 1
        super().save(*args, **kwargs)

    @property
    def effective_price(self):
        return self.sale_price if self.sale_price else self.base_price

    @property
    def discount_percent(self):
        if self.sale_price and self.base_price > 0:
            return int((1 - self.sale_price / self.base_price) * 100)
        return 0

    @property
    def primary_image(self):
        """
        PERF-002 FIX: iterates the prefetch cache in Python instead of
        issuing a new .filter().first() DB query per product.
        """
        images = list(self.images.all())
        if not images:
            return None
        for img in images:
            if img.is_primary:
                return img
        return images[0]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=300, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'product_images'
        ordering = ['sort_order', 'id']

    def save(self, *args, **kwargs):
        # Auto-set alt_text from product name
        if not self.alt_text and self.product_id:
            try:
                self.alt_text = self.product.name
            except Exception:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.product.name} — image {self.sort_order}'


class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    size = models.ForeignKey(Size, on_delete=models.SET_NULL, null=True, blank=True)
    sku = models.CharField(max_length=100, unique=True, blank=True)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'product_variants'
        unique_together = [['product', 'color', 'size']]
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['product', 'is_active']),
        ]

    @property
    def price(self):
        if self.price_override:
            return self.price_override
        # product must be select_related for this to avoid a DB query
        return self.product.effective_price

    @property
    def in_stock(self):
        return self.stock_quantity > 0

    def __str__(self):
        parts = [self.product.name]
        if self.color:
            parts.append(self.color.name)
        if self.size:
            parts.append(self.size.name)
        return ' — '.join(parts)
