from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import BookingViewSet, BookedSlotsView, AvailableSlotsView
from .views import MembershipPackageViewSet, UpcomingBookingView

router = DefaultRouter()
router.register(r'packages', MembershipPackageViewSet, basename='package')
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    path('booked-slots/', BookedSlotsView.as_view(), name='booked_slots'),
    path('available-slots/', AvailableSlotsView.as_view(), name='available_slots'),
    path('upcoming-booking/', UpcomingBookingView.as_view(), name='upcoming_booking'),

]