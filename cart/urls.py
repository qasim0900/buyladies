from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('add/', views.AddToCartView.as_view(), name='cart_add'),
    path('items/<uuid:item_id>/update/', views.UpdateCartItemView.as_view(), name='cart_item_update'),
    path('items/<uuid:item_id>/remove/', views.RemoveCartItemView.as_view(), name='cart_item_remove'),
    path('clear/', views.ClearCartView.as_view(), name='cart_clear'),
]
