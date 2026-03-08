import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from rest_framework.test import APIClient
from myapp.models import Booking

try:
    b = Booking.objects.get(id=2)
    client = APIClient()
    # Let's force authenticate as the provider of the booking
    provider_user = b.service.provider.user
    client.force_authenticate(user=provider_user)
    
    # PATCH
    response = client.patch(f'/api/bookings/{b.id}/', {'status': 'confirmed'}, format='json')
    print("STATUS CODE:", response.status_code)
    print("RESPONSE BODY:", response.json())
except Exception as e:
    print("EXCEPTION:", e)
