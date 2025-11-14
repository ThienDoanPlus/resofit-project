import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

import {
  MemberStackParamList,
  MemberNavigationProp,
} from "../navigation/types";
import api from "../api/api";
import PrimaryButton from "../screens/components/PrimaryButton";
import StyledInput from "../screens/components/StyledInput";

interface PT {
  label: string;
  value: number;
}

const ConfirmBookingScreen = () => {
  const route = useRoute<RouteProp<MemberStackParamList, "ConfirmBooking">>();
  const navigation = useNavigation<MemberNavigationProp>();
  const { date, time } = route.params;

  const [pts, setPts] = useState<PT[]>([]);
  const [selectedPt, setSelectedPt] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPTs = async () => {
      try {
        //sử dụng API lấy danh sách nhân viên và lọc ra PT
        const response = await api.get("/api/users/staff/");
        const ptList = response.data
          .filter((staff: any) => staff.role === "pt")
          .map((pt: any) => ({
            label: pt.username,
            value: pt.id,
          }));
        setPts(ptList);
      } catch (error) {
        console.error("Failed to fetch PTs", error);
      }
    };
    fetchPTs();
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Kết hợp ngày và giờ thành một đối tượng Date hoàn chỉnh
      const startTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").toDate();
      const endTime = moment(startTime).add(1, "hour").toDate();

      const bookingData: {
        start_time: string;
        end_time: string;
        pt_id?: number | null;
        notes: string;
      } = {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        pt_id: selectedPt,
        notes: notes,
      };

      await api.post("/api/gyms/bookings/", bookingData);

      Alert.alert(
        "Thành công",
        selectedPt
          ? "Yêu cầu đặt lịch của bạn đã được gửi đến PT. Vui lòng chờ xác nhận."
          : "Bạn đã đặt lịch tự tập thành công!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo lịch hẹn. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Xác nhận Lịch hẹn</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={24} color="#A0FF00" />
            <Text style={styles.infoText}>
              Ngày: {moment(date).format("dddd, DD/MM/YYYY")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={24} color="#A0FF00" />
            <Text style={styles.infoText}>Giờ: {time}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Chọn Huấn luyện viên (tùy chọn)</Text>
          <RNPickerSelect
            onValueChange={(value) => setSelectedPt(value)}
            items={pts}
            placeholder={{ label: "Tự tập (Không chọn PT)", value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Ionicons name="chevron-down" size={24} color="gray" />}
          />

          <StyledInput
            label="Ghi chú (tùy chọn)"
            onChangeText={setNotes}
            value={notes}
            placeholder="Nhập ghi chú cho buổi tập..."
            multiline
            numberOfLines={4}
            inputStyle={{
              height: 120,
              paddingTop: 15,
              textAlignVertical: "top",
            }}
          />
        </View>

        <PrimaryButton
          title="Xác nhận & Đặt lịch"
          onPress={handleConfirm}
          loading={loading}
          style={{ marginHorizontal: 20, marginTop: 30 }}
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
  infoBox: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoText: { color: "white", fontSize: 18, marginLeft: 15 },
  formContainer: { paddingHorizontal: 20 },
  label: { color: "white", fontSize: 16, marginBottom: 10 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    color: "white",
    backgroundColor: "#1E1E1E",
    marginBottom: 20,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    color: "white",
    backgroundColor: "#1E1E1E",
    marginBottom: 20,
  },
  iconContainer: { top: 12, right: 15 },
});

export default ConfirmBookingScreen;
