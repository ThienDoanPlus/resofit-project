from django.urls import path
from .views import MyMembersListView, PTDashboardSummaryView

urlpatterns = [
    path('my-members/', MyMembersListView.as_view(), name='my_members'),
    path('dashboard-summary/', PTDashboardSummaryView.as_view(), name='pt_dashboard_summary'),

]