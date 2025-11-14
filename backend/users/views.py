from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework import status
from .serializers import PasswordChangeSerializer, MemberProfileSerializer,UserDetailSerializer
from .serializers import UserSerializer
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken
from firebase_admin import auth as firebase_auth
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from .models import CustomUser
from .permissions import IsManager, IsPT
from payments.models import Subscription
from payments.serializers import SubscriptionSerializer


@api_view(['POST'])
@permission_classes([AllowAny]) # Cho phép bất kỳ ai cũng có thể gọi API này
def register_user(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # <-- Đây là "người gác cổng"
def get_current_user(request):
    # Nhờ @permission_classes([IsAuthenticated]) và cấu hình JWT,
    # DRF sẽ tự động giải mã token, tìm người dùng và gán vào request.user
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    try:
        token = request.data.get('id_token')
        # Xác thực token với Google
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request())

        email = idinfo['email']

        # Tìm hoặc tạo người dùng
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            # Tạo user mới nếu chưa tồn tại
            username = email.split('@')[0]  # Tạm thời lấy username từ email
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=None  # Không cần mật khẩu
            )

        # Tạo token của hệ thống và trả về
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

    except ValueError:
        # Token không hợp lệ
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_firebase_token(request):
    user = request.user
    try:
        # Tạo custom token cho user ID tương ứng
        # UID trong Firebase sẽ là 'user_' + ID trong Django
        uid = f'user_{user.id}'
        custom_token = firebase_auth.create_custom_token(uid)
        return Response({'firebase_token': custom_token.decode('utf-8')})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StaffListView(ListAPIView):
    """
    API view to provide a list of staff members (PTs and Managers).
    Now restricted to Managers only.
    """
    serializer_class = UserSerializer
    # THAY ĐỔI DÒNG NÀY
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        current_user = self.request.user
        # Chỉ lấy PT, không cần lấy Manager nữa
        return CustomUser.objects.filter(
            role='pt'
        ).exclude(id=current_user.id).order_by('username')


class ChangePasswordView(APIView):
    """
    An endpoint for changing password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PasswordChangeSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data.get("old_password")
            new_password = serializer.validated_data.get("new_password")

            if not user.check_password(old_password):
                return Response({"old_password": ["Mật khẩu cũ không đúng."]}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({"status": "password set successfully"}, status=status.HTTP_200_OK)

        # Trả về các lỗi validation từ serializer
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MemberProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Lấy profile hiện tại
        serializer = MemberProfileSerializer(request.user.memberprofile) # Cần tạo serializer này
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        # Cập nhật profile
        serializer = MemberProfileSerializer(request.user.memberprofile, data=request.data, partial=True) # partial=True cho phép cập nhật từng phần
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MemberListView(ListAPIView):
    """
    API view for managers to get a list of all members.
    Supports searching by username.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsManager]

    def get_queryset(self):
        queryset = CustomUser.objects.filter(role='member')

        # Thêm logic tìm kiếm
        search_query = self.request.query_params.get('search', None)
        if search_query:
            # Tìm kiếm không phân biệt chữ hoa/thường
            queryset = queryset.filter(username__icontains=search_query)

        return queryset.order_by('username')

class CurrentSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        try:
            subscription = request.user.subscription
            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data)
        except Subscription.DoesNotExist:
            return Response(None)

class RegisterPushTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        token = request.data.get('push_token')
        if token:
            request.user.expo_push_token = token
            request.user.save()
            return Response({'status': 'token saved'}, status=status.HTTP_200_OK)
        return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

class MemberDetailView(RetrieveAPIView):
    """
    API để PT lấy thông tin chi tiết của một hội viên.
    """
    queryset = CustomUser.objects.filter(role='member')
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated, IsPT]
    # `lookup_field` mặc định là `pk` (primary key), nên URL sẽ là /users/members/{id}/