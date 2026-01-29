from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# -------------------- User Profile --------------------
class Profile(models.Model):
    USER_ROLE_CHOICES = (
        ('client', 'Client'),
        ('provider', 'Service Provider'),
        ('admin', 'Admin'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=USER_ROLE_CHOICES, default='client')

    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_pic = models.ImageField(upload_to='profiles/', blank=True, null=True)

    is_verified = models.BooleanField(default=False)
    is_suspended = models.BooleanField(default=False)

    trust_score = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


# -------------------- Services --------------------
class Service(models.Model):
    provider = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    description = models.TextField()

    price = models.DecimalField(max_digits=10, decimal_places=2)

    category = models.CharField(max_length=100, blank=True, null=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.provider.user.username}"


# -------------------- Booking --------------------
class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
        ('no_show', 'No Show'),
    )

    client = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')

    booking_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Booking: {self.service.name} by {self.client.user.username}"


# -------------------- Reviews --------------------
class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')

    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Review for {self.booking.service.name} - {self.rating}/5"


# -------------------- SAFETY REPORTS / ALERTS --------------------
class Report(models.Model):
    REPORT_REASON_CHOICES = (
        ('fake_profile', 'Fake Profile'),
        ('harassment', 'Harassment'),
        ('scam', 'Scam Attempt'),
        ('unsafe_behavior', 'Unsafe Behavior'),
        ('no_show', 'No Show'),
        ('payment_issue', 'Payment Issue'),
        ('other', 'Other'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    )

    reporter = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='reports_received')

    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, blank=True, null=True)

    reason = models.CharField(max_length=50, choices=REPORT_REASON_CHOICES)
    description = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    admin_note = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Report: {self.reporter.user.username} → {self.reported_user.user.username}"


# -------------------- Payment --------------------
class Payment(models.Model):
    METHOD_CHOICES = (
        ('khalti', 'Khalti'),
        ('esewa', 'eSewa'),
        ('cash', 'Cash'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    transaction_id = models.CharField(max_length=255, blank=True, null=True)

    paid_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Payment {self.amount} - {self.booking.service.name}"


# -------------------- Provider Availability --------------------
class Availability(models.Model):
    provider = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='availability')

    day = models.CharField(max_length=10)

    start_time = models.TimeField()
    end_time = models.TimeField()

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.provider.user.username} available on {self.day}"


# -------------------- Favorites --------------------
class Favorite(models.Model):
    client = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='favorites')

    provider = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='favorited_by', blank=True, null=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        target = self.service.name if self.service else self.provider.user.username
        return f"{self.client.user.username} likes {target}"


# -------------------- Messages --------------------
class Message(models.Model):
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='received_messages')

    content = models.TextField()

    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Message from {self.sender.user.username} to {self.receiver.user.username}"


# -------------------- Verification --------------------
class Verification(models.Model):
    VERIFICATION_TYPE_CHOICES = (
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('document', 'Document'),
    )

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='verifications')

    verification_type = models.CharField(max_length=20, choices=VERIFICATION_TYPE_CHOICES)

    is_verified = models.BooleanField(default=False)

    document = models.FileField(upload_to='verifications/', blank=True, null=True)

    verified_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.profile.user.username} - {self.verification_type}"


# -------------------- Location Logs --------------------
class LocationLog(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='locations')

    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    logged_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.profile.user.username} - {self.latitude}, {self.longitude}"
