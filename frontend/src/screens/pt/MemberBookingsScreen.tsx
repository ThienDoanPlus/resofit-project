import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import "moment/locale/vi";

import api from "../../api/api";
import { PTStackParamList, Booking } from "../../navigation/types";

const BookingItem: React.FC<{ item: Booking }> = ({ item }) => {
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
        <Text style={styles.itemTime}>
          {moment(item.start_time).format("HH:mm")}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusStyle.color }]}
        >
          <Text style={styles.statusText}>{statusStyle.text}</Text>
        </View>
      </View>
      {item.pt && <Text style={styles.itemPT}>Với PT: {item.pt.username}</Text>}
    </View>
  );
};

const MemberBookingsScreen = () => {
  const route = useRoute<RouteProp<PTStackParamList, "MemberBookings">>();
  const { memberId, memberName } = route.params;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/gyms/bookings/?member_id=${memberId}`
      );
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch member bookings", error);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const sections = useMemo(() => {
    moment.locale("vi");
    const now = moment();
    const upcoming = bookings.filter((b) => moment(b.start_time).isAfter(now));
    const past = bookings.filter((b) => moment(b.start_time).isBefore(now));

    const data = [];
    if (upcoming.length > 0)
      data.push({ title: "Lịch hẹn Sắp tới", data: upcoming.reverse() });
    if (past.length > 0) data.push({ title: "Lịch hẹn Đã qua", data: past });
    return data;
  }, [bookings]);

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BookingItem item={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListHeaderComponent={
          <Text style={styles.title}>Lịch hẹn của {memberName}</Text>
        }
        ListEmptyComponent={
          <Text style={{ color: "gray", textAlign: "center", marginTop: 50 }}>
            Hội viên này chưa có lịch hẹn nào.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#1E1E1E",
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    marginBottom: 8,
  },
  itemTime: { color: "white", fontSize: 16, fontWeight: "bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: {
    color: "#121212",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  itemPT: { color: "#A0A0A0", fontSize: 14, marginTop: 4 },
});

export default MemberBookingsScreen;
