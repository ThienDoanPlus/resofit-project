import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "https://knowing-stingray-fresh.ngrok-free.app";
// const API_URL = 'https://resofit-api.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor vào instance của api
api.interceptors.response.use(
  // Nếu response thành công, trả về response đó
  (response) => {
    return response;
  },
  // Nếu response có lỗi, xử lý lỗi
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra xem có phải lỗi 401 và có phải do token hết hạn không
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu để tránh lặp vô hạn

      try {
        // Lấy refresh token từ bộ nhớ an toàn
        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        if (refreshToken) {
          // Gửi request để làm mới token
          const { data } = await axios.post(`${API_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          // Lấy access token mới
          const newAccessToken = data.access;

          // Lưu token mới vào SecureStore
          await SecureStore.setItemAsync("accessToken", newAccessToken);

          // Cập nhật header cho các request trong tương lai
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // Thực hiện lại request gốc đã thất bại
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        // Nếu refresh token cũng thất bại, chúng ta cần đăng xuất người dùng
        // (AuthContext sẽ xử lý việc này sau)
        return Promise.reject(refreshError);
      }
    }

    // Trả về lỗi nếu không phải là lỗi 401 do token hết hạn
    return Promise.reject(error);
  }
);

export default api;
