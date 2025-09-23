from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsPT
from .models import PTAssignment
from .serializers import MyMemberSerializer

class MyMembersListView(ListAPIView):
    serializer_class = MyMemberSerializer
    permission_classes = [IsAuthenticated, IsPT]

    def get_queryset(self):
        pt_user = self.request.user
        return PTAssignment.objects.filter(pt=pt_user, is_active=True)