from django.urls import path
from . import views

urlpatterns = [
    # Profiles
    path('profiles/', views.ProfileList.as_view(), name='profile-list'),
    path('profiles/<int:pk>/', views.ProfileDetail.as_view(), name='profile-detail'),

    # Services
    path('services/', views.ServiceList.as_view(), name='service-list'),
    path('services/<int:pk>/', views.ServiceDetail.as_view(), name='service-detail'),

    # Bookings
    path('bookings/', views.BookingList.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', views.BookingDetail.as_view(), name='booking-detail'),

    # Reviews
    path('reviews/', views.ReviewList.as_view(), name='review-list'),
    path('reviews/<int:pk>/', views.ReviewDetail.as_view(), name='review-detail'),

    # Reports
    path('reports/', views.ReportList.as_view(), name='report-list'),
    path('reports/<int:pk>/', views.ReportDetail.as_view(), name='report-detail'),
]
