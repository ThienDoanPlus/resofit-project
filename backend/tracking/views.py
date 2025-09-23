from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from .models import ProgressLog
from .serializers import ProgressLogSerializer
from users.permissions import IsOwnerOrAssignedPT
from rest_framework.views import APIView
from users.models import CustomUser
import google.generativeai as genai
from django.conf import settings
import json

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

class ProgressLogViewSet(viewsets.ModelViewSet):
    serializer_class = ProgressLogSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAssignedPT]

    def get_queryset(self):
        user = self.request.user
        member_id = self.request.query_params.get('member_id', None)

        target_member = None
        # Xác định đối tượng cần lấy log
        if user.role == 'pt' and member_id:
            try:
                target_member = CustomUser.objects.get(id=member_id, role='member')
                # TODO: Kiểm tra quyền của PT với member này
            except CustomUser.DoesNotExist:
                return ProgressLog.objects.none()
        else:
            target_member = user

        if not target_member:
            return ProgressLog.objects.none()

        # Bắt đầu với queryset cơ bản
        queryset = ProgressLog.objects.filter(member=target_member)

        # Lọc theo năm (nếu có)
        year = self.request.query_params.get('year')
        if year:
            try:
                queryset = queryset.filter(date__year=int(year))
            except (ValueError, TypeError):
                pass  # Bỏ qua nếu param không hợp lệ

        # Lọc theo tháng (nếu có)
        month = self.request.query_params.get('month')
        if month:
            try:
                queryset = queryset.filter(date__month=int(month))
            except (ValueError, TypeError):
                pass  # Bỏ qua nếu param không hợp lệ

        # Luôn trả về theo thứ tự ngày tăng dần, tốt cho biểu đồ
        return queryset.order_by('date')

    def perform_create(self, serializer):
        # Logic này cần được làm thông minh hơn
        user = self.request.user
        if user.role == 'pt':
            member_id = self.request.data.get('member_id')
            serializer.save(created_by=user, member_id=member_id)
        elif user.role == 'member':
            # Nếu member tự tạo
            serializer.save(member=user, created_by=user)


class ProgressSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        requesting_user = request.user
        # Lấy member_id từ query param, ví dụ: /api/tracking/summary/?member_id=5
        member_id = request.query_params.get('member_id', None)

        target_member = None

        # Xác định "đối tượng" cần xem tóm tắt
        if requesting_user.role == 'pt' and member_id:
            # Nếu người yêu cầu là PT và có cung cấp member_id
            try:
                # TODO (Nâng cao): Kiểm tra xem PT này có quyền xem member này không
                target_member = CustomUser.objects.get(id=member_id, role='member')
            except CustomUser.DoesNotExist:
                return Response({"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Nếu là Hội viên, hoặc PT không cung cấp member_id,
            # đối tượng mặc định là chính người dùng
            target_member = requesting_user

        # --- Bắt đầu logic tính toán, sử dụng `target_member` ---

        latest_log = ProgressLog.objects.filter(member=target_member).order_by('-date').first()
        first_log = ProgressLog.objects.filter(member=target_member).order_by('date').first()

        if not latest_log:
            # Vẫn trả về is_height_missing để frontend có thể xử lý
            height_cm = getattr(getattr(target_member, 'memberprofile', None), 'height', None)
            return Response({'is_height_missing': height_cm is None})

        height_cm = None
        try:
            height_cm = target_member.memberprofile.height
        except AttributeError:  # Xử lý trường hợp không có profile
            pass

        bmi = None
        if height_cm and height_cm > 0:
            height_meters = height_cm / 100
            bmi = latest_log.weight / (height_meters * height_meters)

        weight_change = None
        if first_log:
            weight_change = latest_log.weight - first_log.weight

        summary_data = {
            'latest_log': ProgressLogSerializer(latest_log).data,
            'first_log_weight': first_log.weight if first_log else None,
            'weight_change': weight_change,
            'bmi': bmi,
            'is_height_missing': height_cm is None,
        }

        return Response(summary_data)

class GenerateAdviceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        # Lấy các chỉ số từ request body (frontend sẽ gửi lên)
        weight = request.data.get('weight')
        height = request.data.get('height') # tính bằng cm
        bmi = request.data.get('bmi')
        goal = user.memberprofile.goal # Lấy mục tiêu từ profile

        # --- Tạo Prompt cho AI ---
        prompt = f"""
        Bạn là một chuyên gia dinh dưỡng và huấn luyện viên thể hình AI. 
        Dựa trên các chỉ số sau của một người dùng:
        - Chiều cao: {height} cm
        - Cân nặng: {weight} kg
        - Chỉ số BMI: {bmi:.2f}
        - Mục tiêu: "{goal}"

        Hãy đưa ra hai lời khuyên ngắn gọn, đi thẳng vào vấn đề, mỗi lời khuyên không quá 3 câu:
        1. Một lời khuyên về chế độ ăn uống.
        2. Một lời khuyên về nhóm cơ hoặc loại bài tập cần tập trung.

        Trả lời bằng tiếng Việt. Định dạng câu trả lời của bạn chính xác như sau:
        {{
            "diet_advice": "Nội dung lời khuyên ăn uống.",
            "workout_advice": "Nội dung lời khuyên luyện tập."
        }}
        """

        # try:
        #     response = model.generate_content(prompt)
        #     # Parse a JSON string from the model's response
        #     advice_json = json.loads(response.text.strip())
        #     return Response(advice_json)
        # except Exception as e:
        #     print(f"Gemini API error: {e}")
        #     return Response({"error": "Không thể tạo lời khuyên."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            response = model.generate_content(prompt)

            # --- LOGIC DỌN DẸP ĐƯỢC NÂNG CẤP ---
            # 1. Dọn dẹp Markdown
            clean_response_text = response.text.strip().replace('```json', '').replace('```', '').strip()

            # 2. Xử lý dấu phẩy thừa (trailing comma)
            # Tạm thời, một cách đơn giản là thay thế các trường hợp phổ biến
            clean_response_text = clean_response_text.replace(',\n}', '\n}').replace(',\n]', '\n]')

            # Thêm kiểm tra trước khi parse
            if not clean_response_text:
                raise ValueError("Gemini returned an empty response.")

            advice_json = json.loads(clean_response_text)
            return Response(advice_json)

        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            print(f"Faulty text was: {clean_response_text}")
            return Response({"error": "AI trả về định dạng không hợp lệ."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Gemini API error: {e}")
            return Response({"error": "Không thể tạo lời khuyên từ AI."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)