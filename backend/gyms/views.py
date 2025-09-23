from rest_framework import viewsets
from rest_framework.views import APIView

from users.models import CustomUser
from .models import MembershipPackage, Booking
from .serializers import MembershipPackageSerializer, BookingSerializer
from users.permissions import IsManagerOrReadOnly
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsMemberOrAssignedPT, IsPT
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, time, timedelta
from django.utils import timezone

class MembershipPackageViewSet(viewsets.ModelViewSet):
    queryset = MembershipPackage.objects.all()
    serializer_class = MembershipPackageSerializer
    permission_classes = [IsManagerOrReadOnly]


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsMemberOrAssignedPT]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'pt':
            return Booking.objects.filter(pt=user).order_by('-start_time')
        else:
            return Booking.objects.filter(member=user).order_by('-start_time')

    @action(detail=True, methods=['post'], permission_classes=[IsPT])
    def approve(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'pending':
            booking.status = 'approved'
            booking.save()
            return Response({'status': 'booking approved'})
        return Response({'status': 'booking was not in pending state'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsPT])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'pending':
            booking.status = 'cancelled'
            booking.save()
            return Response({'status': 'booking rejected'})
        return Response({'status': 'booking was not in pending state'}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        pt_id = self.request.data.get('pt_id')
        pt_instance = None
        booking_status = 'approved'
        if pt_id:
            try:
                pt_instance = CustomUser.objects.get(id=pt_id, role='pt')
                booking_status = 'pending'
            except CustomUser.DoesNotExist:
                pass
        serializer.save(member=self.request.user, pt=pt_instance, status=booking_status)


class BookedSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            month = int(request.query_params.get('month'))
            year = int(request.query_params.get('year'))
        except (TypeError, ValueError):
            return Response({"error": "Month and year parameters are required and must be integers."},
                            status=status.HTTP_400_BAD_REQUEST)

        bookings = Booking.objects.filter(
            member=request.user,
            start_time__year=year,
            start_time__month=month
        )
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class AvailableSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({"error": "Date parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        opening_time = time(8, 0)
        closing_time = time(22, 0)
        all_slots_naive = []
        current_datetime = datetime.combine(selected_date, opening_time)
        while current_datetime.time() < closing_time:
            all_slots_naive.append(current_datetime)
            current_datetime += timedelta(hours=1)

        booked_slots = Booking.objects.filter(
            start_time__date=selected_date,
            status='approved'
        ).values_list('start_time', flat=True)

        current_tz = timezone.get_current_timezone()
        booked_slots_naive = [slot.astimezone(current_tz).replace(tzinfo=None) for slot in booked_slots]

        available_slots = [
            slot.strftime('%H:%M') for slot in all_slots_naive
            if slot not in booked_slots_naive
        ]

        return Response(available_slots)


class UpcomingBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        now = timezone.now()
        upcoming_booking = Booking.objects.filter(
            member=request.user,
            start_time__gte=now,
            status='approved'
        ).order_by('start_time').first()

        if upcoming_booking:
            serializer = BookingSerializer(upcoming_booking)
            return Response(serializer.data)

        return Response(None)
