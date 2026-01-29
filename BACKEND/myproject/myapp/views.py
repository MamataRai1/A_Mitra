from rest_framework import generics, permissions
from rest_framework.response import Response
from django.http import HttpResponse
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

class ProfileDetail(generics.RetrieveAPIView):
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

class ReviewDetail(generics.RetrieveAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

# -------------------- Reports (Safety Alerts) --------------------
class ReportList(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        return Report.objects.filter(reporter=profile)

class ReportDetail(generics.RetrieveAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

# -------------------- Payments --------------------
class PaymentList(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

class PaymentDetail(generics.RetrieveAPIView):
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
