from rest_framework import viewsets, mixins, status
from rest_framework.permissions import IsAuthenticated

from users.models import CustomUser
from users.permissions import IsPT
from .models import WorkoutPlan, Exercise, UserWorkoutProgress, WorkoutDay, UserWorkoutPlanAssignment
from .serializers import WorkoutPlanListSerializer, WorkoutPlanDetailSerializer, ExerciseSerializer, \
    UserWorkoutPlanAssignmentSerializer
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


class WorkoutProgressSummaryView(APIView):
    """
    API để lấy thông tin tóm tắt về tiến độ tập luyện của người dùng hiện tại.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Lấy bản ghi tiến độ (ngày đã hoàn thành) gần nhất của người dùng
        last_progress = UserWorkoutProgress.objects.filter(member=request.user).order_by('-completed_at').first()

        # Nếu không tìm thấy bản ghi nào, có nghĩa là người dùng chưa tập ngày nào
        if not last_progress:
            # Trả về một object rỗng để frontend có thể xử lý
            return Response({})

        # Từ bản ghi tiến độ, tìm ra chương trình tập liên quan
        target_plan = last_progress.workout_day.plan

        # Đếm tổng số ngày (không tính ngày nghỉ) của chương trình đó
        # total_days = target_plan.days.filter(is_rest_day=False).count()
        total_days = target_plan.days.count()  # Hoặc đếm tất cả các ngày

        # Đếm số ngày đã hoàn thành của user này TRONG chương trình đó
        completed_days = UserWorkoutProgress.objects.filter(
            member=request.user,
            workout_day__plan=target_plan
        ).count()

        # Tính toán phần trăm
        progress_percent = 0
        if total_days > 0:
            progress_percent = (completed_days / total_days) * 100

        # Xây dựng dữ liệu trả về
        response_data = {
            'plan_name': target_plan.name,
            'completed_days': completed_days,
            'total_days': total_days,
            'progress_percent': round(progress_percent)
        }

        return Response(response_data)


class AssignWorkoutPlanView(APIView):
    """API để PT gán một chương trình tập cho một hội viên."""
    permission_classes = [IsAuthenticated, IsPT]

    def post(self, request, *args, **kwargs):
        print("--- API /assign-plan/ RECEIVED DATA ---")
        print(request.data)
        pt_user = request.user
        member_id = request.data.get('member_id')
        plan_id = request.data.get('plan_id')

        if not all([member_id, plan_id]):
            return Response({"error": "member_id and plan_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # KIỂM TRA DỮ LIỆU TRƯỚC
            member = CustomUser.objects.get(id=member_id, role='member')
            plan = WorkoutPlan.objects.get(id=plan_id)
            pt_user = request.user

            # Logic update_or_create
            assignment, created = UserWorkoutPlanAssignment.objects.update_or_create(
                member=member,  # Tìm kiếm dựa trên instance `member`
                defaults={
                    'pt': pt_user,
                    'plan': plan,
                }
            )
            serializer = UserWorkoutPlanAssignmentSerializer(assignment)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response({"error": f"Member with id={member_id} not found."}, status=status.HTTP_404_NOT_FOUND)
        except WorkoutPlan.DoesNotExist:
            return Response({"error": f"WorkoutPlan with id={plan_id} not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # IN RA LỖI THỰC SỰ
            print(f"--- ERROR in /assign-plan/: {type(e).__name__} - {e} ---")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MyAssignedPlanView(APIView):
    """API để Hội viên lấy chương trình tập được gán cho mình."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Truy cập ngược từ user qua related_name 'assigned_plan'
            assignment = request.user.assigned_plan
            serializer = UserWorkoutPlanAssignmentSerializer(assignment)
            return Response(serializer.data)
        except UserWorkoutPlanAssignment.DoesNotExist:
            return Response(None)  # Trả về null nếu không có

