import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";

import api from "../api/api";
import { MemberProfile } from "../navigation/types";
import PrimaryButton from "../screens/components/PrimaryButton";
import StyledInput from "../screens/components/StyledInput";

const ProfileSchema = Yup.object().shape({
  height: Yup.number()
    .positive("Chiều cao phải là số dương")
    .typeError("Chiều cao phải là một con số"),
  initial_weight: Yup.number()
    .positive("Cân nặng phải là số dương")
    .typeError("Cân nặng phải là một con số"),
  dob: Yup.date().typeError("Ngày sinh không hợp lệ"),
  goal: Yup.string(),
});

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [initialValues, setInitialValues] = useState<Partial<MemberProfile>>({
    height: "",
    initial_weight: "",
    goal: "",
    dob: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/users/profile/");
        const profileData = response.data;
        for (const key in profileData) {
          if (profileData[key] === null) {
            profileData[key] = "";
          }
        }
        setInitialValues(profileData);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải thông tin cá nhân.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (
    values: Partial<MemberProfile>,
    { setSubmitting }: any
  ) => {
    const dataToSubmit: any = {};
    for (const key in values) {
      dataToSubmit[key] =
        values[key as keyof MemberProfile] === ""
          ? null
          : values[key as keyof MemberProfile];
    }

    try {
      await api.post("/api/users/profile/", dataToSubmit);
      Alert.alert("Thành công", "Thông tin của bạn đã được cập nhật.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Formik
          initialValues={initialValues}
          validationSchema={ProfileSchema}
          onSubmit={handleUpdateProfile}
          enableReinitialize // Cho phép form cập nhật khi initialValues thay đổi
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
                label="Chiều cao (cm)"
                onChangeText={handleChange("height")}
                onBlur={handleBlur("height")}
                value={String(values.height)}
                keyboardType="numeric"
                error={errors.height}
                touched={touched.height}
              />
              <StyledInput
                label="Cân nặng ban đầu (kg)"
                onChangeText={handleChange("initial_weight")}
                onBlur={handleBlur("initial_weight")}
                value={String(values.initial_weight)}
                keyboardType="numeric"
                error={errors.initial_weight}
                touched={touched.initial_weight}
              />
              <StyledInput
                label="Ngày sinh (YYYY-MM-DD)"
                onChangeText={handleChange("dob")}
                onBlur={handleBlur("dob")}
                value={values.dob || ""}
                placeholder="VD: 2000-01-30"
                error={errors.dob}
                touched={touched.dob}
              />
              <StyledInput
                label="Mục tiêu tập luyện"
                onChangeText={handleChange("goal")}
                onBlur={handleBlur("goal")}
                value={values.goal || ""}
                multiline
                inputStyle={{
                  height: 120,
                  paddingTop: 15,
                  textAlignVertical: "top",
                }}
                error={errors.goal}
                touched={touched.goal}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  formContainer: { padding: 20 },
});

export default EditProfileScreen;
