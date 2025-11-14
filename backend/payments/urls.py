from django.urls import path
from .views import CreateMoMoPayment, momo_ipn_listener

urlpatterns = [
    path('create-momo/', CreateMoMoPayment.as_view(), name='create_momo_payment'),
    path('momo-ipn/', momo_ipn_listener, name='momo_ipn_listener'),
]