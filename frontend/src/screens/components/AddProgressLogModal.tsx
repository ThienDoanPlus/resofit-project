import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import api from "../../api/api";
import PrimaryButton from "../../screens/components/PrimaryButton";
import StyledInput from "../../screens/components/StyledInput";

// Định nghĩa các props mà component này sẽ nhận từ component cha
interface Props {
  isVisible: boolean;
  onClose: () => void;
  onLogAdded: () => void; // Hàm callback để báo cho cha biết đã thêm thành công
  memberId: number;
}

const AddProgressLogModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onLogAdded,
  memberId,
}) => {
  const [date, setDate] = useState(new Date());
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hàm reset state khi modal đóng lại
  const handleClose = () => {
    setWeight("");
    setBodyFat("");
    setDate(new Date());
    onClose();
  };

  const handleSubmit = async () => {
    if (!weight || !date) {
      Alert.alert("Lỗi", "Ngày và Cân nặng là bắt buộc.");
      return;
    }
    setLoading(true);
    try {
      const logData = {
        member_id: memberId,
        date: date.toISOString().split("T")[0], // Format YYYY-MM-DD
        weight: parseFloat(weight),
        body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
      };
      await api.post("/api/tracking/logs/", logData);

      Alert.alert("Thành công", "Đã thêm bản ghi tiến độ.");
      onLogAdded(); // Gọi callback để component cha tải lại dữ liệu
      handleClose(); // Đóng modal và reset form
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.date) {
        Alert.alert(
          "Lỗi",
          "Đã có bản ghi cho ngày này. Vui lòng chọn ngày khác."
        );
      } else {
        Alert.alert("Lỗi", "Không thể thêm bản ghi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Thêm Bản ghi Tiến độ</Text>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setDatePickerVisibility(true)}
          >
            <Text style={styles.datePickerLabel}>Ngày ghi nhận</Text>
            <Text style={styles.datePickerText}>
              {date.toLocaleDateString("vi-VN")}
            </Text>
          </TouchableOpacity>

          <StyledInput
            label="Cân nặng (kg)"
            value={weight}
            onChangeText={setWeight}
            placeholder="VD: 70.5"
            keyboardType="numeric"
            containerStyle={{ width: "100%" }}
          />

          <StyledInput
            label="Tỷ lệ mỡ (%) (Tùy chọn)"
            value={bodyFat}
            onChangeText={setBodyFat}
            placeholder="VD: 15"
            keyboardType="numeric"
            containerStyle={{ width: "100%" }}
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Lưu lại"
              onPress={handleSubmit}
              loading={loading}
              style={{ flex: 1 }}
            />
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={date}
        onConfirm={(selectedDate) => {
          setDate(selectedDate);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        confirmTextIOS="Chọn"
        cancelTextIOS="Huỷ"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 25,
    textAlign: "center",
  },
  datePickerButton: {
    width: "100%",
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  datePickerLabel: { color: "#A0A0A0", fontSize: 12 },
  datePickerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },
  cancelButton: { marginLeft: 10, padding: 15 },
  cancelButtonText: { color: "#A0A0A0", fontSize: 16 },
});

export default AddProgressLogModal;
