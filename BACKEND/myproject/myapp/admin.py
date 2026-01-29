from django.contrib import admin
from .models import (
    Profile, Verification, Service, Booking, Review,
    Report, LocationLog, Payment, Availability,
    Favorite, Message
)

# -------------------- Profile Admin --------------------
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "phone_number", "created_at")
    list_filter = ("role", "created_at")
    search_fields = ("user__username", "phone_number")


# -------------------- Verification Admin --------------------
@admin.register(Verification)
class VerificationAdmin(admin.ModelAdmin):
    list_display = ("profile", "verification_type", "is_verified", "created_at")
    list_filter = ("verification_type", "is_verified")
    search_fields = ("profile__user__username",)


# -------------------- Service Admin --------------------
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "provider", "price", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "provider__user__username")


# -------------------- Booking Admin --------------------
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("service", "client", "status", "booking_date", "created_at")
    list_filter = ("status", "booking_date")
    search_fields = ("client__user__username", "service__name")


# -------------------- Review Admin --------------------
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("booking", "rating", "created_at")
    list_filter = ("rating",)


# -------------------- Report Admin (Red Flags 🚨) --------------------
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("reporter", "booking", "created_at")
    search_fields = ("reporter__user__username", "reason")
    list_filter = ("created_at",)


# -------------------- Location Tracking Admin --------------------
@admin.register(LocationLog)
class LocationLogAdmin(admin.ModelAdmin):
    list_display = ("profile", "latitude", "longitude", "logged_at")
    list_filter = ("logged_at",)


# -------------------- Payment Admin --------------------
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("booking", "amount", "method", "status", "paid_at")
    list_filter = ("method", "status")


# -------------------- Availability Admin --------------------
@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("provider", "day", "start_time", "end_time")


# -------------------- Favorites Admin --------------------
@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("client", "provider", "service", "created_at")


# -------------------- Messages Admin --------------------
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "created_at", "read")
    list_filter = ("read",)
