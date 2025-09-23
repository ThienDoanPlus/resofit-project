import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import api from "../../api/api";
import axios from "axios";
import StyledInput from "../../screens/components/StyledInput";
import PrimaryButton from "../../screens/components/PrimaryButton";
import { useRoute, RouteProp } from "@react-navigation/native"; // Thêm useRoute
import { ManagerStackParamList } from "../../navigation/types"; // Import ParamList

const CreatePackageScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ManagerStackParamList, "EditPackage">>(); // Lấy route
  const { packageItem } = route.params; // Lấy dữ liệu gói tập cũ
  const [name, setName] = useState(packageItem.name);
  const [description, setDescription] = useState(packageItem.description || "");
  const [price, setPrice] = useState(String(packageItem.price));
  const [duration, setDuration] = useState(String(packageItem.duration));
  const [ptSessions, setPtSessions] = useState(String(packageItem.pt_sessions));
  const [loading, setLoading] = useState(false);

  const handleUpdatePackage = async () => {
    // Validate input
    if (!name || !price || !duration) {
      Alert.alert("Lỗi", "Tên, Giá và Thời hạn là bắt buộc.");
      return;
    }

    setLoading(true);
    try {
      const packageData = {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration, 10),
        pt_sessions: parseInt(ptSessions, 10) || 0,
      };
      await api.put(`/api/gyms/packages/${packageItem.id}/`, packageData);
      Alert.alert("Thành công", "Đã cập nhật gói tập.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật gói tập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Chỉnh sửa Gói tập</Text>

        <StyledInput
          label="Tên gói tập"
          value={name}
          onChangeText={setName}
          placeholder="VD: Gói tập 1 tháng"
        />

        <StyledInput
          label="Mô tả"
          value={description}
          onChangeText={setDescription}
          placeholder="Mô tả quyền lợi..."
          multiline
          style={{ height: 100, paddingTop: 15 }} // Có thể truyền style tùy chỉnh
        />

        <StyledInput
          label="Giá (VNĐ)"
          value={price}
          onChangeText={setPrice}
          placeholder="VD: 500000"
          keyboardType="numeric"
        />

        <StyledInput
          label="Thời hạn (số ngày)"
          value={duration}
          onChangeText={setDuration}
          placeholder="VD: 30"
          keyboardType="numeric"
        />

        <StyledInput
          label="Số buổi tập với PT"
          value={ptSessions}
          onChangeText={setPtSessions}
          placeholder="VD: 4 (mặc định là 0)"
          keyboardType="numeric"
        />

        <PrimaryButton
          title={loading ? "Đang lưu..." : "Lưu thay đổi"}
          onPress={handleUpdatePackage}
          loading={loading}
          style={{ marginHorizontal: 20, marginTop: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    padding: 20,
    textAlign: "center",
  },
});

export default CreatePackageScreen;
