from django.urls import path
from .views import CreateMoMoPayment, momo_ipn_listener

urlpatterns = [
    # URL để frontend gọi và tạo yêu cầu thanh toán
    path('create-momo/', CreateMoMoPayment.as_view(), name='create_momo_payment'),

    # URL để MoMo gọi lại (IPN)
    path('momo-ipn/', momo_ipn_listener, name='momo_ipn_listener'),
]