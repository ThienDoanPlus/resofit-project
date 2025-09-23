from django.db import models
from cloudinary.models import CloudinaryField # <-- Import
from django.conf import settings # Thêm import này


class Exercise(models.Model):
    """
    Model lưu trữ thông tin của một bài tập đơn lẻ.
    """
    name = models.CharField(max_length=100)
    instructions = models.JSONField(
        blank=True,
        null=True,
        help_text="Các bước thực hiện, lưu dưới dạng một danh sách các chuỗi. VD: [\"Bước 1: ...\", \"Bước 2: ...\"]"
    )    # URL video hướng dẫn (ví dụ: link YouTube)
    video = CloudinaryField(
        resource_type='video',
        folder='exercise_videos',
        blank=True,
        null=True
    )
    gif = CloudinaryField(
        resource_type='image',
        folder='exercise_gifs',
        blank=True,
        null=True
    )
    # Dụng cụ hỗ trợ
    equipment = models.CharField(max_length=100, default="Body only")
    # Nhóm cơ chính
    muscle_group = models.CharField(max_length=50, blank=True, null=True)
    ai_supported = models.BooleanField(default=False, help_text="Đánh dấu nếu bài tập này được hỗ trợ bởi AI Coach")

    def __str__(self):
        return self.name


class WorkoutPlan(models.Model):
    """
    Model đại diện cho một chương trình tập luyện dài hạn (VD: 30 ngày tập luyện).
    """
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    name = models.CharField(max_length=150)
    description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    image_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.name


class WorkoutDay(models.Model):
    """
    Model đại diện cho một ngày tập cụ thể trong một chương trình.
    """
    plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, related_name='days')
    day_number = models.PositiveIntegerField()
    is_rest_day = models.BooleanField(default=False)
    title = models.CharField(max_length=100, blank=True, null=True)  # VD: "Ngày 1: Tập ngực & Tay sau"

    class Meta:
        ordering = ['day_number']
        unique_together = ('plan', 'day_number')  # Mỗi ngày trong plan là duy nhất

    def __str__(self):
        return f"{self.plan.name} - Day {self.day_number}"


class WorkoutDayExercise(models.Model):
    """
    Model trung gian để kết nối một bài tập vào một ngày tập cụ thể.
    Cho phép tùy chỉnh số hiệp, số rep cho bài tập đó trong ngày đó.
    """
    workout_day = models.ForeignKey(WorkoutDay, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)

    sets = models.PositiveIntegerField(help_text="Số hiệp")
    reps = models.CharField(max_length=20, help_text="Số lần lặp lại, VD: 8-12")
    rest_period = models.PositiveIntegerField(help_text="Thời gian nghỉ giữa các hiệp (giây)")
    order = models.PositiveIntegerField(default=0, help_text="Thứ tự của bài tập trong ngày")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exercise.name} in {self.workout_day}"

class UserWorkoutProgress(models.Model):
    """
    Model để theo dõi ngày tập nào đã được hoàn thành bởi user nào.
    """
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_progress')
    workout_day = models.ForeignKey(WorkoutDay, on_delete=models.CASCADE, related_name='user_progress')
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Đảm bảo một user chỉ có thể hoàn thành một ngày tập một lần
        unique_together = ('member', 'workout_day')

    def __str__(self):
        return f"{self.member.username} completed {self.workout_day}"