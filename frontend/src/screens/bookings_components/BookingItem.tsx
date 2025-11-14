import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/vi";

import { Booking } from "../../navigation/types";

interface BookingItemProps {
  item: Booking;
}

const BookingItem: React.FC<BookingItemProps> = ({ item }) => {
  moment.locale("vi");

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
        <Ionicons name="time-outline" size={20} color="#EFEFEF" />
        <Text style={styles.itemTime}>
          {moment(item.start_time).format("HH:mm")} -{" "}
          {moment(item.end_time).format("HH:mm")}
        </Text>
      </View>
      {/* Chỉ hiển thị dòng PT nếu có thông tin PT */}
      {item.pt && (
        <View style={styles.itemBody}>
          <Ionicons name={"person-circle-outline"} size={20} color="#EFEFEF" />
          <Text style={styles.itemPT}>Với PT: {item.pt.username}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemDay: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: "#121212",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  itemBody: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  itemTime: {
    color: "#EFEFEF",
    fontSize: 14,
    marginLeft: 10,
  },
  itemPT: {
    color: "#A0A0A0",
    fontSize: 14,
    marginLeft: 10,
  },
});

export default BookingItem;
