from rest_framework.permissions import BasePermission, SAFE_METHODS
from personal_trainers.models import PTAssignment


class IsManager(BasePermission):
    """
    Custom permission to only allow users with 'manager' role to access.
    """

    def has_permission(self, request, view):
        # request.user luôn tồn tại nếu đã qua IsAuthenticated
        return request.user and request.user.role == 'manager'


class IsManagerOrReadOnly(BasePermission):
    """
    Allows read-only access to any authenticated user,
    but only allows write access to managers.
    """

    def has_permission(self, request, view):
        # Cho phép tất cả các request đọc (GET, HEAD, OPTIONS)
        if request.method in SAFE_METHODS:
            return True

        # Chỉ cho phép các request ghi (POST, PUT, DELETE) nếu là manager
        return request.user and request.user.role == 'manager'

class IsPT(BasePermission):
    """
    Custom permission to only allow users with 'pt' role to access.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'pt'


class IsOwnerOrAssignedPT(BasePermission):
    """
    Permission to only allow owner of an object or their assigned PT to access it.
    """

    def has_object_permission(self, request, view, obj):
        # Quyền đọc được cho phép cho cả chủ sở hữu và PT được gán
        is_owner = obj.member == request.user
        is_assigned_pt = PTAssignment.objects.filter(pt=request.user, member=obj.member, is_active=True).exists()

        # Ai cũng có thể xem (nếu là chủ hoặc PT được gán)
        if request.method in SAFE_METHODS:
            return is_owner or is_assigned_pt

        # Quyền ghi (sửa/xóa) chỉ dành cho PT được gán
        return is_assigned_pt

class IsMemberOrAssignedPT(BasePermission):
    """
    Allows access only to the member who created the booking
    or the PT assigned to it.
    """
    def has_object_permission(self, request, view, obj):
        # obj ở đây là một instance của Booking
        return obj.member == request.user or obj.pt == request.user