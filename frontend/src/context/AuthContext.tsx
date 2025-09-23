// AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { signInWithCustomToken } from "firebase/auth";
import api from "../api/api";
import { auth } from "../firebase/firebaseConfig";
import { User } from "../navigation/types"; // Thêm import này

// ---------------- Types ----------------

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (tokens: { access: string; refresh: string }) => Promise<void>;
  signOut: () => Promise<void>;
  isBiometricEnabled: boolean;
  enableBiometricAuth: () => Promise<void>;
  signInWithBiometric: () => Promise<boolean>;
  isAppLockEnabled: boolean;
  toggleAppLock: (value: boolean) => Promise<void>;
}

// ---------------- Context ----------------
const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  isBiometricEnabled: false,
  enableBiometricAuth: async () => {},
  signInWithBiometric: async () => false,
  isAppLockEnabled: false,
  toggleAppLock: async () => {},
});

// ---------------- Provider ----------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);

  useEffect(() => {
    const loadSessionAndSettings = async () => {
      let storedAccessToken: string | null = null;
      try {
        const biometricStatus = await SecureStore.getItemAsync(
          "biometricEnabled"
        );
        setIsBiometricEnabled(biometricStatus === "true");

        const appLockStatus = await AsyncStorage.getItem("appLockEnabled");
        setIsAppLockEnabled(appLockStatus === "true");

        storedAccessToken = await SecureStore.getItemAsync("accessToken");
        if (storedAccessToken) {
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedAccessToken}`;
          const { data: userData } = await api.get("/api/users/me/");
          setAccessToken(storedAccessToken);
          setUser(userData);

          // Lấy Firebase custom token từ backend
          const { data: firebaseData } = await api.get(
            "/api/users/firebase-token/"
          );
          if (firebaseData.firebase_token) {
            await signInWithCustomToken(auth, firebaseData.firebase_token);
            console.log("✅ Firebase sign-in restored");
          }
        }
      } catch (e) {
        console.log("⚠️ Session invalid or expired. Signing out...");
        // Thay vì tự dọn dẹp, hãy gọi đến "chuyên gia" dọn dẹp
        await signOut();
      } finally {
        setIsLoading(false);
      }
    };
    loadSessionAndSettings();
  }, []);

  // ---------------- App Lock ----------------
  const toggleAppLock = async (value: boolean) => {
    try {
      await AsyncStorage.setItem("appLockEnabled", JSON.stringify(value));
      setIsAppLockEnabled(value);
      Alert.alert("Thành công", `Đã ${value ? "bật" : "tắt"} khóa ứng dụng.`);
    } catch {
      Alert.alert("Lỗi", "Không thể thay đổi cài đặt.");
    }
  };

  // ---------------- Biometric ----------------
  const enableBiometricAuth = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (refreshToken) {
        await SecureStore.setItemAsync("biometricEnabled", "true");
        setIsBiometricEnabled(true);
        Alert.alert("Thành công", "Đăng nhập bằng sinh trắc học đã được bật.");
      }
    } catch {
      Alert.alert("Lỗi", "Không thể bật đăng nhập bằng sinh trắc học.");
    }
  };

  const signInWithBiometric = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Không hỗ trợ",
          "Thiết bị không hỗ trợ hoặc chưa thiết lập sinh trắc học."
        );
        return false;
      }

      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: "Xác thực để đăng nhập",
      });

      if (success) {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) {
          Alert.alert(
            "Lỗi",
            "Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại."
          );
          return false;
        }
        const { data } = await api.post("/api/token/refresh/", {
          refresh: refreshToken,
        });
        await signIn(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // ---------------- Sign In / Sign Out ----------------
  // const signIn = async (tokens: { access: string; refresh: string }) => {
  //   try {
  //     api.defaults.headers.common["Authorization"] = `Bearer ${tokens.access}`;
  //     const { data: userData } = await api.get("/api/users/me/");
  //     setAccessToken(tokens.access);
  //     setUser(userData);

  //     await SecureStore.setItemAsync("accessToken", tokens.access);
  //     await SecureStore.setItemAsync("refreshToken", tokens.refresh);

  //     // Đồng bộ Firebase Auth
  //     const { data: firebaseData } = await api.get(
  //       "/api/users/firebase-token/"
  //     );
  //     if (firebaseData.firebase_token) {
  //       await signInWithCustomToken(auth, firebaseData.firebase_token);
  //       console.log("✅ Signed in to Firebase successfully!");
  //     }
  //   } catch (e) {
  //     console.error("❌ Failed to sign in", e);
  //     await signOut(); // Dọn dẹp nếu lỗi
  //   }
  // };
  // THAY THẾ HÀM CŨ BẰNG HÀM NÀY
  const signIn = async (tokens: { access: string; refresh: string }) => {
    try {
      // ---- Phần xác thực với backend của bạn ----
      // Phần này vẫn giữ nguyên vì nó đã hoạt động tốt
      api.defaults.headers.common["Authorization"] = `Bearer ${tokens.access}`;
      const { data: userData } = await api.get("/api/users/me/");

      await SecureStore.setItemAsync("accessToken", tokens.access);
      await SecureStore.setItemAsync("refreshToken", tokens.refresh);

      // Cập nhật state chính để người dùng vào được app
      setAccessToken(tokens.access);
      setUser(userData);

      // ---- Phần đồng bộ Firebase được xử lý riêng ----
      // Chúng ta sẽ bọc riêng phần này trong một try...catch khác
      // để lỗi của nó không ảnh hưởng đến toàn bộ quá trình đăng nhập.
      try {
        const { data: firebaseData } = await api.get(
          "/api/users/firebase-token/"
        );

        if (firebaseData.firebase_token) {
          console.log("Attempting to sign in to Firebase...");
          await signInWithCustomToken(auth, firebaseData.firebase_token);
          console.log("✅ Signed in to Firebase successfully!");
        } else {
          console.warn("⚠️ Could not get Firebase token from backend.");
        }
      } catch (firebaseError) {
        // Nếu Firebase lỗi, chúng ta chỉ cảnh báo thay vì đăng xuất
        console.warn(
          "❌ Failed to sign in to Firebase. The main session is still active.",
          firebaseError
        );
        // BẠN CÓ THỂ HIỂN THỊ MỘT ALERT NHỎ Ở ĐÂY NẾU MUỐN
        // Alert.alert("Lỗi đồng bộ", "Không thể đăng nhập vào dịch vụ chat. Vui lòng thử lại sau.");
      }
    } catch (e) {
      // Catch này bây giờ chỉ bắt lỗi của backend (ví dụ: sai mật khẩu)
      console.error("❌ Failed to sign in to backend", e);
      await signOut(); // Dọn dẹp nếu lỗi từ backend
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setAccessToken(null);
      delete api.defaults.headers.common["Authorization"];
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("biometricEnabled");
      await AsyncStorage.removeItem("appLockEnabled");
      setIsBiometricEnabled(false);
      setIsAppLockEnabled(false);
    } catch (e) {
      console.error("❌ Failed to sign out", e);
    }
  };

  // ---------------- Context Value ----------------
  const value: AuthContextType = {
    accessToken,
    user,
    isLoading,
    signIn,
    signOut,
    isBiometricEnabled,
    enableBiometricAuth,
    signInWithBiometric,
    isAppLockEnabled,
    toggleAppLock,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook để dùng context
export const useAuth = () => useContext(AuthContext);
