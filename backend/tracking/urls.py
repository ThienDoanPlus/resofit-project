from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgressLogViewSet, ProgressSummaryView, GenerateAdviceView, DailyWaterLogView

router = DefaultRouter()
router.register(r'logs', ProgressLogViewSet, basename='progresslog')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', ProgressSummaryView.as_view(), name='progress_summary'),
    path('generate-advice/', GenerateAdviceView.as_view(), name='generate_advice'),
    path('daily-water/', DailyWaterLogView.as_view(), name='daily_water_log'),

]