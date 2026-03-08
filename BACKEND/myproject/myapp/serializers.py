from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, Service, Booking, Review, Report, Payment,
    Availability, Favorite, Message, Verification, LocationLog, SystemSetting
)
from django.db.models import Avg

# -------------------- User Serializer --------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# -------------------- Profile Serializer --------------------
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    availability = serializers.SerializerMethodField()
    booking_status = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'role', 'phone_number', 'address',
            'bio', 'skills',
            'profile_pic', 'kyc_id', 'is_verified',
            'is_suspended', 'trust_score', 'created_at', 'availability', 'booking_status'
        ]

    def get_booking_status(self, obj):
        if obj.role != 'provider':
            return "offline"

        from django.utils import timezone
        now = timezone.localtime() if timezone.is_aware(timezone.now()) else timezone.now()

        # Check if currently booked
        from .models import Booking
        is_booked = Booking.objects.filter(
            service__provider=obj,
            status__in=['pending', 'confirmed'],
            booking_date__lte=now,
            end_time__gt=now
        ).exists()

        if is_booked:
            return "booked"

        # Check if currently available (on the clock)
        current_date = now.date()
        current_time = now.time()
        
        from .models import Availability
        is_available = Availability.objects.filter(
            provider=obj,
            is_active=True,
            date=current_date,
            start_time__lte=current_time,
            end_time__gte=current_time
        ).exists()

        if is_available:
            return "available"

        return "offline"

    def get_availability(self, obj):
        from django.utils import timezone
        import datetime
        
        # Determine the current local time safely
        now = timezone.localtime() if timezone.is_aware(timezone.now()) else timezone.now()

        availabilities = Availability.objects.filter(provider=obj, is_active=True)
        valid_availabilities = []

        for a in availabilities:
            if a.date and a.end_time:
                # Combine date and end_time
                try:
                    dt = datetime.datetime.combine(a.date, a.end_time)
                    end_datetime = timezone.make_aware(dt) if timezone.is_naive(dt) else dt
                    
                    if end_datetime < now:
                        # Time has passed, automatically mark inactive in database
                        a.is_active = False
                        a.save(update_fields=['is_active'])
                        continue
                except Exception as e:
                    print(f"Error checking availability expiration: {e}")
            
            valid_availabilities.append(a)

        return [
            {
                "id": a.id,
                "date": a.date,
                "start_time": a.start_time,
                "end_time": a.end_time,
                "is_active": a.is_active
            } for a in valid_availabilities
        ]


# -------------------- Register Serializer (Updated for KYC) --------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False)
    # Accepting the National ID image file
    kyc_id = serializers.ImageField(write_only=True, required=True)
    profile_pic = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'kyc_id', 'profile_pic']

    def create(self, validated_data):
        try:
            role = validated_data.pop('role', 'client')
            kyc_id = validated_data.pop('kyc_id')
            profile_pic = validated_data.pop('profile_pic', None)
            
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email', ''),
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', '')
            )
            
            Profile.objects.create(
                user=user,
                role=role,
                kyc_id=kyc_id,
                profile_pic=profile_pic,
            )
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
    
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'provider', 'provider_id', 'name', 'description', 
            'price', 'category', 'average_rating', 'review_count', 'reviews',
            'created_at', 'updated_at', 'is_active'
        ]

    def get_average_rating(self, obj):
        # Calculate the average from bookings that have a review
        val = obj.bookings.filter(review__isnull=False).aggregate(avg=Avg('review__rating'))['avg']
        return round(val, 1) if val else 0.0

    def get_review_count(self, obj):
        return obj.bookings.filter(review__isnull=False).count()

    def get_reviews(self, obj):
        # Include a snippet of recent reviews for the detail page
        recent_reviews = Review.objects.filter(booking__service=obj).order_by('-created_at')[:10]
        # Just return simple dicts instead of using circular serializers
        return [
            {
                "id": r.id,
                "rating": r.rating,
                "comment": r.comment,
                "client_name": r.booking.client.user.username or r.booking.client.user.first_name,
                "created_at": r.created_at
            }
            for r in recent_reviews
        ]


# -------------------- Booking Serializer --------------------
class BookingSerializer(serializers.ModelSerializer):
    client = ProfileSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    has_review = serializers.SerializerMethodField()

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
            'booking_date', 'end_time', 'status', 'created_at', 'has_review'
        ]
        read_only_fields = ['id', 'created_at']

    def get_has_review(self, obj):
        return hasattr(obj, 'review')

    def validate_status(self, value):
        allowed_statuses = [choice[0] for choice in Booking.STATUS_CHOICES]
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Invalid status '{value}'. Allowed statuses are: {', '.join(allowed_statuses)}."
            )
        return value


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
    reported_user = ProfileSerializer(read_only=True)

    reporter_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="reporter",
        write_only=True
    )

    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(),
        source="booking",
        write_only=True,
        required=False,
        allow_null=True,
    )

    reported_user_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        source="reported_user",
        write_only=True
    )

    class Meta:
        model = Report
        fields = [
            'id',
            'reporter',
            'reporter_id',
            'reported_user',
            'reported_user_id',
            'booking',
            'booking_id',
            'reason',
            'description',
            'status',
            'admin_note',
            'created_at',
        ]


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
        fields = ['id', 'provider', 'provider_id', 'date', 'start_time', 'end_time', 'is_active']


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


# -------------------- System Setting Serializer --------------------
class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value', 'description', 'updated_at']