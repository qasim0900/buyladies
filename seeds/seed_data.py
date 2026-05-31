"""
seeds/seed_data.py  —  Seed Data Script
Run via: python manage.py shell < seeds/seed_data.py
     or: python seeds/seed_data.py  (with Django configured)

Populates the database with realistic e-commerce data:
  - 2 admin users + 5 regular customers
  - 4 top-level categories + 8 sub-categories
  - 3 brands
  - 8 colors + 6 sizes
  - 24 products (with variants and images)
  - 3 coupons
  - 4 hero banners
  - Sample reviews
  - Sample orders

Idempotent: safe to run multiple times (uses get_or_create throughout).
"""

import os
import sys
import django
from decimal import Decimal
from datetime import timedelta

# ------------------------------------------------------------------
# Bootstrap Django when run as a standalone script
# ------------------------------------------------------------------
if __name__ == "__main__" and "django" not in sys.modules:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, BASE_DIR)
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "buyladies.settings")
    django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model

from products.models import (
    Brand, Category, Color, Product, ProductImage, ProductVariant, Size
)
from coupons.models import Coupon
from banners.models import Banner
from reviews.models import Review
from orders.models import Order, OrderItem
from users.models import Address

User = get_user_model()


# ===========================================================================
# Helpers
# ===========================================================================

def log(msg: str) -> None:
    print(f"  ✓ {msg}")


# ===========================================================================
# 1. Users
# ===========================================================================

def seed_users():
    print("\n[Users]")

    admin, created = User.objects.get_or_create(
        email="admin@buyladies.pk",
        defaults=dict(
            first_name="Admin",
            last_name="BuyLadies",
            is_staff=True,
            is_superuser=True,
            is_active=True,
            is_email_verified=True,
        ),
    )
    if created:
        admin.set_password("Admin@12345!")
        admin.save()
    log(f"Admin: {admin.email}")

    customers = [
        ("fatima@example.com",  "Fatima",  "Khan",    "0300-1234567"),
        ("sara@example.com",    "Sara",    "Ahmed",   "0311-2345678"),
        ("aisha@example.com",   "Aisha",   "Malik",   "0321-3456789"),
        ("zara@example.com",    "Zara",    "Siddiqui","0333-4567890"),
        ("hira@example.com",    "Hira",    "Iqbal",   "0345-5678901"),
    ]
    created_customers = []
    for email, first, last, phone in customers:
        u, created = User.objects.get_or_create(
            email=email,
            defaults=dict(
                first_name=first,
                last_name=last,
                phone=phone,
                is_active=True,
                is_email_verified=True,
            ),
        )
        if created:
            u.set_password("Customer@123!")
            u.save()
        created_customers.append(u)
        log(f"Customer: {u.email}")

    # Addresses for first two customers
    address_data = [
        {
            "user": created_customers[0],
            "label": "home",
            "full_name": "Fatima Khan",
            "phone": "0300-1234567",
            "address_line1": "House 12, Street 4",
            "city": "Lahore",
            "state": "Punjab",
            "postal_code": "54000",
            "is_default": True,
        },
        {
            "user": created_customers[1],
            "label": "home",
            "full_name": "Sara Ahmed",
            "phone": "0311-2345678",
            "address_line1": "Flat 5, Block C, Gulshan",
            "city": "Karachi",
            "state": "Sindh",
            "postal_code": "75300",
            "is_default": True,
        },
    ]
    for adata in address_data:
        user = adata.pop("user")
        Address.objects.get_or_create(
            user=user,
            address_line1=adata["address_line1"],
            defaults=adata,
        )

    return admin, created_customers


# ===========================================================================
# 2. Categories
# ===========================================================================

def seed_categories():
    print("\n[Categories]")

    top_cats = [
        ("Formal Wear",      "formal-wear",      "Elegant formal clothing for all occasions"),
        ("Casual Wear",      "casual-wear",       "Comfortable everyday styles"),
        ("Party Wear",       "party-wear",        "Glam outfits for every celebration"),
        ("Winter Collection","winter-collection", "Warm and cozy winter essentials"),
    ]

    parent_map = {}
    for name, slug, desc in top_cats:
        cat, _ = Category.objects.get_or_create(
            slug=slug,
            defaults=dict(name=name, description=desc, is_active=True, sort_order=0),
        )
        parent_map[slug] = cat
        log(f"Category: {name}")

    sub_cats = [
        ("Kurtas",        "kurtas",        "formal-wear",       "Traditional kurtas for women"),
        ("Shalwar Kameez","shalwar-kameez","formal-wear",       "Classic Pakistani shalwar kameez"),
        ("Tops",          "tops",          "casual-wear",       "Stylish casual tops"),
        ("Jeans & Pants", "jeans-pants",   "casual-wear",       "Everyday bottoms"),
        ("Maxi Dresses",  "maxi-dresses",  "party-wear",        "Floor-length evening gowns"),
        ("Lehenga",       "lehenga",       "party-wear",        "Bridal and party lehengas"),
        ("Shawls",        "shawls",        "winter-collection", "Warm woollen shawls"),
        ("Sweaters",      "sweaters",      "winter-collection", "Knitted sweaters and cardigans"),
    ]

    sub_map = {}
    for i, (name, slug, parent_slug, desc) in enumerate(sub_cats):
        sub, _ = Category.objects.get_or_create(
            slug=slug,
            defaults=dict(
                name=name,
                description=desc,
                parent=parent_map[parent_slug],
                is_active=True,
                sort_order=i,
            ),
        )
        sub_map[slug] = sub
        log(f"  Sub-category: {name}")

    return parent_map, sub_map


# ===========================================================================
# 3. Brands
# ===========================================================================

def seed_brands():
    print("\n[Brands]")

    brands_data = [
        ("Sapphire",  "sapphire",  "Pakistan's leading women's fashion brand"),
        ("Khaadi",    "khaadi",    "Premium hand-crafted ethnic wear"),
        ("Zara (PK)", "zara-pk",   "Contemporary Pakistani fashion house"),
    ]
    brand_map = {}
    for name, slug, desc in brands_data:
        b, _ = Brand.objects.get_or_create(
            slug=slug, defaults=dict(name=name, description=desc, is_active=True)
        )
        brand_map[slug] = b
        log(f"Brand: {name}")
    return brand_map


# ===========================================================================
# 4. Colors & Sizes
# ===========================================================================

def seed_colors_sizes():
    print("\n[Colors & Sizes]")

    colors_data = [
        ("Black",      "#000000"),
        ("White",      "#FFFFFF"),
        ("Navy Blue",  "#1B2A6B"),
        ("Maroon",     "#800000"),
        ("Emerald",    "#50C878"),
        ("Mustard",    "#FFDB58"),
        ("Rose Pink",  "#FF66B2"),
        ("Ivory",      "#FFFFF0"),
    ]
    color_map = {}
    for name, hex_code in colors_data:
        c, _ = Color.objects.get_or_create(
            name=name, defaults=dict(hex_code=hex_code)
        )
        color_map[name] = c
    log(f"Colors: {len(colors_data)} created")

    sizes_data = [
        ("XS",  "clothing", 0),
        ("S",   "clothing", 1),
        ("M",   "clothing", 2),
        ("L",   "clothing", 3),
        ("XL",  "clothing", 4),
        ("XXL", "clothing", 5),
    ]
    size_map = {}
    for name, size_type, order in sizes_data:
        s, _ = Size.objects.get_or_create(
            name=name, size_type=size_type, defaults=dict(sort_order=order)
        )
        size_map[name] = s
    log(f"Sizes: {len(sizes_data)} created")

    return color_map, size_map


# ===========================================================================
# 5. Products
# ===========================================================================

PRODUCTS = [
    # (name, category_slug, brand_slug, base_price, sale_price, featured, new, bestseller, tags)
    ("Embroidered Lawn Kurta",      "kurtas",        "sapphire", 3500, 2799, True,  True,  False, "lawn,embroidery,summer"),
    ("Printed Cotton Kurta",        "kurtas",        "khaadi",   2800, None, False, True,  True,  "cotton,printed,casual"),
    ("Classic White Shalwar Kameez","shalwar-kameez","khaadi",   4200, 3499, True,  False, True,  "formal,white,classic"),
    ("Bridal Embroidered Suit",     "shalwar-kameez","sapphire", 8500, 6999, True,  False, False, "bridal,embroidery,formal"),
    ("Striped Casual Top",          "tops",          "zara-pk",  1800, None, False, True,  False, "casual,stripes,everyday"),
    ("Floral Chiffon Blouse",       "tops",          "sapphire", 2200, 1799, False, True,  True,  "chiffon,floral,feminine"),
    ("High-Waist Trousers",         "jeans-pants",   "zara-pk",  3200, 2799, False, False, True,  "trousers,formal,office"),
    ("Denim Straight Jeans",        "jeans-pants",   "zara-pk",  4500, 3999, True,  True,  False, "denim,jeans,casual"),
    ("Velvet Maxi Gown",            "maxi-dresses",  "sapphire", 9500, 7999, True,  True,  False, "velvet,maxi,party,gown"),
    ("Chiffon Maxi Dress",          "maxi-dresses",  "khaadi",   6800, 5499, False, False, True,  "chiffon,maxi,elegant"),
    ("Bridal Lehenga Set",          "lehenga",       "sapphire",18000,14999, True,  False, True,  "bridal,lehenga,luxury,wedding"),
    ("Party Lehenga Choli",         "lehenga",       "khaadi",  12000, 9999, True,  True,  False, "party,lehenga,festive"),
    ("Pashmina Shawl",              "shawls",        "khaadi",   3800, None, False, False, True,  "pashmina,warm,winter,shawl"),
    ("Embroidered Wool Shawl",      "shawls",        "sapphire", 4500, 3999, True,  True,  False, "wool,embroidery,winter"),
    ("Cable-Knit Sweater",          "sweaters",      "zara-pk",  3500, 2999, False, True,  False, "knit,sweater,cozy,winter"),
    ("Cashmere Cardigan",           "sweaters",      "khaadi",   6500, 5499, True,  False, True,  "cashmere,cardigan,luxury,winter"),
    ("Organza Formal Suit",         "shalwar-kameez","sapphire", 7200, 5999, True,  True,  False, "organza,formal,wedding"),
    ("Lawn Printed Suit",           "shalwar-kameez","khaadi",   2500, None, False, True,  True,  "lawn,printed,summer"),
    ("Crinkle Chiffon Kurta",       "kurtas",        "zara-pk",  3100, 2499, False, False, True,  "chiffon,crinkle,festive"),
    ("Silk Blend Kurta",            "kurtas",        "sapphire", 5500, 4499, True,  True,  False, "silk,luxury,formal"),
    ("Cropped Denim Jacket",        "tops",          "zara-pk",  4200, 3699, False, True,  False, "denim,jacket,casual"),
    ("Peplum Party Top",            "tops",          "sapphire", 2900, 2399, True,  False, True,  "peplum,party,elegant"),
    ("Woollen Cape Shawl",          "shawls",        "zara-pk",  3200, 2799, False, True,  False, "cape,woollen,winter"),
    ("Turtleneck Knit Sweater",     "sweaters",      "zara-pk",  4100, 3499, True,  True,  True,  "turtleneck,winter,knit"),
]


def seed_products(sub_map, brand_map, color_map, size_map):
    print("\n[Products]")
    products = []

    for i, (name, cat_slug, brand_slug, base, sale, featured, new, best, tags) in enumerate(PRODUCTS):
        prod, _ = Product.objects.get_or_create(
            name=name,
            defaults=dict(
                category=sub_map.get(cat_slug),
                brand=brand_map.get(brand_slug),
                base_price=Decimal(str(base)),
                sale_price=Decimal(str(sale)) if sale else None,
                short_description=f"Premium quality {name.lower()} — crafted for the modern Pakistani woman.",
                description=(
                    f"{name} is a carefully curated piece that blends traditional craftsmanship "
                    f"with contemporary design. Made from high-quality fabric, it's perfect for "
                    f"everyday elegance or special occasions. Machine washable and colour-fast."
                ),
                tags=tags,
                is_featured=featured,
                is_new_arrival=new,
                is_bestseller=best,
                is_active=True,
                meta_title=f"Buy {name} Online in Pakistan | BuyLadies",
                meta_description=f"Shop {name} at BuyLadies. Premium quality, fast shipping across Pakistan.",
            ),
        )

        # Create variants (colours × sizes) with realistic stock
        colors_to_use = list(color_map.values())[:3]   # first 3 colors per product
        sizes_to_use  = ["S", "M", "L", "XL"]

        for color in colors_to_use:
            for size_name in sizes_to_use:
                size = size_map[size_name]
                sku = f"BL-{prod.pk.hex[:6].upper()}-{color.name[:3].upper()}-{size_name}"
                ProductVariant.objects.get_or_create(
                    product=prod,
                    color=color,
                    size=size,
                    defaults=dict(
                        sku=sku,
                        stock_quantity=max(5, (i % 5 + 1) * 10),
                        is_active=True,
                    ),
                )

        products.append(prod)
        log(f"Product: {name}")

    return products


# ===========================================================================
# 6. Coupons
# ===========================================================================

def seed_coupons():
    print("\n[Coupons]")

    coupons_data = [
        {
            "code": "WELCOME10",
            "description": "10% off for new customers (max PKR 500)",
            "discount_type": "percentage",
            "discount_value": Decimal("10"),
            "min_order_amount": Decimal("1000"),
            "max_discount_amount": Decimal("500"),
            "max_uses": 1000,
            "valid_from": timezone.now(),
            "valid_until": timezone.now() + timedelta(days=365),
            "is_active": True,
        },
        {
            "code": "FLAT200",
            "description": "Flat PKR 200 off on orders above PKR 2,000",
            "discount_type": "fixed",
            "discount_value": Decimal("200"),
            "min_order_amount": Decimal("2000"),
            "max_discount_amount": None,
            "max_uses": 500,
            "valid_from": timezone.now(),
            "valid_until": timezone.now() + timedelta(days=180),
            "is_active": True,
        },
        {
            "code": "SALE15",
            "description": "15% off sitewide — limited time",
            "discount_type": "percentage",
            "discount_value": Decimal("15"),
            "min_order_amount": Decimal("3000"),
            "max_discount_amount": Decimal("1000"),
            "max_uses": 200,
            "valid_from": timezone.now(),
            "valid_until": timezone.now() + timedelta(days=30),
            "is_active": True,
        },
    ]

    for data in coupons_data:
        c, _ = Coupon.objects.get_or_create(code=data["code"], defaults=data)
        log(f"Coupon: {c.code} ({c.discount_type}: {c.discount_value})")


# ===========================================================================
# 7. Banners
# ===========================================================================

def seed_banners():
    print("\n[Banners]")

    banners_data = [
        {
            "title": "Spring / Summer 2025",
            "subtitle": "Discover premium ladies fashion — from elegant formals to casual chic",
            "cta_text": "Shop Now",
            "cta_url": "/products",
            "position": "hero",
            "sort_order": 0,
            "is_active": True,
        },
        {
            "title": "New Arrivals",
            "subtitle": "Fresh styles added every week — be the first to shop",
            "cta_text": "View New Arrivals",
            "cta_url": "/products?is_new_arrival=true",
            "position": "hero",
            "sort_order": 1,
            "is_active": True,
        },
        {
            "title": "Winter Sale — Up to 30% Off",
            "subtitle": "Warm up your wardrobe without burning your wallet",
            "cta_text": "Shop Sale",
            "cta_url": "/products?on_sale=true",
            "position": "promo",
            "sort_order": 0,
            "is_active": True,
        },
        {
            "title": "Bridal Collection 2025",
            "subtitle": "Exquisite bridal wear for your special day",
            "cta_text": "Explore",
            "cta_url": "/products?category=lehenga",
            "position": "category",
            "sort_order": 0,
            "is_active": True,
        },
    ]

    for data in banners_data:
        b, _ = Banner.objects.get_or_create(
            title=data["title"], position=data["position"], defaults=data
        )
        log(f"Banner: {b.title} [{b.position}]")


# ===========================================================================
# 8. Reviews (sample)
# ===========================================================================

def seed_reviews(products, customers):
    print("\n[Reviews]")

    review_templates = [
        (5, "Absolutely stunning!", "The quality is beyond expectations. Fabric is luxurious and the fitting is perfect. Will definitely buy again!"),
        (4, "Very good purchase",    "Great product overall. Delivery was fast and packaging was excellent. Slight colour difference from photos but still beautiful."),
        (5, "Highly recommend",      "My go-to brand for Pakistani fashion. This piece is no exception — beautiful embroidery and comfortable fabric."),
        (3, "Good but expected more","The product is decent for the price. Quality is acceptable but I expected the fabric to be a bit thicker."),
        (4, "Loved the fitting",     "Perfect fit! I usually have trouble finding my size but this was spot on. The colour is exactly as shown."),
    ]

    count = 0
    for i, product in enumerate(products[:10]):  # review first 10 products
        customer = customers[i % len(customers)]
        template = review_templates[i % len(review_templates)]

        _, created = Review.objects.get_or_create(
            product=product,
            user=customer,
            defaults=dict(
                rating=template[0],
                title=template[1],
                body=template[2],
                is_approved=True,
                is_verified_purchase=True,
            ),
        )
        if created:
            count += 1

    log(f"{count} reviews seeded")


# ===========================================================================
# 9. Sample Orders
# ===========================================================================

def seed_orders(products, customers):
    print("\n[Orders]")

    if not products or not customers:
        return

    customer = customers[0]
    variant = (
        products[0].variants.filter(is_active=True, stock_quantity__gte=2).first()
    )
    if not variant:
        log("No variant available for sample order — skipping")
        return

    order, created = Order.objects.get_or_create(
        user=customer,
        coupon_code="",
        payment_method="cod",
        subtotal=Decimal("3998"),
        defaults=dict(
            status="delivered",
            payment_status="paid",
            discount_amount=Decimal("0"),
            shipping_cost=Decimal("0"),
            total_amount=Decimal("3998"),
            shipping_full_name=f"{customer.first_name} {customer.last_name}",
            shipping_phone=customer.phone or "0300-0000000",
            shipping_address_line1="House 12, Street 4",
            shipping_city="Lahore",
            shipping_state="Punjab",
            shipping_postal_code="54000",
            tracking_number="TRK123456789PK",
        ),
    )

    if created:
        OrderItem.objects.create(
            order=order,
            variant=variant,
            product_name=variant.product.name,
            variant_info=f"{variant.color.name if variant.color else ''} / {variant.size.name if variant.size else ''}",
            quantity=2,
            unit_price=variant.price,
            total_price=variant.price * 2,
        )
        log(f"Sample order: {order.order_number} for {customer.email}")
    else:
        log("Sample order already exists — skipped")


# ===========================================================================
# Main
# ===========================================================================

def run():
    print("=" * 60)
    print("  BuyLadies — Seed Data Script")
    print("=" * 60)

    admin, customers = seed_users()
    parent_map, sub_map   = seed_categories()
    brand_map              = seed_brands()
    color_map, size_map    = seed_colors_sizes()
    products               = seed_products(sub_map, brand_map, color_map, size_map)
    seed_coupons()
    seed_banners()
    seed_reviews(products, customers)
    seed_orders(products, customers)

    print("\n" + "=" * 60)
    print("  Seed complete!")
    print(f"  Users:     {len(customers) + 1} (1 admin + {len(customers)} customers)")
    print(f"  Products:  {len(products)}")
    print(f"  Coupons:   3")
    print(f"  Banners:   4")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    run()
