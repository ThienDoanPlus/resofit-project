from django.db import models
from django.conf import settings


class ProgressLog(models.Model):
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_logs')
    # PT đã tạo bản ghi này (có thể null nếu hội viên tự nhập)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
                                   related_name='created_logs')

    date = models.DateField()
    weight = models.FloatField(help_text="Weight in kg")
    body_fat_percentage = models.FloatField(blank=True, null=True, help_text="Body fat in percentage")
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-date']
        # Đảm bảo một hội viên chỉ có một bản ghi cho một ngày duy nhất
        unique_together = ('member', 'date')

    def __str__(self):
        return f"Progress for {self.member.username} on {self.date}"

class WaterLog(models.Model):
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='water_logs')
    date = models.DateField(db_index=True) # Index để query nhanh hơn
    amount = models.PositiveIntegerField(default=0, help_text="Amount in ml")

    class Meta:
        unique_together = ('member', 'date')

    def __str__(self):
        return f"{self.member.username} drank {self.amount}ml on {self.date}"