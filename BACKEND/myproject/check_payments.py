import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Payment, Booking, Service, Profile

print('--- PAYMENTS ---')
for p in Payment.objects.all():
    print(f"ID: {p.id}, Amount: {p.amount}, Status: {p.status}, Booking ID: {p.booking_id}")

print('\n--- BOOKINGS ---')
for b in Booking.objects.all():
    print(f"ID: {b.id}, Status: {b.status}, Service Price: {b.service.price}, Service Name: {b.service.name}")
