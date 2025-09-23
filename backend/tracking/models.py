from django.db import models
from django.conf import settings


class ProgressLog(models.Model):
    # Hội viên sở hữu bản ghi này
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_logs')
    # PT đã tạo bản ghi này (có thể null nếu hội viên tự nhập)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
                                   related_name='created_logs')

    date = models.DateField()
    weight = models.FloatField(help_text="Weight in kg")
    body_fat_percentage = models.FloatField(blank=True, null=True, help_text="Body fat in percentage")
    # Thêm các chỉ số khác nếu muốn, ví dụ:
    # muscle_mass = models.FloatField(blank=True, null=True, help_text="Muscle mass in kg")
    notes = models.TextField(blank=True, null=True)

    class Meta:
        # Sắp xếp các bản ghi theo ngày, mới nhất lên đầu
        ordering = ['-date']
        # Đảm bảo một hội viên chỉ có một bản ghi cho một ngày duy nhất
        unique_together = ('member', 'date')

    def __str__(self):
        return f"Progress for {self.member.username} on {self.date}"