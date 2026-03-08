import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Payment, Booking
from django.utils import timezone

completed_bookings = Booking.objects.filter(status='completed')
count = 0
for b in completed_bookings:
    p, created = Payment.objects.update_or_create(
        booking=b,
        defaults={
            'amount': b.service.price,
            'method': 'cash',
            'status': 'completed',
            'paid_at': timezone.now()
        }
    )
    if not created and p.status == 'completed':
        count += 1

print(f"Fixed {count} payments for completed bookings.")
