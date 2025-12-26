from django.urls import path
from . import views

urlpatterns = [
    # Example: API endpoints
    path('profiles/', views.ProfileList.as_view(), name='profile-list'),
    path('services/', views.ServiceList.as_view(), name='service-list'),
    path('bookings/', views.BookingList.as_view(), name='booking-list'),
]
