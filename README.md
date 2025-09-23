# Resofit - Hệ thống Quản lý Phòng Gym và Theo dõi Sức khỏe
_Một giải pháp toàn diện giúp kết nối Quản lý, Huấn luyện viên (PT), và Hội viên, được xây dựng trên nền tảng Django và React Native._

## 🚀 Giới thiệu

Resofit là một ứng dụng di động đa nền tảng được thiết kế để số hóa và tối ưu hóa trải nghiệm tại phòng gym. Dự án giải quyết các bài toán về quản lý hành chính, theo dõi tiến độ tập luyện, tương tác giữa PT và hội viên, và thanh toán trực tuyến, mang lại một hệ sinh thái liền mạch cho tất cả các bên.

Dự án này là sự kết hợp giữa một backend Django REST Framework mạnh mẽ, an toàn và một frontend React Native (Expo) linh hoạt, hiệu năng cao.

## ✨ Tính năng nổi bật

### Dành cho Hội viên (Member)
*   **📱 Giao diện Tab hiện đại:** Dễ dàng chuyển đổi giữa các tính năng chính.
*   **📝 Quản lý Gói tập & Thanh toán Online:** Xem chi tiết các gói tập và thanh toán trực tuyến an toàn qua cổng thanh toán **MoMo**.
*   **📅 Đặt lịch tập thông minh:** Dễ dàng đặt lịch tập tự do hoặc lịch tập riêng với PT.
*   **📊 Theo dõi Tiến độ Trực quan:** Xem lịch sử các chỉ số cơ thể (cân nặng, mỡ...) và theo dõi sự tiến bộ qua biểu đồ đường.
*   **🤖 AI Coach - Đếm Rep Chống đẩy:** Sử dụng camera và **TensorFlow.js (MoveNet)** để phân tích chuyển động theo thời gian thực, tự động đếm số lần chống đẩy và cung cấp phản hồi.
*   **💬 Chat Real-time với PT:** Tích hợp **Firebase Firestore** để tạo kênh giao tiếp trực tiếp, nhanh chóng với Huấn luyện viên.
*   **🔐 Đăng nhập & Bảo mật Nâng cao:**
    *   Đăng nhập truyền thống (username/password).
    *   Đăng nhập một chạm bằng **Google Sign-In**.
    *   Đăng nhập lại nhanh chóng bằng **Sinh trắc học (Vân tay/Face ID)**.
    *   Tự động khóa ứng dụng bằng sinh trắc học để tăng cường bảo mật.

### Dành cho Huấn luyện viên (PT)
*   **👥 Quản lý Hội viên:** Xem danh sách các hội viên mình đang phụ trách.
*   **📈 Cập nhật Tiến độ cho Hội viên:** Dễ dàng xem và nhập các chỉ số mới cho hội viên sau mỗi buổi tập.
*   **🗓️ Quản lý Lịch hẹn:** (Tính năng đang phát triển) Xem và duyệt các yêu cầu đặt lịch từ hội viên.

### Dành cho Quản lý (Manager)
*   **📦 Quản lý Gói tập:** Giao diện CRUD (Tạo, Xem, Sửa, Xóa) đầy đủ cho các gói tập của phòng gym.
*   **📊 Dashboard & Thống kê:** (Tính năng đang phát triển) Xem báo cáo doanh thu, số lượng hội viên...

## 🛠️ Công nghệ sử dụng

### Backend (Django)
*   **Framework:** Django, Django REST Framework
*   **Database:** MySQL (Development), PostgreSQL (Production)
*   **Xác thực:** Simple JWT (Access & Refresh Tokens), tích hợp xác thực Google.
*   **Thanh toán:** Tích hợp API MoMo (IPN, Chữ ký HMAC SHA256).
*   **Chat:** Firebase Admin SDK để tạo Custom Token.
*   **Lưu trữ file:** (Dự kiến) Cloudinary.
*   **Triển khai:** Cấu hình sẵn sàng cho Render.com, sử dụng Gunicorn & Whitenoise.

### Frontend (React Native with Expo)
*   **Framework:** React Native (Expo Managed Workflow).
*   **Ngôn ngữ:** TypeScript.
*   **Quản lý State:** React Context API (Auth Context).
*   **Điều hướng:** React Navigation (Stack, Bottom Tabs).
*   **Quản lý Form:** Formik & Yup cho validation.
*   **AI / Machine Learning:**
    *   **@tensorflow/tfjs**, **@tensorflow/tfjs-react-native**
    *   **@tensorflow-models/pose-detection (MoveNet)**
*   **Chat Real-time:** Firebase Firestore SDK v9.
*   **Thanh toán:** React Native WebView.
*   **Xác thực Sinh trắc học:** Expo Local Authentication.
*   **Đăng nhập Google:** Expo Auth Session.
*   **UI:** React Native Calendars, React Native Chart Kit, Expo Vector Icons.

## ⚙️ Hướng dẫn Cài đặt & Chạy dự án

### Yêu cầu
*   Node.js (LTS)
*   Python 3.x
*   MySQL Server
*   Git

### Cài đặt Backend
1.  Di chuyển vào thư mục `backend`: `cd backend`
2.  Tạo và kích hoạt môi trường ảo: `python -m venv venv && source venv/bin/activate`
3.  Cài đặt các thư viện: `pip install -r requirements.txt`
4.  Tạo file `.env` từ file `.env.example` và điền các thông tin cần thiết (Database, MoMo keys, Django Secret Key...).
5.  Chạy migration: `python manage.py migrate`
6.  Chạy server: `python manage.py runserver`

### Cài đặt Frontend
1.  Di chuyển vào thư mục `frontend`: `cd frontend`
2.  Cài đặt các thư viện: `npm install`
3.  Tạo file cấu hình Firebase (`firebaseConfig.ts`) và các file Google Services.
4.  Chạy ứng dụng trên Expo Go: `npx expo start`

## 🔮 Hướng phát triển Tương lai
- [ ] Hoàn thiện tính năng Quản lý Lịch hẹn cho PT.
- [ ] Xây dựng Dashboard thống kê cho Quản lý.
- [ ] Tích hợp thông báo đẩy (Push Notifications) cho tin nhắn mới và lịch hẹn.
- [ ] Tích hợp VNPAY và Upload biên lai chuyển khoản.
- [ ] Mở rộng AI Coach cho các bài tập khác (Squat, Plank...).
- [ ] Thiết lập CI/CD hoàn chỉnh với GitHub Actions và EAS Update.

---

_Dự án được phát triển bởi ThienDoan - 2025 . Liên hệ: nguyenthiendoan2@gmail.com_
