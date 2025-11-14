from rest_framework import serializers
from .models import ProgressLog, WaterLog
from users.serializers import UserSerializer

class ProgressLogSerializer(serializers.ModelSerializer):
    member = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    bmi = serializers.SerializerMethodField()

    class Meta:
        model = ProgressLog
        fields = ['id', 'date', 'weight', 'body_fat_percentage', 'notes', 'member', 'created_by', 'bmi']

        # ĐỊNH NGHĨA PHƯƠNG THỨC ĐỂ TÍNH GIÁ TRỊ CHO TRƯỜNG 'bmi'
    def get_bmi(self, obj):
        # `obj` ở đây là một instance của ProgressLog
        try:
            height_cm = obj.member.memberprofile.height
            if height_cm and height_cm > 0:
                height_meters = height_cm / 100
                weight = obj.weight
                bmi_value = weight / (height_meters * height_meters)
                return round(bmi_value, 2)  # Làm tròn đến 2 chữ số thập phân
        except AttributeError:
            # Xảy ra nếu member không có memberprofile hoặc profile không có height
            pass

        return None  # Trả về None nếu không thể tính toán

class WaterLogSerializer(serializers.ModelSerializer):
    """
    Serializer cho model WaterLog.
    """
    class Meta:
        model = WaterLog
        fields = ['id', 'date', 'amount']
# --------------------------