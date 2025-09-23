from django.contrib import admin
from django.urls import path, include # Thêm 'include'
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from tracking.urls import router


urlpatterns = [
    path('admin/', admin.site.urls),
    # Thêm dòng này để tất cả URL bắt đầu bằng 'api/users/' sẽ được xử lý bởi app 'users'
    path('api/users/', include('users.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/gyms/', include('gyms.urls')),
    path('api/tracking/', include('tracking.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/pts/', include('personal_trainers.urls')),  # <-- Thêm
    path('api/workouts/', include('workouts.urls')),  # <-- Thêm dòng này
    path('api/reports/', include('reports.urls')),  # <-- Thêm

]