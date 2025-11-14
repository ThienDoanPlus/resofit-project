import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, LocaleConfig, DateData } from "react-native-calendars";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import api from "../api/api";
import { Booking, MemberNavigationProp } from "../navigation/types";
import moment from "moment";

// ---------------- Cấu hình tiếng Việt cho Calendar ----------------
LocaleConfig.locales["vi"] = {
  monthNames: [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ],
  monthNamesShort: [
    "Th.1",
    "Th.2",
    "Th.3",
    "Th.4",
    "Th.5",
    "Th.6",
    "Th.7",
    "Th.8",
    "Th.9",
    "Th.10",
    "Th.11",
    "Th.12",
  ],
  dayNames: [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ],
  dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
};
LocaleConfig.defaultLocale = "vi";

// ---------------- Component chính ----------------
const BookingScreen = () => {
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<Record<string, any>>({});
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const navigation = useNavigation<MemberNavigationProp>(); // Thêm
  const [pressedSlot, setPressedSlot] = useState<string | null>(null);

  // Fetch các lịch đã đặt trong tháng
  const fetchBookedSlots = async (date: Date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const response = await api.get(
        `/api/gyms/booked-slots/?year=${year}&month=${month}`
      );

      const bookings: Booking[] = response.data || [];
      const marked: Record<string, any> = {};

      bookings.forEach((booking) => {
        const dateString = moment(booking.start_time).format("YYYY-MM-DD");
        marked[dateString] = { marked: true, dotColor: "#A0FF00" };
      });

      setBookedDates(marked);
    } catch (error) {
      console.error("❌ Failed to fetch booked slots", error);
      setBookedDates({});
    }
  };

  // Fetch khung giờ trống
  const fetchAvailableSlots = async (dateString: string) => {
    setLoadingSlots(true);
    try {
      const response = await api.get(
        `/api/gyms/available-slots/?date=${dateString}`
      );
      const slots = Array.isArray(response.data) ? response.data : [];
      setAvailableSlots(slots);
    } catch (error) {
      console.error("❌ Failed to fetch available slots", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch lại khi màn hình được focus hoặc tháng thay đổi
  useFocusEffect(
    React.useCallback(() => {
      fetchBookedSlots(currentMonth);
    }, [currentMonth])
  );

  // Fetch khung giờ khi chọn ngày
  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const onMonthChange = (month: any) => {
    setCurrentMonth(new Date(month.timestamp));
  };

  const markedDates = useMemo(() => {
    return {
      ...bookedDates,
      [selectedDate]: {
        selected: true,
        selectedColor: "#A0FF00",
        disableTouchEvent: true,
      },
    };
  }, [bookedDates, selectedDate]);

  const handleSlotPress = (slot: string) => {
    setPressedSlot(slot); // Đặt trạng thái nhấn
    setTimeout(() => {
      navigation.navigate("ConfirmBooking", { date: selectedDate, time: slot });
      setPressedSlot(null); // Reset lại trạng thái sau khi điều hướng
    }, 100); // Delay 100ms
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Đặt Lịch Tập</Text>
      <Calendar
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        theme={{
          backgroundColor: "#121212",
          calendarBackground: "#121212",
          textSectionTitleColor: "#A0A0A0",
          selectedDayBackgroundColor: "#A0FF00",
          selectedDayTextColor: "#121212",
          todayTextColor: "#A0FF00",
          dayTextColor: "#FFFFFF",
          textDisabledColor: "#444444",
          arrowColor: "#A0FF00",
          monthTextColor: "white",
        }}
      />
      <View style={styles.slotsContainer}>
        <Text style={styles.slotsTitle}>
          Khung giờ trống ngày {moment(selectedDate).format("DD/MM")}
        </Text>
        {loadingSlots ? (
          <ActivityIndicator color="#A0FF00" />
        ) : (
          <FlatList
            data={availableSlots}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isPressed = pressedSlot === item;
              return (
                <TouchableOpacity
                  style={[styles.slotItem, isPressed && styles.slotItemPressed]}
                  onPress={() => handleSlotPress(item)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      isPressed && styles.slotTextPressed,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptySlotsText}>
                Không có khung giờ trống.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  // ---- Main Container ----
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },

  // ---- Header ----
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  // ---- Slots Section ----
  slotsContainer: {
    flex: 1,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 20,
  },
  slotsTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 20,
  },

  // ---- Slot Item ----
  slotItem: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  slotItemPressed: {
    backgroundColor: "#A0FF00",
    borderColor: "#A0FF00",
  },
  slotText: {
    color: "#EFEFEF",
    fontSize: 16,
    fontWeight: "bold",
  },
  slotTextPressed: {
    color: "#121212",
  },

  // ---- Empty State ----
  emptySlotsText: {
    color: "#666",
    fontStyle: "italic",
    paddingHorizontal: 20,
  },
});

export default BookingScreen;
