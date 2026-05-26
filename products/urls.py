from django.urls import path
from . import views

# CRITICAL: Static paths MUST be declared BEFORE <slug:slug>/ pattern.
# Django URL resolution is first-match. If <slug:slug>/ comes first,
# it will intercept 'featured', 'categories', 'brands' etc as product slugs.
urlpatterns = [
    path('', views.ProductListView.as_view(), name='product_list'),
    path('featured/', views.FeaturedProductsView.as_view(), name='featured_products'),
    path('new-arrivals/', views.NewArrivalsView.as_view(), name='new_arrivals'),
    path('best-sellers/', views.BestSellersView.as_view(), name='best_sellers'),
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('brands/', views.BrandListView.as_view(), name='brands'),
    path('colors/', views.ColorListView.as_view(), name='colors'),
    path('sizes/', views.SizeListView.as_view(), name='sizes'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
]
