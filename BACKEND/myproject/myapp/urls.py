from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import RegisterView, LoginView

urlpatterns = [

    path('admin/pending-kyc/', views.AdminPendingKYCView.as_view(), name='admin-pending-kyc'),
    path('admin/verify-user/<int:pk>/', views.AdminVerifyUserView.as_view(), name='admin-verify-user'),

    # -------------------- Profiles --------------------
    path('profiles/', views.ProfileList.as_view(), name='profile-list'),
    path('profiles/<int:pk>/', views.ProfileDetail.as_view(), name='profile-detail'),

    # -------------------- Services --------------------
    path('services/', views.ServiceList.as_view(), name='service-list'),
    path('services/<int:pk>/', views.ServiceDetail.as_view(), name='service-detail'),

    # -------------------- Bookings --------------------
    path('bookings/', views.BookingList.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', views.BookingDetail.as_view(), name='booking-detail'),

    # -------------------- Reviews --------------------
    path('reviews/', views.ReviewList.as_view(), name='review-list'),
    path('reviews/<int:pk>/', views.ReviewDetail.as_view(), name='review-detail'),

    # -------------------- Reports (Safety / Red Flags) --------------------
    path('reports/', views.ReportList.as_view(), name='report-list'),
    path('reports/<int:pk>/', views.ReportDetail.as_view(), name='report-detail'),

    # -------------------- Provider Availability --------------------
    path('availability/', views.AvailabilityList.as_view(), name='availability-list'),
    path('availability/<int:pk>/', views.AvailabilityDetail.as_view(), name='availability-detail'),

    # -------------------- Favorites --------------------
    path('favorites/', views.FavoriteList.as_view(), name='favorite-list'),
    path('favorites/<int:pk>/', views.FavoriteDetail.as_view(), name='favorite-detail'),

    # -------------------- Messages (Chat) --------------------
    path('messages/', views.MessageList.as_view(), name='message-list'),
    path('messages/<int:pk>/', views.MessageDetail.as_view(), name='message-detail'),

    # -------------------- Verifications --------------------
    path('verifications/', views.VerificationList.as_view(), name='verification-list'),
    path('verifications/<int:pk>/', views.VerificationDetail.as_view(), name='verification-detail'),

    # -------------------- Location Tracking --------------------
    path('locations/', views.LocationLogList.as_view(), name='locationlog-list'),
    path('locations/<int:pk>/', views.LocationLogDetail.as_view(), name='locationlog-detail'),
    path('admin/locations/', views.AdminLocationList.as_view(), name='admin-locations-list'),

    # -------------------- Alerts --------------------
    path('alerts/summary/', views.AlertSummaryView.as_view(), name='alert-summary'),
    path('alerts/panel/', views.AlertPanelView.as_view(), name='alert-panel'),
    path('alerts/report-targets/', views.ReportTargetsView.as_view(), name='alert-report-targets'),

    # -------------------- Settings --------------------
    path('settings/', views.SystemSettingList.as_view(), name='setting-list'),
    path('settings/<str:key>/', views.SystemSettingDetail.as_view(), name='setting-detail'),

    # -------------------- API Home --------------------
    path('', views.home, name='api-home'),

    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
