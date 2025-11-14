from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkoutPlanViewSet, ExerciseViewSet, MarkDayAsCompletedView, WorkoutProgressSummaryView, AssignWorkoutPlanView, MyAssignedPlanView

router = DefaultRouter()
router.register(r'plans', WorkoutPlanViewSet, basename='workoutplan')
router.register(r'exercises', ExerciseViewSet, basename='exercise')

urlpatterns = [
    path('', include(router.urls)),
    path('progress/complete-day/', MarkDayAsCompletedView.as_view(), name='complete_day'),
    path('progress-summary/', WorkoutProgressSummaryView.as_view(), name='workout_progress_summary'),
    path('assign-plan/', AssignWorkoutPlanView.as_view(), name='assign_plan'),
    path('my-assigned-plan/', MyAssignedPlanView.as_view(), name='my_assigned_plan'),
]