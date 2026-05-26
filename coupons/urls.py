from django.urls import path
from . import views

urlpatterns = [
    path('validate/', views.ValidateCouponView.as_view(), name='coupon_validate'),
]
