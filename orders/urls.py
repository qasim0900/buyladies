from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order_list'),
    path('create/', views.CreateOrderView.as_view(), name='create_order'),
    path('<uuid:pk>/', views.OrderDetailView.as_view(), name='order_detail'),
    path('<uuid:pk>/cancel/', views.CancelOrderView.as_view(), name='cancel_order'),
]
