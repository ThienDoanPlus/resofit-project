import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MemberNavigationProp, Booking } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/vi";
import api from "../api/api";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

// --- CHILD COMPONENTS ---

// Component cho thẻ Lịch hẹn sắp tới - ĐÃ NÂNG CẤP VỚI STATE LOADING
const UpcomingBookingCard: React.FC<{
  booking: Booking | null;
  navigation: MemberNavigationProp;
  isLoading: boolean;
}> = ({ booking, navigation, isLoading }) => {
  // Nếu đang tải, hiển thị một "khung xương" với ActivityIndicator
  if (isLoading) {
    return (
      <Animated.View
        style={[styles.card, styles.skeletonCard]}
        entering={FadeInDown.duration(600)}
      >
        <ActivityIndicator color="#A0FF00" />
      </Animated.View>
    );
  }

  if (!booking) {
    return (
      <Animated.View style={styles.card} entering={FadeInDown.duration(600)}>
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
          <Text style={styles.cardButtonText}>Đặt lịch ngay</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={styles.card} entering={FadeInDown.duration(600)}>
      <Text style={styles.cardTitle}>Lịch hẹn tiếp theo</Text>
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

// Component cho các thẻ truy cập nhanh
const QuickAccessCard: React.FC<{
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  delay: number;
}> = ({ title, subtitle, icon, onPress, delay }) => (
  <Animated.View entering={FadeInUp.duration(600).delay(delay)}>
    <TouchableOpacity style={styles.quickAccessCard} onPress={onPress}>
      <LinearGradient colors={["#2a2a2a", "#1E1E1E"]} style={styles.gradient}>
        <Ionicons name={icon} size={36} color="#A0FF00" />
        <Text style={styles.quickAccessTitle}>{title}</Text>
        <Text style={styles.quickAccessSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

// --- MAIN COMPONENT - ĐÃ NÂNG CẤP LOGIC LOADING ---

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MemberNavigationProp>();
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  // State loading riêng cho thẻ lịch hẹn
  const [bookingLoading, setBookingLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // Chỉ set loading cho phần dữ liệu tương ứng
    if (!bookingLoading) setBookingLoading(true);
    try {
      const bookingRes = await api.get("/api/gyms/upcoming-booking/");
      setUpcomingBooking(bookingRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setBookingLoading(false);
    }
  }, []);

  // Tải lại dữ liệu mỗi khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      // Chỉ gọi hàm fetchData bên trong
      fetchData();
    }, [fetchData]) // Phụ thuộc vào fetchData
  );
  // BÂY GIỜ KHÔNG CÒN MÀN HÌNH LOADING TOÀN TRANG NỮA
  // GIAO DIỆN SẼ RENDER NGAY LẬP TỨC

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          style={styles.header}
          entering={FadeInDown.duration(600)}
        >
          <View>
            <Text style={styles.welcomeText}>Chào mừng trở lại,</Text>
            <Text style={styles.userName}>{user?.username}</Text>
          </View>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${
                user?.username || "A"
              }&background=333&color=EFEFEF&bold=true`,
            }}
            style={styles.avatar}
          />
        </Animated.View>

        {/* Truyền trạng thái loading vào component card */}
        <UpcomingBookingCard
          booking={upcomingBooking}
          navigation={navigation}
          isLoading={bookingLoading}
        />

        <View style={styles.quickAccessContainer}>
          {/* <QuickAccessCard
            title="AI Coach"
            subtitle="Tập luyện thông minh"
            icon="camera-reverse-outline"
            onPress={() => navigation.navigate("AICoach")}
            delay={400}
          /> */}
          <QuickAccessCard
            title="Gói tập"
            subtitle="Khám phá & Gia hạn"
            icon="pricetags-outline"
            onPress={() => navigation.navigate("PackageList")}
            delay={500}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES - THÊM STYLE CHO SKELETON ---

const styles = StyleSheet.create({
  // ... (tất cả các style cũ giữ nguyên)
  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { color: "gray", fontSize: 18 },
  userName: { color: "white", fontSize: 28, fontWeight: "bold" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    marginTop: 20,
  },
  cardTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  cardSubtitle: { color: "#A0A0A0", fontSize: 16, marginBottom: 20 },
  cardButton: {
    backgroundColor: "#A0FF00",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  cardButtonText: { color: "#121212", fontSize: 16, fontWeight: "bold" },
  bookingInfo: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  bookingText: { color: "#EFEFEF", fontSize: 16, marginLeft: 12 },
  quickAccessContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickAccessCard: {
    borderRadius: 20,
    width: "48%",
    height: 180,
    overflow: "hidden",
  },
  gradient: { flex: 1, padding: 20, justifyContent: "space-between" },
  quickAccessTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  quickAccessSubtitle: { color: "#A0A0A0", fontSize: 13 },

  // THÊM STYLE MỚI
  skeletonCard: {
    justifyContent: "center",
    alignItems: "center",
    height: 190, // Chiều cao gần bằng card thật
  },
});

export default HomeScreen;
