from django.db import models
from django.conf import settings
from gyms.models import MembershipPackage
from django.utils import timezone

class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    package = models.ForeignKey(MembershipPackage, on_delete=models.SET_NULL, null=True)
    order_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    request_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, default='MoMo')
    created_at = models.DateTimeField(auto_now_add=True)
    # Thêm các trường MoMo trả về nếu cần
    trans_id = models.CharField(max_length=255, blank=True, null=True)
    pay_url = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Payment {self.order_id} for {self.member.username}"


class Subscription(models.Model):
    member = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription')
    package = models.ForeignKey(MembershipPackage, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def is_expired(self):
        return self.end_date < timezone.now().date()

    def __str__(self):
        return f"{self.member.username}'s subscription to {self.package.name}"