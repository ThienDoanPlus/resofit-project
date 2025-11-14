import React, { useState } from "react";
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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigationProp } from "../navigation/types";
import api from "../api/api";
import axios from "axios";
import { Formik } from "formik";
import * as Yup from "yup";
import PrimaryButton from "../../src/screens/components/PrimaryButton";
import StyledInput from "../../src/screens/components/StyledInput";

// --- ĐỊNH NGHĨA SCHEMA VALIDATION BẰNG YUP ---
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Tên đăng nhập quá ngắn (tối thiểu 3 ký tự)")
    .max(20, "Tên đăng nhập quá dài (tối đa 20 ký tự)")
    .required("Tên đăng nhập là bắt buộc"),
  email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: Yup.string()
    .min(8, "Mật khẩu quá ngắn (tối thiểu 8 ký tự)")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

const RegisterScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();

  const handleRegister = async (
    values: any,
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      const response = await api.post("/api/users/register/", {
        username: values.username,
        email: values.email,
        password: values.password,
      });

      Alert.alert(
        "Đăng ký thành công",
        `Tài khoản ${response.data.username} đã được tạo. Vui lòng đăng nhập.`,
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const serverErrors = error.response.data;
        if (serverErrors.username) {
          setFieldError("username", serverErrors.username[0]);
        } else if (serverErrors.email) {
          setFieldError("email", serverErrors.email[0]);
        } else {
          Alert.alert(
            "Đăng ký thất bại",
            "Đã có lỗi xảy ra, vui lòng thử lại."
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Bắt đầu hành trình của bạn với RESOFIT
          </Text>

          {/* --- BỌC FORM BẰNG FORMIK --- */}
          <Formik
            initialValues={{
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View style={styles.formContainer}>
                <StyledInput
                  placeholder="Tên đăng nhập"
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                  value={values.username}
                  autoCapitalize="none"
                  error={errors.username}
                  touched={touched.username}
                />
                <StyledInput
                  placeholder="Email"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  touched={touched.email}
                />
                <StyledInput
                  placeholder="Mật khẩu"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  secureTextEntry
                  error={errors.password}
                  touched={touched.password}
                />
                <StyledInput
                  placeholder="Xác nhận mật khẩu"
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  secureTextEntry
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />

                <PrimaryButton
                  title="Đăng ký"
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                  style={{ marginTop: 10 }}
                />
              </View>
            )}
          </Formik>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.switchText}>
              Đã có tài khoản?{" "}
              <Text style={styles.switchTextBold}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: "#FF5A5F",
    fontSize: 12,
    marginLeft: 25,
    marginBottom: 10,
    marginTop: -10,
  },
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
    color: "#EFEFEF",
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
  switchButton: { marginTop: 20 },
  switchText: { color: "#A0A0A0", textAlign: "center", fontSize: 14 },
  switchTextBold: { color: "#A0FF00", fontWeight: "bold" },
});

export default RegisterScreen;
