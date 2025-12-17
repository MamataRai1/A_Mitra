from django.db import models
class Book(models.Model):
    title = models.CharField(max_length=200)        # Book title
    author = models.CharField(max_length=100)       # Author name
    published_date = models.DateField()             # Publication date
    price = models.DecimalField(max_digits=6, decimal_places=2)  # Price of the book
    description = models.TextField(blank=True)     # Optional description

    def __str__(self):
        return self.title

# Create your models here.
