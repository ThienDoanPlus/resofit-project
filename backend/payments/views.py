from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import uuid
from gyms.models import MembershipPackage
from .models import Payment
from .momo_service import create_momo_payment_request
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

class CreateMoMoPayment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        package_id = request.data.get('package_id')
        try:
            package = MembershipPackage.objects.get(id=package_id)
        except MembershipPackage.DoesNotExist:
            return Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)

        order_id = str(uuid.uuid4())
        amount = package.price
        order_info = f"Thanh toán gói {package.name}"
        extra_data = ""  # Có thể thêm thông tin bổ sung nếu cần

        momo_response, request_id = create_momo_payment_request(order_id, amount, order_info, extra_data)

        if momo_response and momo_response.get('resultCode') == 0:
            # Tạo bản ghi Payment trong DB
            Payment.objects.create(
                member=request.user,
                package=package,
                order_id=order_id,
                request_id=request_id,
                amount=amount
            )
            # Trả về payUrl cho frontend
            return Response({"payUrl": momo_response.get('payUrl')}, status=status.HTTP_200_OK)

        return Response({"error": "Failed to create MoMo payment"}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def momo_ipn_listener(request):
    # TODO: XÁC THỰC CHỮ KÝ TỪ MOMO GỬI VỀ ĐỂ ĐẢM BẢO AN TOÀN

    data = request.data
    order_id = data.get('orderId')
    result_code = data.get('resultCode')
    trans_id = data.get('transId')

    try:
        payment = Payment.objects.get(order_id=order_id)
        if result_code == 0:
            # Thanh toán thành công
            payment.status = 'completed'
            payment.trans_id = trans_id
            payment.save()
            # TODO: KÍCH HOẠT GÓI TẬP CHO HỘI VIÊN
        else:
            # Thanh toán thất bại
            payment.status = 'failed'
            payment.save()

    except Payment.DoesNotExist:
        pass  # Bỏ qua nếu không tìm thấy đơn hàng

    return Response(status=status.HTTP_204_NO_CONTENT)