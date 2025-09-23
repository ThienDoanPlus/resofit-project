from django.db import models
from django.conf import settings # Dùng settings.AUTH_USER_MODEL để tham chiếu an toàn

class MembershipPackage(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    # Dùng DecimalField cho giá tiền để tránh lỗi làm tròn của float
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # Thời hạn gói tập tính bằng ngày
    duration = models.IntegerField(help_text="Duration in days")
    # Số buổi tập có PT đi kèm
    pt_sessions = models.IntegerField(default=0, help_text="Number of PT sessions included")
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL ảnh minh họa cho gói tập")

    def __str__(self):
        return self.name


class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),  # Đang chờ PT duyệt
        ('approved', 'Approved'),  # Đã được duyệt (hoặc lịch tự tập)
        ('cancelled', 'Cancelled'),  # Đã bị hủy
    )

    # Hội viên đã đặt lịch hẹn này
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='member_bookings'
    )

    # PT được đặt lịch (có thể không có nếu hội viên tự tập)
    pt = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,  # Nếu PT bị xóa, lịch hẹn không bị xóa theo
        null=True,  # Cho phép trường này rỗng
        blank=True,  # Cho phép trường này không bắt buộc trên form Admin
        related_name='pt_sessions',
        limit_choices_to={'role': 'pt'}  # Chỉ cho phép chọn user có vai trò 'pt'
    )

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='approved')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Tự động điền thời gian tạo

    def __str__(self):
        pt_name = f" with {self.pt.username}" if self.pt else " (self-practice)"
        return f"Booking for {self.member.username} at {self.start_time.strftime('%Y-%m-%d %H:%M')}{pt_name}"