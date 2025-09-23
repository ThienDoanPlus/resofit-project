import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  AppState,
  StyleSheet,
  AppStateStatus,
  Button,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";

// 1. Import ĐÚNG và ĐẦY ĐỦ các types từ file types.ts
import {
  AuthStackParamList,
  ManagerStackParamList,
  MemberTabParamList,
  MemberStackParamList,
  PTStackParamList, // <-- Đã thêm
} from "./types";

// 2. Import Context và các màn hình
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import BookingScreen from "../screens/BookingScreen";
import ProgressScreen from "../screens/ProgressScreen";
import ChatListScreen from "../screens/chat/ChatListScreen";
import PackageListScreen from "../screens/PackageListScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import ManagerDashboardScreen from "../screens/manager/ManagerDashboardScreen";
import ManagePackagesScreen from "../screens/manager/ManagePackagesScreen";
import CreatePackageScreen from "../screens/manager/CreatePackageScreen";
import PTDashboardScreen from "../screens/pt/PTDashboardScreen";
import PackageDetailScreen from "../screens/PackageDetailScreen";
import PaymentWebViewScreen from "../screens/PaymentWebViewScreen";
// import AICoachScreen from "../screens/AICoachScreen";
import MyMembersScreen from "../screens/pt/MyMembersScreen";
import AppointmentManagementScreen from "../screens/pt/AppointmentManagementScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ConfirmBookingScreen from "../screens/ConfirmBookingScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import WorkoutPlanListScreen from "../screens/workouts/WorkoutPlanListScreen";
import WorkoutPlanDetailScreen from "../screens/workouts/WorkoutPlanDetailScreen";
import ExerciseListScreen from "../screens/workouts/ExerciseListScreen";
import ExerciseDetailScreen from "../screens/workouts/ExerciseDetailScreen";
import WorkoutSessionScreen from "../screens/workouts/WorkoutSessionScreen";
import EditPackageScreen from "../screens/manager/EditPackageScreen";
import ManageMembersScreen from "../screens/manager/ManageMembersScreen";

// --- LUỒNG XÁC THỰC ---
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const AuthStack = () => (
  <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
    <AuthStackNav.Screen name="Login" component={LoginScreen} />
    <AuthStackNav.Screen name="Register" component={RegisterScreen} />
  </AuthStackNav.Navigator>
);

// --- LUỒNG HỘI VIÊN (MEMBER) ---

// 4. SỬA LẠI KHAI BÁO NÀY: Dùng MemberTabParamList cho Tab Navigator
const Tab = createBottomTabNavigator<MemberTabParamList>();

const MemberTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#A0FF00",
      tabBarInactiveTintColor: "gray",
      tabBarShowLabel: true,

      tabBarStyle: {
        backgroundColor: "#1E1E1E",
        borderTopWidth: 0,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;
        if (route.name === "Home") iconName = focused ? "home" : "home-outline";
        else if (route.name === "MyBookings")
          iconName = focused ? "calendar" : "calendar-outline";
        else if (route.name === "Progress")
          iconName = focused ? "analytics" : "analytics-outline";
        else if (route.name === "ChatList")
          iconName = focused ? "chatbubbles" : "chatbubbles-outline";
        else if (route.name === "Profile")
          iconName = focused ? "person-circle" : "person-circle-outline";
        else if (route.name === "WorkoutPlanList")
          iconName = focused ? "barbell" : "barbell-outline";
        else iconName = "alert-circle-outline";

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    {/* Các Tab.Screen này bây giờ hoàn toàn hợp lệ với MemberTabParamList */}
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: "Trang chủ" }}
    />
    <Tab.Screen
      name="WorkoutPlanList"
      component={WorkoutPlanListScreen}
      options={{ title: "Tập luyện" }}
    />
    <Tab.Screen
      name="MyBookings"
      component={MyBookingsScreen}
      options={{ title: "Lịch hẹn" }}
    />
    <Tab.Screen
      name="Progress"
      component={ProgressScreen}
      options={{ title: "Tiến độ" }}
    />
    <Tab.Screen
      name="ChatList"
      component={ChatListScreen}
      options={{ title: "Trò chuyện" }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: "Hồ sơ" }}
    />
  </Tab.Navigator>
);

const MemberStackNav = createNativeStackNavigator<MemberStackParamList>();
const MemberStack = () => (
  <MemberStackNav.Navigator
    screenOptions={{
      headerShown: false,
      animation: "fade_from_bottom", // Hiệu ứng mờ và trượt nhẹ từ dưới
    }}
  >
    <MemberStackNav.Screen name="MainTabs" component={MemberTabs} />
    <MemberStackNav.Screen name="PackageList" component={PackageListScreen} />
    <MemberStackNav.Screen
      name="Chat"
      component={ChatScreen}
      options={({ route }) => ({
        // Bật lại header cho riêng màn hình này
        headerShown: true,

        // Lấy tên từ params và đặt làm tiêu đề
        title: route.params.chatPartner.username,

        // Style cho header
        headerStyle: {
          backgroundColor: "#1E1E1E", // Màu nền nhất quán
        },
        headerTintColor: "#FFFFFF", // Màu của chữ tiêu đề và nút Back
        headerTitleAlign: "center", // Căn giữa tiêu đề
        headerBackTitleVisible: false, // Ẩn chữ "Back" trên iOS
      })}
    />
    {/* <MemberStackNav.Screen name="AICoach" component={AICoachScreen} /> */}
    <MemberStackNav.Screen
      name="CreateBooking"
      component={BookingScreen}
      options={{
        presentation: "modal",
        headerShown: true,
        title: "Tạo Lịch hẹn",
        headerStyle: { backgroundColor: "#1E1E1E" },
        headerTintColor: "white",
      }}
    />
    <MemberStackNav.Screen
      name="ConfirmBooking"
      component={ConfirmBookingScreen}
      options={{
        presentation: "modal",
        headerShown: true,
        title: "Xác nhận",
        headerStyle: { backgroundColor: "#1E1E1E" },
        headerTintColor: "white",
      }}
    />
    <MemberStackNav.Screen
      name="PackageDetail"
      component={PackageDetailScreen}
    />
    <MemberStackNav.Screen
      name="PaymentWebView"
      component={PaymentWebViewScreen}
    />
    <MemberStackNav.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        // Sử dụng hiệu ứng modal chuẩn của nền tảng
        presentation: "modal",
        headerShown: true, // Bật header cho màn hình modal
        title: "Cài đặt",
        headerStyle: { backgroundColor: "#1E1E1E" },
        headerTintColor: "white",
      }}
    />
    <MemberStackNav.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      // Thêm options để có header đẹp
      options={{
        presentation: "modal",
        title: "Đổi mật khẩu",
        headerShown: true,
        headerStyle: { backgroundColor: "#1E1E1E" },
        headerTintColor: "white",
      }}
    />
    <MemberStackNav.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{
        presentation: "modal",
        headerShown: true,
        title: "Chỉnh sửa Hồ sơ",
        headerStyle: { backgroundColor: "#1E1E1E" },
        headerTintColor: "white",
      }}
    />
    <MemberStackNav.Screen
      name="WorkoutPlanDetail"
      component={WorkoutPlanDetailScreen}
    />
    <MemberStackNav.Screen
      name="ExerciseList"
      component={ExerciseListScreen}
      // Tắt header mặc định vì chúng ta đã có header tùy chỉnh
      options={{ headerShown: false }}
    />
    <MemberStackNav.Screen
      name="ExerciseDetail"
      component={ExerciseDetailScreen}
      options={{
        // Sử dụng hiệu ứng modal để nó trượt lên
        presentation: "modal",
        headerShown: false,
      }}
    />
    <MemberStackNav.Screen
      name="WorkoutSession"
      component={WorkoutSessionScreen}
      options={{ headerShown: false }}
    />
  </MemberStackNav.Navigator>
);

// --- LUỒNG QUẢN LÝ (MANAGER) ---
const ManagerStackNav = createNativeStackNavigator<ManagerStackParamList>();
const ManagerStack = () => (
  <ManagerStackNav.Navigator screenOptions={{ headerShown: false }}>
    <ManagerStackNav.Screen
      name="ManagerDashboard"
      component={ManagerDashboardScreen}
    />
    <ManagerStackNav.Screen
      name="ManagePackages"
      component={ManagePackagesScreen}
    />
    <ManagerStackNav.Screen
      name="CreatePackage"
      component={CreatePackageScreen}
    />
    <ManagerStackNav.Screen name="EditPackage" component={EditPackageScreen} />
    <ManagerStackNav.Screen
      name="ManageMembers"
      component={ManageMembersScreen}
    />
  </ManagerStackNav.Navigator>
);

// --- LUỒNG PT ---
const PTStackNav = createNativeStackNavigator<PTStackParamList>();
const PTStack = () => (
  <PTStackNav.Navigator>
    <PTStackNav.Screen name="PTDashboard" component={PTDashboardScreen} />
    <PTStackNav.Screen name="MyMembers" component={MyMembersScreen} />
    <PTStackNav.Screen name="MemberProgress" component={ProgressScreen} />
    <PTStackNav.Screen
      name="ManageAppointments"
      component={AppointmentManagementScreen}
    />
  </PTStackNav.Navigator>
);

// --- NAVIGATOR CHÍNH ---
const AppNavigator = () => {
  const { accessToken, isLoading, user, isAppLockEnabled } = useAuth();
  const [isAppLocked, setIsAppLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          if (accessToken && isAppLockEnabled) {
            setIsAppLocked(true);
          }
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [accessToken, isAppLockEnabled]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
      >
        <ActivityIndicator size="large" color="#A0FF00" />
      </View>
    );
  }
  if (isAppLocked) {
    return (
      <View style={styles.lockScreen}>
        <Text style={styles.lockText}>Resofit is Locked</Text>
        <Button
          title="Unlock with Biometrics"
          onPress={async () => {
            const { success } = await LocalAuthentication.authenticateAsync();
            if (success) {
              setIsAppLocked(false);
            }
          }}
          color="#A0FF00"
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {accessToken && user ? (
        <>
          {user.role === "manager" && <ManagerStack />}
          {user.role === "pt" && <PTStack />}
          {user.role === "member" && <MemberStack />}
        </>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  lockScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  lockText: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
});

export default AppNavigator;
