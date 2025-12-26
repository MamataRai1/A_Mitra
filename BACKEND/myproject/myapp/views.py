from rest_framework import generics
from .models import Profile, Service, Booking, Review, Report
from .serializers import ProfileSerializer, ServiceSerializer, BookingSerializer, ReviewSerializer, ReportSerializer

class ProfileList(generics.ListCreateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class ServiceList(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class BookingList(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
