from django.contrib import admin
from .models import Profile, Verification, Service, Booking, Review, Report, LocationLog

admin.site.register(Profile)
admin.site.register(Verification)
admin.site.register(Service)
admin.site.register(Booking)
admin.site.register(Review)
admin.site.register(Report)
admin.site.register(LocationLog)
