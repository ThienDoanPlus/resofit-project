import React from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";

import api from "../api/api";
import PrimaryButton from "../screens/components/PrimaryButton";
import StyledInput from "../screens/components/StyledInput";
import { useAuth } from "../context/AuthContext"; // <-- IMPORT useAuth

// Định nghĩa các quy tắc validation
const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Mật khẩu cũ là bắt buộc"),
  newPassword: Yup.string()
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
    .required("Mật khẩu mới là bắt buộc"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Mật khẩu xác nhận không khớp")
    .required("Xác nhận mật khẩu mới là bắt buộc"),
});

const ChangePasswordScreen = () => {
  const { signOut } = useAuth();

  const handleChangePassword = async (
    values: any,
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      await api.post("/api/users/change-password/", {
        old_password: values.oldPassword,
        new_password: values.newPassword,
      });

      Alert.alert(
        "Thành công",
        "Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại.",
        [
          {
            text: "OK",
            // KHI NHẤN OK, GỌI HÀM signOut
            onPress: () => signOut(),
          },
        ]
      );
    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        if (serverErrors.old_password) {
          setFieldError("oldPassword", serverErrors.old_password[0]);
        } else {
          Alert.alert("Lỗi", "Đã có lỗi xảy ra, vui lòng thử lại.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Formik
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          }}
          validationSchema={ChangePasswordSchema}
          onSubmit={handleChangePassword}
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
                label="Mật khẩu cũ"
                onChangeText={handleChange("oldPassword")}
                onBlur={handleBlur("oldPassword")}
                value={values.oldPassword}
                secureTextEntry
                error={errors.oldPassword}
                touched={touched.oldPassword}
              />
              <StyledInput
                label="Mật khẩu mới"
                onChangeText={handleChange("newPassword")}
                onBlur={handleBlur("newPassword")}
                value={values.newPassword}
                secureTextEntry
                error={errors.newPassword}
                touched={touched.newPassword}
              />
              <StyledInput
                label="Xác nhận mật khẩu mới"
                onChangeText={handleChange("confirmNewPassword")}
                onBlur={handleBlur("confirmNewPassword")}
                value={values.confirmNewPassword}
                secureTextEntry
                error={errors.confirmNewPassword}
                touched={touched.confirmNewPassword}
              />
              <PrimaryButton
                title="Lưu thay đổi"
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                style={{ marginTop: 20 }}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  formContainer: { padding: 20, paddingTop: 40 },
});

export default ChangePasswordScreen;
