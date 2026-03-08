import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.utils import timezone
from myapp.models import Profile, Service, Booking, Availability
from django.db.models import Q

now = timezone.localtime() if timezone.is_aware(timezone.now()) else timezone.now()
current_date = now.date()
current_time = now.time()

active_providers = Profile.objects.filter(
    role='provider',
    availability__is_active=True
).exclude(
    availability__date=current_date, 
    availability__end_time__lt=current_time
).distinct()

available_provider_ids = []
for provider in active_providers:
    is_booked_now = Booking.objects.filter(
        service__provider=provider,
        status__in=['pending', 'confirmed'],
        booking_date__lte=now,
        end_time__gt=now
    ).exists()
    
    if not is_booked_now:
        available_provider_ids.append(provider.id)

print(f"Server Time: {now}")
print(f"Active Providers Count: {active_providers.count()}")
print(f"Available Provider IDs: {available_provider_ids}")

services = Service.objects.filter(
    is_active=True,
    provider_id__in=available_provider_ids
).distinct()
print(f"Total Services returned for clients: {services.count()}")

# Show all availabilities for debugging
print("\n--- ALL AVAILABILITIES ---")
for a in Availability.objects.all():
    print(f"Provider: {a.provider.id}, Date: {a.date}, End: {a.end_time}, Active: {a.is_active}")
