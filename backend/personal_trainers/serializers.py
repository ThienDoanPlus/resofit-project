from rest_framework import serializers
from users.serializers import UserSerializer
from .models import PTAssignment

class MyMemberSerializer(serializers.ModelSerializer):
    # Chúng ta muốn hiển thị thông tin chi tiết của hội viên
    member = UserSerializer()

    class Meta:
        model = PTAssignment
        fields = ['member', 'start_date', 'is_active']