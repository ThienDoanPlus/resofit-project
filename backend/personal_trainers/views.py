from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsPT # Chúng ta sẽ tạo quyền này
from .models import PTAssignment
from .serializers import MyMemberSerializer

class MyMembersListView(ListAPIView):
    serializer_class = MyMemberSerializer
    permission_classes = [IsAuthenticated, IsPT]

    def get_queryset(self):
        # Lấy user PT đang đăng nhập
        pt_user = self.request.user
        # Trả về danh sách các assignment của PT đó
        return PTAssignment.objects.filter(pt=pt_user, is_active=True)