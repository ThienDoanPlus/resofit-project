import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  MemberNavigationProp,
  Booking,
  Subscription,
  SummaryData,
  WaterLog,
  WorkoutProgressSummary,
} from "../navigation/types";
import "moment/locale/vi";
import api from "../api/api";
import Animated, { FadeInDown } from "react-native-reanimated";
import BmiCard from "./home_components/BmiCard";
import StatGridCard from "./home_components/StatGridCard";
import SubscriptionCard from "./home_components/SubscriptionCard";
import UpcomingBookingCard from "./home_components/UpcomingBookingCard";
import QuickAccessCard from "./home_components/QuickAccessCard";
import { UserWorkoutPlanAssignment } from "../navigation/types";
import AssignedPlanCard from "./home_components/AssignedPlanCard";
// import AICoachScreen from "../screens/AICoachScreen";

// --- MAIN COMPONENT  ---

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MemberNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [waterLog, setWaterLog] = useState<WaterLog | null>(null);
  const [workoutProgress, setWorkoutProgress] =
    useState<WorkoutProgressSummary | null>(null);
  const [assignedPlan, setAssignedPlan] =
    useState<UserWorkoutPlanAssignment | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [
        summaryRes,
        bookingRes,
        subscriptionRes,
        assignedPlanRes,
        waterRes,
        workoutRes,
      ] = await Promise.all([
        api.get("/api/tracking/summary/"),
        api.get("/api/gyms/upcoming-booking/"),
        api.get("/api/users/current-subscription/"),
        api.get("/api/workouts/my-assigned-plan/"),
        api.get("/api/tracking/daily-water/"),
        api.get("/api/workouts/progress-summary/"),
      ]);
      setSummaryData(summaryRes.data);
      setUpcomingBooking(bookingRes.data);
      setSubscription(subscriptionRes.data);
      setAssignedPlan(assignedPlanRes.data);
      setWaterLog(waterRes.data);
      setWorkoutProgress(workoutRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadAllData = async () => {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
      };
      loadAllData();
    }, [fetchData])
  );
  const handleAddWater = async () => {
    const amountToAdd = 250;
    try {
      const response = await api.post("/api/tracking/daily-water/", {
        amount: amountToAdd,
      });
      // Cập nhật lại state với dữ liệu mới từ server
      setWaterLog(response.data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật lượng nước.");
    }
  };
  const waterTarget = 3000;
  const waterProgress = waterLog
    ? Math.min(Math.round((waterLog.amount / waterTarget) * 100), 100)
    : 0;
  const waterDescription = `${waterLog?.amount || 0} / ${waterTarget} ml`;
  const workoutProgressPercent = workoutProgress?.progress_percent || 0;
  const workoutDescription = workoutProgress?.plan_name
    ? `Hoàn thành ${workoutProgress.completed_days}/${workoutProgress.total_days} ngày`
    : "Chưa có tiến độ";
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Animated.View
          style={styles.header}
          entering={FadeInDown.duration(500)}
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
        {assignedPlan && <AssignedPlanCard assignment={assignedPlan} />}
        {/* --- RENDER CÁC CARD LỚN --- */}
        <UpcomingBookingCard
          booking={upcomingBooking}
          navigation={navigation}
          isLoading={isLoading}
        />
        <SubscriptionCard
          subscription={subscription}
          isLoading={isLoading}
          navigation={navigation}
        />
        <BmiCard summary={summaryData} isLoading={isLoading} />

        {/* Grid Cards */}
        <Text style={styles.sectionTitle}>Hoạt động Hôm nay</Text>
        <View style={styles.gridContainer}>
          <StatGridCard
            title="Nước uống"
            value={waterProgress}
            description={waterDescription}
            icon="water-outline"
            delay={300}
            onPress={handleAddWater}
          />
          <StatGridCard
            title="Tập luyện"
            value={workoutProgressPercent}
            description={workoutDescription}
            icon="barbell-outline"
            delay={400}
            onPress={() =>
              navigation.navigate("MainTabs", { screen: "WorkoutPlanList" })
            }
          />
        </View>

        {/* --- RENDER CÁC CARD NHỎ --- */}
        <Text style={styles.sectionTitle}>Khám phá</Text>
        <View style={styles.gridContainer}>
          <QuickAccessCard
            title="AI Coach"
            subtitle="Tập luyện thông minh"
            icon="camera-reverse-outline"
            onPress={() => navigation.navigate("AICoach")}
            delay={300}
          />

          <QuickAccessCard
            title="Gói tập"
            subtitle="Gia hạn & Nâng cấp"
            icon="pricetags-outline" // Icon này rất phù hợp
            // Điều hướng thẳng đến PackageListScreen
            onPress={() => navigation.navigate("PackageList")}
            delay={400}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES - THÊM STYLE CHO SKELETON ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
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
    padding: 20,
    marginHorizontal: 20,
    marginTop: 15,
  },
  skeletonCard: { justifyContent: "center", alignItems: "center", height: 170 },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
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
  },
  cardButtonText: { color: "#121212", fontSize: 14, fontWeight: "bold" },
  bookingInfo: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  bookingText: { color: "#EFEFEF", fontSize: 16, marginLeft: 12 },
  packageName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  expiryLabel: { color: "gray", fontSize: 12 },
  expiryDate: { color: "white", fontSize: 14, fontWeight: "600" },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginHorizontal: 20,
    marginTop: 30,
  },
  quickAccessContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  quickAccessCard: {
    borderRadius: 20,
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
  }, // Sửa lại để nó nằm trong PressableScale
  gradient: { flex: 1, padding: 20, justifyContent: "space-between" },
  quickAccessTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  quickAccessSubtitle: { color: "#A0A0A0", fontSize: 13 },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default HomeScreen;
