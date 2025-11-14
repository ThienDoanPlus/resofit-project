import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/vi";

import api from "../api/api";
import { Booking, MemberNavigationProp } from "../navigation/types";
import BookingItem from "../screens/bookings_components/BookingItem";

const MyBookingsScreen = () => {
  const navigation = useNavigation<MemberNavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = useCallback(async () => {
    try {
      const response = await api.get("/api/gyms/bookings/");
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await fetchMyBookings();
        setLoading(false);
      };
      loadData();
    }, [fetchMyBookings])
  );

  const sections = useMemo(() => {
    moment.locale("vi");
    const now = moment();
    const upcoming = bookings
      .filter((b) => moment(b.start_time).isSameOrAfter(now))
      .sort((a, b) => moment(a.start_time).diff(moment(b.start_time)));
    const past = bookings.filter((b) => moment(b.start_time).isBefore(now));

    const data = [];
    if (upcoming.length > 0)
      data.push({ title: "Lịch hẹn Sắp tới", data: upcoming });
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CreateBooking")}
      >
        <Ionicons name="add" size={32} color="#121212" />
      </TouchableOpacity>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BookingItem item={item} />} // Sử dụng component con
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
    textAlign: "center",
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
