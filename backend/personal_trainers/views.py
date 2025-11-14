from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsPT
from .models import PTAssignment
from .serializers import MyMemberSerializer
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.response import Response
from gyms.models import Booking

class MyMembersListView(ListAPIView):
    serializer_class = MyMemberSerializer
    permission_classes = [IsAuthenticated, IsPT]

    def get_queryset(self):
        pt_user = self.request.user
        return PTAssignment.objects.filter(pt=pt_user, is_active=True)


class PTDashboardSummaryView(APIView):
    """
    API để cung cấp dữ liệu thống kê nhanh cho Dashboard của PT.
    """
    permission_classes = [IsAuthenticated, IsPT]

    def get(self, request, *args, **kwargs):
        pt_user = request.user
        today = timezone.now().date()

        # 1. Đếm số lịch hẹn đã được duyệt trong ngày hôm nay
        appointments_today = Booking.objects.filter(
            pt=pt_user,
            start_time__date=today,
            status='approved'
        ).count()

        # 2. Đếm số yêu cầu đặt lịch đang chờ duyệt
        pending_requests = Booking.objects.filter(
            pt=pt_user,
            status='pending'
        ).count()

        # 3. Đếm tổng số hội viên đang được PT này phụ trách
        active_members = PTAssignment.objects.filter(
            pt=pt_user,
            is_active=True
        ).count()

        # Tập hợp dữ liệu
        summary_data = {
            'appointments_today': appointments_today,
            'pending_requests': pending_requests,
            'active_members': active_members
        }

        return Response(summary_data)