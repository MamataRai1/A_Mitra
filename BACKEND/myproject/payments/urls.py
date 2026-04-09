from django.urls import path
from .views import initiate_payment, verify_payment, get_all_payments

urlpatterns = [
    path('', get_all_payments),
    path('initiate/', initiate_payment),
    path('verify/', verify_payment),
]
