from rest_framework import serializers
from .models import Exercise, WorkoutPlan, WorkoutDay, WorkoutDayExercise, UserWorkoutProgress


# --- Serializers Cấp Chi tiết nhất ---

class ExerciseSerializer(serializers.ModelSerializer):
    """Serializer cho một bài tập đơn lẻ."""
    video_url = serializers.SerializerMethodField()
    gif_url = serializers.SerializerMethodField()

    class Meta:
        model = Exercise
        # Liệt kê các trường, bao gồm cả các trường ảo mới
        fields = [
            'id', 'name', 'instructions', 'equipment', 'muscle_group',
            'video_url', 'gif_url', 'ai_supported'
        ]

    # Phương thức để lấy giá trị cho trường `video_url`
    def get_video_url(self, obj):
        if obj.video and hasattr(obj.video, 'url'):
            return obj.video.url
        return None

    # Phương thức để lấy giá trị cho trường `gif_url`
    def get_gif_url(self, obj):
        if obj.gif and hasattr(obj.gif, 'url'):
            return obj.gif.url
        return None

class WorkoutDayExerciseSerializer(serializers.ModelSerializer):
    """
    Serializer cho "công thức" của một bài tập trong một ngày.
    Nó sẽ hiển thị thông tin chi tiết của bài tập thay vì chỉ ID.
    """
    # Sử dụng serializer lồng nhau để hiển thị chi tiết của `exercise`
    exercise = ExerciseSerializer(read_only=True)

    class Meta:
        model = WorkoutDayExercise
        fields = ['id', 'exercise', 'sets', 'reps', 'rest_period', 'order']


# --- Serializers Cấp Trung bình ---

class WorkoutDaySerializer(serializers.ModelSerializer):
    """
    Serializer cho một ngày tập.
    Nó sẽ hiển thị danh sách tất cả các bài tập trong ngày đó.
    """
    # Sử dụng serializer lồng nhau (với `many=True`) để hiển thị danh sách bài tập
    exercises = WorkoutDayExerciseSerializer(many=True, read_only=True)
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutDay
        # Thêm 'is_completed' vào fields
        fields = ['id', 'day_number', 'is_rest_day', 'title', 'exercises', 'is_completed']

    def get_is_completed(self, obj):
        # `obj` là một instance của WorkoutDay
        # `self.context['request'].user` là user đang gửi request
        user = self.context.get('request').user
        if user and user.is_authenticated:
            # Kiểm tra xem có bản ghi progress nào tồn tại cho user và ngày tập này không
            return UserWorkoutProgress.objects.filter(member=user, workout_day=obj).exists()
        return False


# --- Serializers Cấp Tổng quan nhất ---

class WorkoutPlanListSerializer(serializers.ModelSerializer):
    """
    Serializer cho việc hiển thị ở MÀN HÌNH DANH SÁCH các chương trình tập.
    Chỉ hiển thị các thông tin cơ bản, ngắn gọn.
    """
    """
        Serializer cho màn hình danh sách, BÂY GIỜ sẽ có thêm tiến độ.
        """
    # --- THÊM 2 TRƯỜNG MỚI ---
    total_days = serializers.SerializerMethodField()
    completed_days = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlan
        # Thêm 2 trường mới vào danh sách fields
        fields = ['id', 'name', 'description', 'difficulty', 'image_url', 'total_days', 'completed_days']

    def get_total_days(self, obj):
        # `obj` là một instance của WorkoutPlan
        # `.count()` là một phương thức hiệu quả để đếm số lượng object liên quan
        return obj.days.count()

    def get_completed_days(self, obj):
        # Lấy user đang gửi request từ context
        user = self.context.get('request').user
        if user and user.is_authenticated:
            # Đếm số bản ghi UserWorkoutProgress của user này,
            # mà workout_day thuộc về chương trình tập (obj) này.
            return UserWorkoutProgress.objects.filter(
                member=user,
                workout_day__plan=obj
            ).count()
        return 0


class WorkoutPlanDetailSerializer(serializers.ModelSerializer):
    """
    Serializer cho việc hiển thị ở MÀN HÌNH CHI TIẾT của một chương trình tập.
    Hiển thị tất cả các ngày tập và các bài tập bên trong.
    """
    # Sử dụng serializer lồng nhau để hiển thị danh sách các ngày tập
    days = WorkoutDaySerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutPlan
        # Bao gồm cả trường `days` đã được định nghĩa ở trên
        fields = ['id', 'name', 'description', 'difficulty', 'image_url', 'days']