import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
django.setup()

from myapp.models import Profile, Availability, Service
from django.utils import timezone

with open("test_out.txt", "w", encoding="utf-8") as f:
    now = timezone.localtime() if timezone.is_aware(timezone.now()) else timezone.now()
    f.write(f"Current Time: {now}\n")

    providers = Profile.objects.filter(role='provider')
    f.write(f"Found {providers.count()} providers\n")

    for p in providers:
        avails = Availability.objects.filter(provider=p)
        f.write(f"Provider {p.user.username} has {avails.count()} availabilities\n")
        for a in avails:
            f.write(f"  - Date: {a.date}, Start: {a.start_time}, End: {a.end_time}, Active: {a.is_active}\n")

    services = Service.objects.all()
    f.write(f"Total services: {services.count()}\n")
    for s in services:
        f.write(f"  - Service: {s.name}, Provider: {s.provider.user.username}, Active: {s.is_active}\n")
