from rest_framework import viewsets, mixins, status
from rest_framework.permissions import IsAuthenticated
from .models import WorkoutPlan, Exercise, UserWorkoutProgress, WorkoutDay
from .serializers import WorkoutPlanListSerializer, WorkoutPlanDetailSerializer,ExerciseSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

class WorkoutPlanViewSet(
    mixins.ListModelMixin,   # Cung cấp action `list` (GET /workout-plans/)
    mixins.RetrieveModelMixin, # Cung cấp action `retrieve` (GET /workout-plans/{id}/)
    viewsets.GenericViewSet
):
    """
    ViewSet để xem danh sách và chi tiết các chương trình tập.
    - `list` action sẽ sử dụng WorkoutPlanListSerializer (nhẹ).
    - `retrieve` action sẽ sử dụng WorkoutPlanDetailSerializer (chi tiết).
    """
    permission_classes = [IsAuthenticated]
    queryset = WorkoutPlan.objects.all()

    # Kỹ thuật quan trọng: Chọn Serializer dựa trên hành động (action)
    def get_serializer_class(self):
        if self.action == 'list':
            return WorkoutPlanListSerializer
        if self.action == 'retrieve':
            return WorkoutPlanDetailSerializer
        # Trả về một serializer mặc định hoặc báo lỗi nếu có các action khác
        return WorkoutPlanListSerializer

    def get_serializer_context(self):
        # Truyền context (bao gồm cả request) vào serializer
        return {'request': self.request}

class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet để xem chi tiết một bài tập.
    Chỉ cung cấp action `retrieve` (GET /exercises/{id}/).
    """
    permission_classes = [IsAuthenticated]
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class MarkDayAsCompletedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        day_id = request.data.get('day_id')
        if not day_id:
            return Response({"error": "day_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            workout_day = WorkoutDay.objects.get(id=day_id)
            # Dùng get_or_create để tránh tạo trùng lặp
            progress, created = UserWorkoutProgress.objects.get_or_create(
                member=request.user,
                workout_day=workout_day
            )
            if created:
                return Response({"status": "Day marked as completed."}, status=status.HTTP_201_CREATED)
            else:
                return Response({"status": "Day was already completed."}, status=status.HTTP_200_OK)
        except WorkoutDay.DoesNotExist:
            return Response({"error": "WorkoutDay not found."}, status=status.HTTP_404_NOT_FOUND)