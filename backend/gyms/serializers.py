from rest_framework import serializers
from .models import MembershipPackage, Booking
from users.serializers import UserSerializer


class MembershipPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPackage
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    member = UserSerializer(read_only=True)
    pt = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'

    def validate(self, data):
        start_time = data.get('start_time', getattr(self.instance, 'start_time', None))
        end_time = data.get('end_time', getattr(self.instance, 'end_time', None))

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError("Thời gian kết thúc phải sau thời gian bắt đầu.")
        return data