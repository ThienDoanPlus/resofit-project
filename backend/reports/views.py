from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from gyms.models import Booking
from users.models import CustomUser
from users.permissions import IsManager  # Cần quyền của Manager
from payments.models import Payment
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth, TruncDay
from datetime import datetime
from datetime import date


class RevenueStatsView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request, *args, **kwargs):
        period = request.query_params.get('period', 'month')  # Mặc định là 'month'

        # Lấy năm hiện tại
        current_year = datetime.now().year

        # Lọc các thanh toán đã hoàn thành trong năm hiện tại
        payments = Payment.objects.filter(
            status='completed',
            created_at__year=current_year
        )

        if period == 'year':
            # Nhóm theo tháng và tính tổng doanh thu mỗi tháng
            stats = payments.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                total=Sum('amount')
            ).order_by('month')

            # Format lại dữ liệu cho biểu đồ
            labels = [s['month'].strftime('%b') for s in stats]  # 'Jan', 'Feb'...
            data = [s['total'] for s in stats]

        elif period == 'month':
            # Nhóm theo ngày và tính tổng doanh thu mỗi ngày trong tháng hiện tại
            current_month = datetime.now().month
            stats = payments.filter(created_at__month=current_month).annotate(
                day=TruncDay('created_at')
            ).values('day').annotate(
                total=Sum('amount')
            ).order_by('day')

            labels = [s['day'].strftime('%d') for s in stats]  # '01', '02'...
            data = [s['total'] for s in stats]

        else:  # Mặc định là 'day' (có thể phát triển sau)
            labels = []
            data = []

        response_data = {
            'labels': labels,
            'data': data
        }
        return Response(response_data)


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request, *args, **kwargs):
        # 1. Đếm tổng số hội viên
        total_members = CustomUser.objects.filter(role='member').count()

        # 2. Đếm số PT đang hoạt động
        active_pts = CustomUser.objects.filter(role='pt', is_active=True).count()

        # 3. Tính tổng doanh thu trong tháng hiện tại
        today = date.today()
        revenue_this_month = Payment.objects.filter(
            status='completed',
            created_at__year=today.year,
            created_at__month=today.month
        ).aggregate(total=Sum('amount'))['total'] or 0  # Dùng 'or 0' để trả về 0 nếu là None

        # 4. (Tùy chọn) Đếm số lịch hẹn đang chờ duyệt
        pending_appointments = Booking.objects.filter(status='pending').count()

        # Tập hợp dữ liệu
        summary_data = {
            'total_members': total_members,
            'active_pts': active_pts,
            'revenue_this_month': revenue_this_month,
            'pending_appointments': pending_appointments
        }

        return Response(summary_data)