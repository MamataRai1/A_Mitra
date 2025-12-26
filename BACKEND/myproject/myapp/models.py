from django.db import models
from django.contrib.auth.models import User


# 1️⃣ User Profile
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=10)
    city = models.CharField(max_length=50)
    bio = models.TextField()
    photo = models.ImageField(upload_to='profiles/')
    is_service_provider = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username


# 2️⃣ Background Verification (Police + ID)
class Verification(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE)
    police_report = models.FileField(upload_to='police_reports/')
    id_proof = models.FileField(upload_to='id_documents/')
    verified = models.BooleanField(default=False)
    verified_on = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Verification - {self.profile.user.username}"


# 3️⃣ Service Offered (Hourly Basis)
class Service(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField()
    price_per_hour = models.DecimalField(max_digits=6, decimal_places=2)
    available = models.BooleanField(default=False)

    def __str__(self):
        return self.title


# 4️⃣ Booking (Renting a Companion)
class Booking(models.Model):
    renter = models.ForeignKey(User, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    date = models.DateField()
    hours = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('Pending', 'Pending'),
            ('Approved', 'Approved'),
            ('Completed', 'Completed')
        ],
        default='Pending'
    )

    def __str__(self):
        return f"{self.renter.username} - {self.service.title}"


# 5️⃣ Review & Rating
class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review - {self.booking.service.title}"


# 6️⃣ Report / Red Flag
class Report(models.Model):
    reporter = models.ForeignKey(User, on_delete=models.CASCADE)
    reported_profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Report against {self.reported_profile.user.username}"


# 7️⃣ GPS Location Log (Simulated Tracking)
class LocationLog(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    latitude = models.CharField(max_length=50)
    longitude = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Location - {self.service.title}"
