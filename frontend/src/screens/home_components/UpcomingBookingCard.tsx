import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/vi";

import { Booking, MemberNavigationProp } from "../../navigation/types";

interface UpcomingBookingCardProps {
  booking: Booking | null;
  navigation: MemberNavigationProp;
  isLoading: boolean;
}

const UpcomingBookingCard: React.FC<UpcomingBookingCardProps> = ({
  booking,
  navigation,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Animated.View
        style={[styles.card, styles.skeletonCard]}
        entering={FadeInDown.duration(600).delay(100)}
      >
        <ActivityIndicator color="#A0FF00" />
      </Animated.View>
    );
  }

  // Trạng thái Chưa có Lịch hẹn
  if (!booking) {
    return (
      <Animated.View
        style={styles.card}
        entering={FadeInDown.duration(600).delay(100)}
      >
        <Text style={styles.cardTitle}>Không có lịch hẹn sắp tới</Text>
        <Text style={styles.cardSubtitle}>
          Giữ gìn vóc dáng, duy trì sức khỏe!
        </Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() =>
            navigation.navigate("MainTabs", { screen: "MyBookings" })
          }
        >
          <Text style={styles.cardButtonText}>Đặt lịch ngay!</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Trạng thái Có Lịch hẹn
  return (
    <Animated.View
      style={styles.card}
      entering={FadeInDown.duration(600).delay(100)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Lịch hẹn tiếp theo</Text>
        <Ionicons name="notifications-outline" size={22} color="#A0A0A0" />
      </View>
      <View style={styles.bookingInfo}>
        <Ionicons name="calendar-outline" size={22} color="#EFEFEF" />
        <Text style={styles.bookingText}>
          {moment(booking.start_time).format("dddd, DD/MM/YYYY")}
        </Text>
      </View>
      <View style={styles.bookingInfo}>
        <Ionicons name="time-outline" size={22} color="#EFEFEF" />
        <Text style={styles.bookingText}>
          {moment(booking.start_time).format("HH:mm")}
        </Text>
      </View>
      <View style={styles.bookingInfo}>
        <Ionicons name="person-outline" size={22} color="#EFEFEF" />
        <Text style={styles.bookingText}>
          {booking.pt ? `Với PT: ${booking.pt.username}` : "Tự tập"}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
  },
  skeletonCard: {
    justifyContent: "center",
    alignItems: "center",
    height: 170,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    color: "#A0A0A0",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 15,
  },
  cardButton: {
    backgroundColor: "#A0FF00",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  cardButtonText: {
    color: "#121212",
    fontSize: 14,
    fontWeight: "bold",
  },
  bookingInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bookingText: {
    color: "#EFEFEF",
    fontSize: 16,
    marginLeft: 12,
  },
});

export default UpcomingBookingCard;
