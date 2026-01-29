from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, Service, Booking, Review, Report, Payment,
    Availability, Favorite, Message, Verification, LocationLog
)

# -------------------- User Serializer --------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# -------------------- Profile Serializer --------------------
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'role', 'phone_number', 'address', 'profile_pic', 'created_at']


# -------------------- Service Serializer --------------------
class ServiceSerializer(serializers.ModelSerializer):
    provider = ProfileSerializer(read_only=True)
    provider_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="provider",
        write_only=True
    )

    class Meta:
        model = Service
        fields = ['id', 'provider', 'provider_id', 'name', 'description', 'price', 'created_at', 'updated_at', 'is_active']


# -------------------- Booking Serializer --------------------
class BookingSerializer(serializers.ModelSerializer):
    client = ProfileSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)

    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="client",
        write_only=True
    )

    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        source="service",
        write_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'id', 'client', 'client_id', 'service', 'service_id',
            'booking_date', 'status', 'created_at'
        ]


# -------------------- Review Serializer --------------------
class ReviewSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)

    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(),
        source="booking",
        write_only=True
    )

    class Meta:
        model = Review
        fields = ['id', 'booking', 'booking_id', 'rating', 'comment', 'created_at']


# -------------------- Report Serializer (Red Flag Safety) --------------------
class ReportSerializer(serializers.ModelSerializer):
    reporter = ProfileSerializer(read_only=True)
    booking = BookingSerializer(read_only=True)

    reporter_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="reporter",
        write_only=True
    )

    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(),
        source="booking",
        write_only=True
    )

    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reporter_id', 'booking', 'booking_id', 'reason', 'created_at']


# -------------------- Payment Serializer --------------------
class PaymentSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)

    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(),
        source="booking",
        write_only=True
    )

    class Meta:
        model = Payment
        fields = ['id', 'booking', 'booking_id', 'amount', 'method', 'status', 'paid_at']


# -------------------- Availability Serializer --------------------
class AvailabilitySerializer(serializers.ModelSerializer):
    provider = ProfileSerializer(read_only=True)

    provider_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="provider",
        write_only=True
    )

    class Meta:
        model = Availability
        fields = ['id', 'provider', 'provider_id', 'day', 'start_time', 'end_time']


# -------------------- Favorite Serializer --------------------
class FavoriteSerializer(serializers.ModelSerializer):
    client = ProfileSerializer(read_only=True)
    provider = ProfileSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)

    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="client",
        write_only=True
    )

    provider_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="provider",
        write_only=True,
        required=False
    )

    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        source="service",
        write_only=True,
        required=False
    )

    class Meta:
        model = Favorite
        fields = [
            'id', 'client', 'client_id',
            'provider', 'provider_id',
            'service', 'service_id',
            'created_at'
        ]


# -------------------- Message Serializer (Chat) --------------------
class MessageSerializer(serializers.ModelSerializer):
    sender = ProfileSerializer(read_only=True)
    receiver = ProfileSerializer(read_only=True)

    sender_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="sender",
        write_only=True
    )

    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="receiver",
        write_only=True
    )

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_id', 'receiver', 'receiver_id', 'content', 'created_at', 'read']


# -------------------- Verification Serializer --------------------
class VerificationSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    profile_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="profile",
        write_only=True
    )

    class Meta:
        model = Verification
        fields = [
            'id', 'profile', 'profile_id',
            'verification_type', 'is_verified',
            'created_at', 'verified_at', 'document'
        ]


# -------------------- Location Log Serializer --------------------
class LocationLogSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    profile_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="profile",
        write_only=True
    )

    class Meta:
        model = LocationLog
        fields = ['id', 'profile', 'profile_id', 'latitude', 'longitude', 'logged_at']
