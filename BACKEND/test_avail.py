import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
django.setup()

from myapp.models import Profile, Availability, Service
from django.utils import timezone

now = timezone.localtime() if timezone.is_aware(timezone.now()) else timezone.now()
print(f"Current Time: {now}")

providers = Profile.objects.filter(role='provider')
print(f"Found {providers.count()} providers")

for p in providers:
    avails = Availability.objects.filter(provider=p)
    print(f"Provider {p.user.username} has {avails.count()} availabilities")
    for a in avails:
        print(f"  - Date: {a.date}, Start: {a.start_time}, End: {a.end_time}, Active: {a.is_active}")

services = Service.objects.all()
print(f"Total services: {services.count()}")
for s in services:
    print(f"  - Service: {s.name}, Provider: {s.provider.user.username}, Active: {s.is_active}")
