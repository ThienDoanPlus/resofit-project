from django.urls import path
from .views import register_user, get_current_user, google_login, StaffListView, get_firebase_token, ChangePasswordView, \
    MemberProfileUpdateView, MemberListView, CurrentSubscriptionView, RegisterPushTokenView,  MemberDetailView

urlpatterns = [
    path('register/', register_user, name='register'),
    path('me/', get_current_user, name='get_current_user'),
    path('google-login/', google_login, name='google_login'),
    path('staff/', StaffListView.as_view(), name='staff_list'),
    path('firebase-token/', get_firebase_token, name='firebase_token'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/', MemberProfileUpdateView.as_view(), name='member_profile'),
    path('members/', MemberListView.as_view(), name='member_list'),
    path('current-subscription/', CurrentSubscriptionView.as_view(), name='current_subscription'),
    path('register-push-token/', RegisterPushTokenView.as_view(), name='register_push_token'),
    path('members/<int:pk>/', MemberDetailView.as_view(), name='member_detail'),

]