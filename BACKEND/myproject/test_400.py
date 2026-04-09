import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from rest_framework.test import APIClient
from myapp.models import Profile, Service, Booking

client_profile = Profile.objects.filter(role='client').first()
service = Service.objects.first()

client = APIClient()
client.force_authenticate(user=client_profile.user)

payload = {
    'client_id': client_profile.id,
    'service_id': service.id,
    'booking_date': '2026-04-08T13:24:00.000Z',
    'end_time': '2026-04-08T15:24:00.000Z'
}
response = client.post('/api/bookings/', payload, format='json')
print("STATUS CODE:", response.status_code)
print("RESPONSE BODY:", response.json())
