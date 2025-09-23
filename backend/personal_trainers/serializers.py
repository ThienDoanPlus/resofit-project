from rest_framework import serializers
from users.serializers import UserSerializer
from .models import PTAssignment

class MyMemberSerializer(serializers.ModelSerializer):
    member = UserSerializer()

    class Meta:
        model = PTAssignment
        fields = ['member', 'start_date', 'is_active']