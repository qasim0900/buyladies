from django.urls import path
from . import views

urlpatterns = [
    path('<slug:product_slug>/', views.ProductReviewListView.as_view(), name='product_reviews'),
    path('<slug:product_slug>/create/', views.CreateReviewView.as_view(), name='create_review'),
]
