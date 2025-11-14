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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = data.access;

          await SecureStore.setItemAsync("accessToken", newAccessToken);

          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
