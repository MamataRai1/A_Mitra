from rest_framework import generics, permissions
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
    Favorite, Message, Verification, LocationLog
)
from .serializers import (
    ProfileSerializer, ServiceSerializer, BookingSerializer, ReviewSerializer,
    ReportSerializer, PaymentSerializer, AvailabilitySerializer,
    FavoriteSerializer, MessageSerializer, VerificationSerializer, LocationLogSerializer
)

# -------------------- HOME --------------------
def home(request):
    return HttpResponse("Welcome to the API Home!")

# -------------------- Profiles --------------------
class ProfileList(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProfileDetail(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

# -------------------- Services --------------------
class ServiceList(generics.ListCreateAPIView):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

class ServiceDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

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

class BookingDetail(generics.RetrieveUpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

# -------------------- Reviews --------------------
class ReviewList(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        return LocationLog.objects.filter(profile=profile)

class LocationLogDetail(generics.RetrieveAPIView):
    queryset = LocationLog.objects.all()
    serializer_class = LocationLogSerializer


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