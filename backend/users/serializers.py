from rest_framework import serializers
from .models import CustomUser, MemberProfile
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # Các trường muốn nhận từ client khi đăng ký
        fields = ['id', 'username', 'email', 'password', 'role']
        # Đảm bảo mật khẩu không bị trả về trong response
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # Băm mật khẩu trước khi lưu vào database
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'member') # Mặc định là member nếu không được cung cấp
        )
        return user

class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer cho endpoint đổi mật khẩu.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu cũ không chính xác.")
        return value

    def validate_new_password(self, value):
        # Sử dụng validator mặc định của Django (bao gồm cả min_length, độ mạnh,...)
        validate_password(value)
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        new_password = self.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        return user

class MemberProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the MemberProfile model.
    Allows reading and updating member-specific profile data.
    """
    # Chúng ta không muốn user có thể thay đổi user liên kết, nên đặt là read_only
    # và chỉ hiển thị username cho dễ nhận biết.
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = MemberProfile
        # Liệt kê các trường mà frontend có thể gửi lên và nhận về
        fields = ['username', 'height', 'initial_weight', 'goal', 'dob']


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer hiển thị thông tin chi tiết của hội viên cho PT xem.
    """
    memberprofile = MemberProfileSerializer(read_only=True)

    subscription = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'date_joined', 'memberprofile', 'subscription']

    def get_subscription(self, obj):
        # Di chuyển import vào bên trong phương thức
        from payments.serializers import SubscriptionSerializer
        try:
            # `obj` là một instance CustomUser
            subscription = obj.subscription
            # Trả về dữ liệu đã được serialize
            return SubscriptionSerializer(subscription).data
        except AttributeError:
            # Trả về null nếu user không có `subscription` (ví dụ: PT, Manager, hoặc member chưa có gói)
            return None