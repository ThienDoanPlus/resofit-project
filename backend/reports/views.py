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
        period = request.query_params.get('period', 'year')  # Đổi mặc định thành 'year'

        try:
            # Lấy năm từ request, nếu không có thì lấy năm hiện tại
            year = int(request.query_params.get('year', datetime.now().year))
        except (ValueError, TypeError):
            year = datetime.now().year

        payments = Payment.objects.filter(status='completed', created_at__year=year)
        members = CustomUser.objects.filter(role='member', date_joined__year=year)

        if period == 'year':
            # Nhóm theo tháng của năm đã chọn
            stats = payments.annotate(month=TruncMonth('created_at')).values('month').annotate(
                total=Sum('amount')).order_by('month')

            # Tạo dữ liệu cho 12 tháng của năm đó
            monthly_totals = {i: 0 for i in range(1, 13)}
            for s in stats:
                monthly_totals[s['month'].month] = s['total']

            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            data = [monthly_totals[i] for i in range(1, 13)]

        elif period == 'month':
            try:
                # Lấy tháng từ request, nếu không có thì lấy tháng hiện tại
                month = int(request.query_params.get('month', datetime.now().month))
            except (ValueError, TypeError):
                month = datetime.now().month

            # Nhóm theo ngày của tháng/năm đã chọn
            stats = payments.filter(created_at__month=month).annotate(day=TruncDay('created_at')).values(
                'day').annotate(total=Sum('amount')).order_by('day')

            labels = [s['day'].strftime('%d/%m') for s in stats]
            data = [s['total'] for s in stats]

        else:
            labels, data = [], []

        return Response({'labels': labels, 'data': data})


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


class MemberStatsView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request, *args, **kwargs):
        current_year = datetime.now().year

        # Lấy tất cả hội viên được tạo trong năm hiện tại
        members = CustomUser.objects.filter(
            role='member',
            date_joined__year=current_year
        )

        # Nhóm các hội viên theo tháng gia nhập và đếm số lượng
        stats = members.annotate(
            month=TruncMonth('date_joined')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')

        # Tạo một dict để chứa kết quả cho 12 tháng (mặc định là 0)
        monthly_counts = {i: 0 for i in range(1, 13)}
        for s in stats:
            monthly_counts[s['month'].month] = s['count']

        # Format lại dữ liệu cho biểu đồ
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        data = [monthly_counts[i] for i in range(1, 13)]

        response_data = {
            'labels': labels,
            'data': data
        }
        return Response(response_data)