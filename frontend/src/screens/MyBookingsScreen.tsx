import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/vi"; // Import ngôn ngữ tiếng Việt cho moment

import api from "../api/api";
import { Booking, MemberNavigationProp } from "../navigation/types";

// --- CHILD COMPONENTS ---

// Component để render mỗi item lịch hẹn
const BookingItem: React.FC<{ item: Booking }> = ({ item }) => {
  // Hàm để lấy style và text dựa trên trạng thái
  const getStatusStyle = () => {
    switch (item.status) {
      case "approved":
        return { text: "Đã xác nhận", color: "#A0FF00" };
      case "pending":
        return { text: "Chờ duyệt", color: "#FFD700" };
      case "cancelled":
        return { text: "Đã hủy", color: "#FF5A5F" };
      default:
        return { text: item.status, color: "gray" };
    }
  };
  const statusStyle = getStatusStyle();

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        {/* Hiển thị ngày tháng đầy đủ */}
        <Text style={styles.itemDay}>
          {moment(item.start_time).format("dddd, DD/MM/YYYY")}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusStyle.color }]}
        >
          <Text style={styles.statusText}>{statusStyle.text}</Text>
        </View>
      </View>
      <View style={styles.itemBody}>
        <Ionicons name="time-outline" size={20} color="white" />
        <Text style={styles.itemTime}>
          {moment(item.start_time).format("HH:mm")} -{" "}
          {moment(item.end_time).format("HH:mm")}
        </Text>
      </View>
      <View style={styles.itemBody}>
        <Ionicons
          name={item.pt ? "person-circle-outline" : "barbell-outline"}
          size={20}
          color="white"
        />
        <Text style={styles.itemPT}>
          {item.pt ? `Với PT: ${item.pt.username}` : "Tự tập"}
        </Text>
      </View>
    </View>
  );
};

// --- MAIN COMPONENT ---

const MyBookingsScreen = () => {
  const navigation = useNavigation<MemberNavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = useCallback(async () => {
    // Không setLoading(true) ở đây để useFocusEffect làm mới nền mượt hơn
    try {
      const response = await api.get("/api/gyms/bookings/");
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải lịch hẹn của bạn.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Không setLoading(true) ở đây để khi quay lại tab,
      // việc làm mới diễn ra một cách thầm lặng, mượt mà hơn.
      // Người dùng vẫn thấy dữ liệu cũ trong khi dữ liệu mới được tải.
      fetchMyBookings();
    }, [fetchMyBookings]) // Phụ thuộc vào fetchMyBookings
  );

  // Chỉ setLoading(true) cho lần tải ĐẦU TIÊN
  useEffect(() => {
    setLoading(true);
    fetchMyBookings();
  }, []);

  // Xử lý và nhóm dữ liệu cho SectionList, chỉ tính toán lại khi `bookings` thay đổi
  const sections = useMemo(() => {
    moment.locale("vi"); // Đặt ngôn ngữ cho moment
    const now = moment();

    // Sắp xếp lại để đảm bảo thứ tự đúng
    const sortedBookings = [...bookings].sort((a, b) =>
      moment(a.start_time).diff(moment(b.start_time))
    );

    const upcoming = sortedBookings.filter((b) =>
      moment(b.start_time).isSameOrAfter(now, "day")
    );
    const past = sortedBookings.filter((b) =>
      moment(b.start_time).isBefore(now, "day")
    );

    const data = [];
    // Hiển thị Sắp tới trước
    if (upcoming.length > 0)
      data.push({ title: "Lịch hẹn Sắp tới", data: upcoming });
    // Sắp xếp lịch đã qua theo thứ tự mới nhất -> cũ nhất
    if (past.length > 0)
      data.push({ title: "Lịch hẹn Đã qua", data: past.reverse() });

    return data;
  }, [bookings]);

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Nút Floating Action Button để tạo lịch mới */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CreateBooking")}
      >
        <Ionicons name="add" size={32} color="#121212" />
      </TouchableOpacity>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BookingItem item={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListHeaderComponent={<Text style={styles.title}>Lịch hẹn của tôi</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#333" />
            <Text style={styles.emptyText}>Bạn chưa có lịch hẹn nào.</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateBooking")}
            >
              <Text style={styles.emptyButtonText}>Đặt lịch ngay!</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#1E1E1E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    textTransform: "uppercase",
  },
  itemContainer: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2C",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemDay: { color: "white", fontSize: 16, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: {
    color: "#121212",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  itemBody: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  itemTime: { color: "#EFEFEF", fontSize: 14, marginLeft: 10 },
  itemPT: { color: "#A0A0A0", fontSize: 14, marginLeft: 10 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "30%",
  },
  emptyText: {
    color: "#A0A0A0",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  emptyButtonText: {
    color: "#A0FF00",
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#A0FF00",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 8,
  },
});

export default MyBookingsScreen;
