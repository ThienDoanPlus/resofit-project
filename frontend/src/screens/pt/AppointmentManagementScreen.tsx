import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api/api";
import { Booking } from "../../navigation/types";
import PrimaryButton from "../components/PrimaryButton";

const AppointmentItem: React.FC<{ item: Booking; onUpdate: () => void }> = ({
  item,
  onUpdate,
}) => {
  const handleAction = async (action: "approve" | "reject") => {
    try {
      await api.post(`/api/gyms/bookings/${item.id}/${action}/`);
      Alert.alert(
        "Thành công",
        `Đã ${action === "approve" ? "chấp nhận" : "từ chối"} lịch hẹn.`
      );
      onUpdate();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật lịch hẹn.");
    }
  };

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>Hội viên: {item.member.username}</Text>
      <Text style={styles.itemDate}>
        Ngày: {new Date(item.start_time).toLocaleDateString("vi-VN")}
      </Text>
      <Text style={styles.itemDate}>
        Giờ:{" "}
        {new Date(item.start_time).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <Text
        style={[
          styles.status,
          {
            color:
              item.status === "pending"
                ? "#FFD700"
                : item.status === "approved"
                ? "#A0FF00"
                : "#FF5A5F",
          },
        ]}
      >
        Trạng thái: {item.status}
      </Text>
      {item.status === "pending" && (
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title="Chấp nhận"
            onPress={() => handleAction("approve")}
            style={styles.actionButton}
          />
          <PrimaryButton
            title="Từ chối"
            onPress={() => handleAction("reject")}
            style={[styles.actionButton, styles.rejectButton]}
            textStyle={styles.rejectButtonText}
          />
        </View>
      )}
    </View>
  );
};

const AppointmentManagementScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/gyms/bookings/");
      setBookings(response.data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách lịch hẹn.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await api.get("/api/gyms/bookings/");
          setBookings(response.data);
        } catch (error) {
          Alert.alert("Lỗi", "Không thể tải danh sách lịch hẹn.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  if (loading)
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Quản lý Lịch hẹn</Text>
      <FlatList
        data={bookings}
        renderItem={({ item }) => (
          <AppointmentItem item={item} onUpdate={fetchAppointments} />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có lịch hẹn nào.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", padding: 20 },
  itemContainer: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  itemName: { color: "white", fontSize: 18, fontWeight: "bold" },
  itemDate: { color: "#A0A0A0", fontSize: 14, marginTop: 5 },
  status: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    borderTopColor: "#333",
    borderTopWidth: 1,
    paddingTop: 15,
  },
  actionButton: { flex: 1, marginHorizontal: 5, height: 40 },
  rejectButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF5A5F",
  },
  rejectButtonText: { color: "#FF5A5F" },
  emptyText: { color: "#A0A0A0", textAlign: "center", marginTop: 50 },
});

export default AppointmentManagementScreen;
