from rest_framework import generics, permissions
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile
from .serializers import ProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Profile
from .serializers import ProfileSerializer

from .models import (
    Profile, Service, Booking, Review, Report, Payment, Availability,
    Favorite, Message, Verification, LocationLog, Notification, SystemSetting
)
from .serializers import (
    UserSerializer, ProfileSerializer, ServiceSerializer, BookingSerializer, ReviewSerializer,
    ReportSerializer, PaymentSerializer, AvailabilitySerializer,
    FavoriteSerializer, MessageSerializer, VerificationSerializer, LocationLogSerializer,
    SystemSettingSerializer
)

# -------------------- HOME --------------------
def home(request):
    return HttpResponse("Welcome to the API Home!")

# -------------------- Profiles --------------------
class ProfileList(generics.ListAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from django.utils import timezone
        from django.db.models import Q
        
        # Get exact atomic time
        now = timezone.localtime() if timezone.is_aware(timezone.now()) else timezone.now()
        current_date = now.date()
        current_time = now.time()

        # Automatic Expiry of Availability (Strong Database Backend Logic)
        Availability.objects.filter(
            is_active=True
        ).filter(
            Q(date__lt=current_date) | 
            Q(date=current_date, end_time__lt=current_time)
        ).update(is_active=False)

        return Profile.objects.all()

class ProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        from django.utils import timezone
        from django.db.models import Q
        now = timezone.localtime() if timezone.is_aware(timezone.now()) else timezone.now()
        Availability.objects.filter(
            is_active=True
        ).filter(
            Q(date__lt=now.date()) | 
            Q(date=now.date(), end_time__lt=now.time())
        ).update(is_active=False)

        return Profile.objects.all()

    def perform_update(self, serializer):
        # Only allow users to update their own profile (or admin)
        profile = self.get_object()
        try:
            user_profile = Profile.objects.get(user=self.request.user)
        except Profile.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("No profile found for this user.")
        if profile.id != user_profile.id and user_profile.role != "admin":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own profile.")
        serializer.save()

# -------------------- Services --------------------
class ServiceList(generics.ListCreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        from django.utils import timezone
        from django.db.models import Q
        
        # Get exact atomic time
        now = timezone.localtime() if timezone.is_aware(timezone.now()) else timezone.now()
        current_date = now.date()
        current_time = now.time()

        # 1. Automatic Expiry of Availability (Strong Database Backend Logic)
        Availability.objects.filter(
            is_active=True
        ).filter(
            Q(date__lt=current_date) | 
            Q(date=current_date, end_time__lt=current_time)
        ).update(is_active=False)

        return Service.objects.filter(is_active=True).distinct()

class ServiceDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

# ... existing imports ...

# -------------------- Bookings --------------------
class BookingList(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)

        if profile.role == "client":
            return Booking.objects.filter(client=profile)

        if profile.role == "provider":
            return Booking.objects.filter(service__provider=profile)

        return Booking.objects.all()

    def perform_create(self, serializer):
        profile = Profile.objects.get(user=self.request.user)
        # Ensure client is attached automatically if not provided or override it
        service = serializer.validated_data.get('service')
        start_time = serializer.validated_data.get('booking_date')
        end_time = serializer.validated_data.get('end_time')

        if not start_time or not end_time:
            raise ValidationError({"error": "Both booking_date and end_time are required."})

        if end_time <= start_time:
            raise ValidationError({"error": "end_time must be after booking_date."})

        # Check for overlapping bookings for this provider
        # Overlap condition:
        # (New Start < Existing End) AND (New End > Existing Start)
        overlapping_bookings = Booking.objects.filter(
            service__provider=service.provider,
            status__in=['pending', 'confirmed']
        ).filter(
            booking_date__lt=end_time,
            end_time__gt=start_time
        )

        if overlapping_bookings.exists():
            # Format time for the error message
            start_str = start_time.strftime("%I:%M %p")
            end_str = end_time.strftime("%I:%M %p")
            raise ValidationError(
                {"error": f"This provider is already booked from {start_str} to {end_str}. Please choose another time or book for a later date."}
            )

        serializer.save(client=profile)

class BookingDetail(generics.RetrieveUpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        # Store original status before saving
        original_booking = self.get_object()
        original_status = original_booking.status
        
        # Save the updated booking
        updated_booking = serializer.save()
        new_status = updated_booking.status

        # If status changed, notify the client
        if original_status != new_status:
            service_name = updated_booking.service.name
            provider_name = updated_booking.service.provider.user.username

            if new_status == 'canceled':
                Notification.objects.create(
                    recipient=updated_booking.client,
                    title="Booking Canceled",
                    message=f"Your booking for '{service_name}' with {provider_name} has been canceled."
                )
            elif new_status == 'confirmed':
                Notification.objects.create(
                    recipient=updated_booking.client,
                    title="Booking Confirmed",
                    message=f"Your booking for '{service_name}' with {provider_name} is confirmed!"
                )
            elif new_status == 'completed':
                Notification.objects.create(
                    recipient=updated_booking.client,
                    title="Service Completed",
                    message=f"Your session for '{service_name}' is complete. Please leave a review!"
                )
                from django.utils import timezone
                Payment.objects.update_or_create(
                    booking=updated_booking,
                    defaults={
                        'amount': updated_booking.service.price,
                        'method': 'cash',
                        'status': 'completed',
                        'paid_at': timezone.now()
                    }
                )

# -------------------- Reviews --------------------
class ReviewList(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        profile = Profile.objects.get(user=self.request.user)
        booking = serializer.validated_data.get('booking')
        
        # Only the client who booked can leave a review
        if booking.client != profile:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only review your own bookings.")
        
        # The booking must be completed
        if booking.status != 'completed':
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You can only review completed bookings.")
            
        # Check if review already exists
        if hasattr(booking, 'review'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError("A review already exists for this booking.")

        serializer.save()

class ReviewDetail(generics.RetrieveDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAdminUser]

# -------------------- Reports (Safety Alerts) --------------------
class ReportList(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        # Admins can see all reports; normal users only see the ones they created
        if profile.role == "admin" or self.request.user.is_staff:
            return Report.objects.all()
        return Report.objects.filter(reporter=profile)

class ReportDetail(generics.RetrieveUpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    # Only admins should change report status / notes
    permission_classes = [permissions.IsAdminUser]

# -------------------- Payments --------------------
class PaymentList(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

class PaymentDetail(generics.RetrieveUpdateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

# -------------------- Availability --------------------
class AvailabilityList(generics.ListCreateAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        return Availability.objects.filter(provider=profile)

class AvailabilityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

# -------------------- Favorites --------------------
class FavoriteList(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        return Favorite.objects.filter(client=profile)

class FavoriteDetail(generics.RetrieveDestroyAPIView):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer

# -------------------- Messages --------------------
class MessageList(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        return Message.objects.filter(sender=profile) | Message.objects.filter(receiver=profile)

class MessageDetail(generics.RetrieveAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

# -------------------- Verifications --------------------
class VerificationList(generics.ListCreateAPIView):
    serializer_class = VerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        return Verification.objects.filter(profile=profile)

class VerificationDetail(generics.RetrieveAPIView):
    queryset = Verification.objects.all()
    serializer_class = VerificationSerializer

# -------------------- Location Logs --------------------
class LocationLogList(generics.ListCreateAPIView):
    serializer_class = LocationLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        return LocationLog.objects.filter(profile=profile).order_by("-logged_at")

    def perform_create(self, serializer):
        # Always bind logs to the authenticated user (ignore any submitted profile_id)
        profile = Profile.objects.get(user=self.request.user)
        serializer.save(profile=profile)

class LocationLogDetail(generics.RetrieveAPIView):
    queryset = LocationLog.objects.all()
    serializer_class = LocationLogSerializer
    permission_classes = [permissions.IsAuthenticated]

# -------------------- Admin Location Logs --------------------
class AdminLocationList(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.is_staff or request.user.is_superuser:
            pass # allow
        else:
            try:
                profile = Profile.objects.get(user=request.user)
                if profile.role != 'admin':
                    return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            except Profile.DoesNotExist:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        locations = []
        # Get active providers
        providers = Profile.objects.filter(role='provider', is_suspended=False)
        
        for provider in providers:
            # Get their most recent location
            latest_log = provider.locations.order_by('-logged_at').first()
            if latest_log:
                locations.append({
                    'id': provider.user.id,
                    'username': provider.user.username,
                    'is_verified': provider.is_verified,
                    'latitude': float(latest_log.latitude),
                    'longitude': float(latest_log.longitude),
                    'logged_at': latest_log.logged_at
                })
                
        return Response(locations)


# -------------------- Alert summary (for real-time-like alerts) --------------------
class AlertSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.get(user=request.user)

        # For providers, show bookings tied to their services
        if profile.role == "provider":
            bookings_qs = Booking.objects.filter(service__provider=profile)
        else:
            bookings_qs = Booking.objects.filter(client=profile)

        upcoming = bookings_qs.filter(status__in=["pending", "confirmed"])
        completed = bookings_qs.filter(status="completed")

        # Safety reports this profile has sent
        reports_qs = Report.objects.filter(reporter=profile)
        unresolved_reports = reports_qs.exclude(status__in=["resolved", "rejected"])

        latest_booking = bookings_qs.order_by("-created_at").first()
        latest_report = reports_qs.order_by("-created_at").first()

        return Response(
            {
                "upcoming_bookings": upcoming.count(),
                "completed_bookings": completed.count(),
                "unresolved_reports": unresolved_reports.count(),
                "latest_booking_created_at": getattr(
                    latest_booking, "created_at", None
                ),
                "latest_report_created_at": getattr(latest_report, "created_at", None),
            }
        )


class AlertPanelView(APIView):
    """
    Detailed alerts & reviews data for the provider dashboard Alerts tab.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.get(user=request.user)

        # Reports this user has created
        sent_reports = Report.objects.filter(reporter=profile).order_by("-created_at")

        # Reports where this user was reported
        received_reports = Report.objects.filter(reported_user=profile).order_by(
            "-created_at"
        )

        # Reviews about this provider (based on bookings of their services)
        reviews = Review.objects.filter(
            booking__service__provider=profile
        ).order_by("-created_at")

        # Reviews posted BY this user
        posted_reviews = Review.objects.filter(
            booking__client=profile
        ).order_by("-created_at")

        return Response(
            {
                "sent_reports": ReportSerializer(sent_reports, many=True).data,
                "received_reports": ReportSerializer(received_reports, many=True).data,
                "reviews": ReviewSerializer(reviews, many=True).data,
                "posted_reviews": ReviewSerializer(posted_reviews, many=True).data,
            }
        )


class ReportTargetsView(APIView):
    """
    Return a list of clients that a provider has interacted with via bookings,
    so the provider can pick a user to report from the Alerts tab.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.get(user=request.user)

        qs = (
            Booking.objects.filter(service__provider=profile)
            .select_related("client__user")
            .order_by("-created_at")
        )

        seen = set()
        targets = []
        for b in qs:
            if not b.client_id or b.client_id in seen:
                continue
            seen.add(b.client_id)
            targets.append(
                {
                    "client": ProfileSerializer(b.client).data,
                    "latest_booking_id": b.id,
                    "latest_booking_created_at": b.created_at,
                }
            )

        return Response({"targets": targets})


class RegisterView(APIView):
    # This line tells Django: "Don't look for a JWT or Session token here"
    authentication_classes = [] 
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": serializer.data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        # This will print errors to your terminal if the data is invalid
        print(serializer.errors) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class LoginView(APIView):
    
    authentication_classes = [] 
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            # Using get_or_create to avoid crashes if a profile is missing
            profile, created = Profile.objects.get_or_create(user=user)

            # If this is a Django admin / staff user, always mark profile as 'admin'
            if (user.is_superuser or user.is_staff) and profile.role != "admin":
                profile.role = "admin"
                profile.save()

            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': profile.role,
                    'profile_id': profile.id,
                },
            })
        
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    

class AdminPendingKYCView(APIView):
    permission_classes = [permissions.IsAdminUser] # Only Admin/123 can access

    def get(self, request):
        # We only want users who are NOT verified and are NOT admins
        pending_profiles = Profile.objects.filter(is_verified=False).exclude(role='admin')
        serializer = ProfileSerializer(pending_profiles, many=True)
        return Response(serializer.data)

# 2. View to Approve or Reject a user
class AdminVerifyUserView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            profile = Profile.objects.get(pk=pk)
            action = request.data.get('action') # 'approve', 'reject', 'suspend', 'unsuspend'

            if action == 'approve':
                profile.is_verified = True
                profile.save()
                return Response({'message': f'User {profile.user.username} verified successfully.'})
            
            elif action == 'reject':
                # You could also delete the kyc_id here if you want them to re-upload
                profile.kyc_id = None 
                profile.save()
                return Response({'message': 'Verification rejected.'})

            elif action == 'suspend':
                profile.is_suspended = True
                profile.save()
                return Response({'message': f'User {profile.user.username} suspended.'})

            elif action == 'unsuspend':
                profile.is_suspended = False
                profile.save()
                return Response({'message': f'User {profile.user.username} unsuspended.'})

        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


# -------------------- System Settings --------------------
class SystemSettingList(generics.ListCreateAPIView):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    # Usually you want IsAdminUser but for ease of checking we'll just require authentication,
    # or you can restrict strictly:
    permission_classes = [permissions.IsAuthenticated]

    # If you want to allow lookups by key instead of ID:
    def get_queryset(self):
        qs = super().get_queryset()
        key = self.request.query_params.get('key')
        if key:
            qs = qs.filter(key=key)
        return qs


class SystemSettingDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Optionally allow lookup by 'key'
    lookup_field = 'key'