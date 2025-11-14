from gyms.serializers import MembershipPackageSerializer
from payments.models import Subscription
from rest_framework import serializers


class SubscriptionSerializer(serializers.ModelSerializer):
    package = MembershipPackageSerializer()
    class Meta:
        model = Subscription
        fields = ['id', 'package', 'start_date', 'end_date', 'is_active']