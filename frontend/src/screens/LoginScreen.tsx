import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigationProp } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import axios from "axios"; // Vẫn cần để dùng isAxiosError
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { AntDesign } from "@expo/vector-icons";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBiometric, setLoadingBiometric] = useState(false);
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId:
      "122357155565-pe48e4knf6gdddh05n7u97ghmnc0nmv9.apps.googleusercontent.com",
    // androidClientId:
    //   "122357155565-i4crkn55rsanilh1taqk0889fcm7ibeb.apps.googleusercontent.com",
    webClientId:
      "122357155565-10d28o6r6c2uje6vs1koofsvq9g295le.apps.googleusercontent.com",
  });
  const navigation = useNavigation<AuthNavigationProp>();

  // Gộp lại thành 1 lần gọi useAuth() duy nhất
  const {
    signIn,
    enableBiometricAuth,
    isBiometricEnabled,
    signInWithBiometric,
  } = useAuth();

  // Kiểm tra xem thiết bị có phần cứng sinh trắc học không khi component mount
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setHasBiometricHardware(compatible);
    })();
  }, []);

  const askToEnableBiometrics = () => {
    // Chỉ hỏi nếu thiết bị có hỗ trợ và tính năng chưa được bật
    if (hasBiometricHardware && !isBiometricEnabled) {
      Alert.alert(
        "Đăng nhập nhanh hơn",
        "Bạn có muốn sử dụng Vân tay/Face ID cho lần đăng nhập sau không?",
        [
          { text: "Để sau", style: "cancel" },
          { text: "OK", onPress: () => enableBiometricAuth() },
        ]
      );
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Lỗi", "Vui lòng điền tên đăng nhập và mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(`/api/token/`, {
        username: username,
        password: password,
      });

      await signIn(response.data);

      // Hỏi sau khi đã đăng nhập thành công
      // (signIn sẽ điều hướng, nên câu hỏi này có thể không hiện kịp)
      // Chúng ta sẽ chuyển nó sang màn hình Home ở bước sau để trải nghiệm tốt hơn
      // askToEnableBiometrics();
    } catch (error) {
      let errorMessage = "Đã có lỗi xảy ra, vui lòng thử lại.";
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "SERVER ERROR:",
          JSON.stringify(error.response.data, null, 2)
        );
        errorMessage = "Tên đăng nhập hoặc mật khẩu không đúng.";
      } else {
        console.error("NETWORK/UNEXPECTED ERROR:", error);
        errorMessage = "Không thể kết nối đến máy chủ.";
      }
      Alert.alert("Đăng nhập thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoadingBiometric(true);
    await signInWithBiometric();
    // Không cần setLoadingBiometric(false) vì nếu thành công, app sẽ chuyển màn hình
    // Nếu thất bại, hàm trong context đã hiện Alert, ta set lại state để người dùng có thể thử lại
    setLoadingBiometric(false);
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      // Gửi id_token này lên server
      handleGoogleLogin(id_token);
    }
  }, [response]);
  const handleGoogleLogin = async (idToken: string) => {
    try {
      // Gọi API mới trên server Django
      const serverResponse = await api.post("/api/users/google-login/", {
        id_token: idToken,
      });
      await signIn(serverResponse.data);
    } catch (error) {
      Alert.alert("Lỗi", "Đăng nhập bằng Google thất bại.");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <Text style={styles.title}>Chào mừng trở lại</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.switchText}>
                Chưa có tài khoản?{" "}
                <Text style={styles.switchTextBold}>Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => promptAsync()}
              disabled={!request}
            >
              <AntDesign name="google" size={24} color="black" />
              <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
            </TouchableOpacity>

            {/* HIỂN THỊ NÚT NẾU TÍNH NĂNG ĐƯỢC BẬT VÀ PHẦN CỨNG HỖ TRỢ */}
            {isBiometricEnabled && hasBiometricHardware && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={loadingBiometric}
              >
                {loadingBiometric ? (
                  <ActivityIndicator color="#A0FF00" />
                ) : (
                  <Ionicons name="finger-print" size={32} color="#A0FF00" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  keyboardAvoidingContainer: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0A0",
    textAlign: "center",
    marginBottom: 40,
  },
  formContainer: { width: "100%" },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333333",
  },
  button: {
    backgroundColor: "#A0FF00",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#121212", fontSize: 18, fontWeight: "bold" },

  // Style cho phần dưới form
  footerContainer: {
    marginTop: 20,
    alignItems: "center", // Căn giữa tất cả item trong footer
  },
  switchButton: {
    // không cần margin top nữa vì đã có trong footer
  },
  switchText: { color: "#A0A0A0", textAlign: "center", fontSize: 14 },
  switchTextBold: { color: "#A0FF00", fontWeight: "bold" },

  // Style cho nút sinh trắc học
  biometricButton: {
    marginTop: 30, // Thêm khoảng cách với dòng text ở trên
    padding: 15,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#333333",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF", // Màu nền trắng
    height: 50,
    borderRadius: 10,
    marginTop: 15,
    marginHorizontal: 20, // Để nó khớp với chiều rộng của các input
  },
  googleButtonText: {
    color: "#000000", // Chữ màu đen
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default LoginScreen;
