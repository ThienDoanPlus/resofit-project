from django.db import models
from django.conf import settings

class MembershipPackage(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Duration in days")
    pt_sessions = models.IntegerField(default=0, help_text="Number of PT sessions included")
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL ảnh minh họa cho gói tập")

    def __str__(self):
        return self.name

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('cancelled', 'Cancelled'),
    )

    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='member_bookings'
    )

    pt = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pt_sessions',
        limit_choices_to={'role': 'pt'}
    )

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='approved')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        pt_name = f" with {self.pt.username}" if self.pt else " (self-practice)"
        return f"Booking for {self.member.username} at {self.start_time.strftime('%Y-%m-%d %H:%M')}{pt_name}"
