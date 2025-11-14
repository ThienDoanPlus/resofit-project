import React, { createContext, useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { signInWithCustomToken } from "firebase/auth";
import api from "../api/api";
import { auth } from "../firebase/firebaseConfig";
import { User } from "../navigation/types";

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

  const signIn = async (tokens: { access: string; refresh: string }) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${tokens.access}`;
      const { data: userData } = await api.get("/api/users/me/");

      await SecureStore.setItemAsync("accessToken", tokens.access);
      await SecureStore.setItemAsync("refreshToken", tokens.refresh);

      setAccessToken(tokens.access);
      setUser(userData);

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
        console.warn(
          "❌ Failed to sign in to Firebase. The main session is still active.",
          firebaseError
        );
      }
    } catch (e) {
      console.error("❌ Failed to sign in to backend", e);
      await signOut();
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

export const useAuth = () => useContext(AuthContext);
