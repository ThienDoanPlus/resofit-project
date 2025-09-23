from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('member', 'Member'),
        ('pt', 'Personal Trainer'),
        ('manager', 'Manager'),
    )
    # Chúng ta không cần định nghĩa lại username, password, email vì AbstractUser đã có sẵn
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return self.username


class MemberProfile(models.Model):
    # Liên kết một-một với CustomUser
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='memberprofile')

    # Chiều cao tính bằng cm
    height = models.FloatField(blank=True, null=True, help_text="Height in cm")
    # Cân nặng ban đầu
    initial_weight = models.FloatField(blank=True, null=True, help_text="Initial weight in kg")
    # Các thông tin khác
    goal = models.TextField(blank=True, null=True)
    dob = models.DateField(blank=True, null=True, verbose_name="Date of Birth")

    def __str__(self):
        return f"Profile of {self.user.username}"


# Tín hiệu (Signal): Tự động tạo MemberProfile mỗi khi một CustomUser mới được tạo
@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'member':
        MemberProfile.objects.create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    if instance.role == 'member':
        # Đảm bảo profile luôn tồn tại
        if not hasattr(instance, 'memberprofile'):
            MemberProfile.objects.create(user=instance)
        instance.memberprofile.save()