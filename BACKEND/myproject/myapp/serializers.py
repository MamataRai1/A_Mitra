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
        fields = [
            'id', 'user', 'role', 'phone_number', 'address', 
            'profile_pic', 'kyc_id', 'is_verified', 
            'is_suspended', 'trust_score', 'created_at'
        ]


# -------------------- Register Serializer (Updated for KYC) --------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False)
    # Accepting the National ID image file
    kyc_id = serializers.ImageField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'kyc_id']

    def create(self, validated_data):
        try:
            role = validated_data.pop('role', 'client')
            kyc_id = validated_data.pop('kyc_id')
            
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email', ''),
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', '')
            )
            
            Profile.objects.create(user=user, role=role, kyc_id=kyc_id)
            return user
        except Exception as e:
            print(f"DEBUG ERROR: {e}") # Check your VS Code / Terminal for this!
            raise serializers.ValidationError(str(e))

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