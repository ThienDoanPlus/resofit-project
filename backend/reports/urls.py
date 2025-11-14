from django.urls import path
from .views import RevenueStatsView, DashboardSummaryView, MemberStatsView

urlpatterns = [
    path('revenue/', RevenueStatsView.as_view(), name='revenue_stats'),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('members/', MemberStatsView.as_view(), name='member_stats'),

]