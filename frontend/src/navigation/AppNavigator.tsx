import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  AppState,
  StyleSheet,
  AppStateStatus,
  Button,
  Alert,
} from "react-native";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import { NotificationBehavior } from "expo-notifications";
import {
  AuthStackParamList,
  ManagerStackParamList,
  MemberTabParamList,
  MemberStackParamList,
  PTStackParamList,
  RootStackParamList,
} from "./types";
import api from "../api/api";
import Constants from "expo-constants";

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
import ManageStaffScreen from "../screens/manager/ManageStaffScreen";
import ReportsScreen from "../screens/manager/ReportsScreen";
import ReminderScreen from "../screens/ReminderScreen";
import MemberDetailScreen from "../screens/pt/MemberDetailScreen";
import MemberBookingsScreen from "../screens/pt/MemberBookingsScreen";
import AssignPlanScreen from "../screens/pt/AssignPlanScreen";
import ChatListScreen_For_PT from "../screens/pt/ChatListScreen_For_PT";
// import AICoachScreen from "../screens/AICoachScreen";

const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const AuthStack = () => (
  <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
    <AuthStackNav.Screen name="Login" component={LoginScreen} />
    <AuthStackNav.Screen name="Register" component={RegisterScreen} />
  </AuthStackNav.Navigator>
);

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    } as NotificationBehavior),
});
// --- LUỒNG HỘI VIÊN (MEMBER) ---

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
        else if (route.name === "Reminder")
          iconName = focused ? "notifications" : "notifications-outline";
        else iconName = "alert-circle-outline";

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
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
      name="Reminder"
      component={ReminderScreen}
      options={{ title: "Nhắc nhở" }}
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
      animation: "fade_from_bottom",
    }}
  >
    <MemberStackNav.Screen name="MainTabs" component={MemberTabs} />
    <MemberStackNav.Screen name="PackageList" component={PackageListScreen} />
    <MemberStackNav.Screen
      name="Chat"
      component={ChatScreen}
      options={({ route }) => ({
        headerShown: true,

        title: route.params.chatPartner.username,

        headerStyle: {
          backgroundColor: "#1E1E1E",
        },
        headerTintColor: "#FFFFFF",
        headerTitleAlign: "center",
        headerBackTitleVisible: false,
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
        presentation: "modal",
        headerShown: true,
        title: "Cài đặt",
        headerStyle: { backgroundColor: "#1E1E1E" },
        headerTintColor: "white",
      }}
    />
    <MemberStackNav.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
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
      options={{ headerShown: false }}
    />
    <MemberStackNav.Screen
      name="ExerciseDetail"
      component={ExerciseDetailScreen}
      options={{
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
  <ManagerStackNav.Navigator screenOptions={{ headerShown: true }}>
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
    <ManagerStackNav.Screen name="ManageStaff" component={ManageStaffScreen} />
    <ManagerStackNav.Screen
      name="Reports"
      component={ReportsScreen}
      options={{ title: "Báo cáo" }}
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
    <PTStackNav.Screen name="MemberDetail" component={MemberDetailScreen} />
    <PTStackNav.Screen
      name="MemberBookings"
      component={MemberBookingsScreen}
      options={{ headerShown: true }}
    />
    <PTStackNav.Screen name="AssignPlan" component={AssignPlanScreen} />
    <PTStackNav.Screen
      name="ChatList_For_PT"
      component={ChatListScreen_For_PT}
      options={{ title: "Trò chuyện" }}
    />
    <PTStackNav.Screen name="Profile" component={ProfileScreen} />
    <PTStackNav.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ presentation: "modal" }}
    />
    <PTStackNav.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ presentation: "modal" }}
    />
    <PTStackNav.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ presentation: "modal" }}
    />
  </PTStackNav.Navigator>
);

// --- NAVIGATOR CHÍNH ---
const AppNavigator = () => {
  const { accessToken, isLoading, user, isAppLockEnabled } = useAuth();
  const [isAppLocked, setIsAppLocked] = useState(false);
  const appState = useRef(AppState.currentState);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useEffect(() => {
    const setupNotifications = async () => {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permission not granted to send notifications.");
        return;
      }

      if (accessToken) {
        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          if (!projectId) {
            console.error(
              "Project ID not found in app.json. Cannot get push token."
            );
            return;
          }

          const token = (
            await Notifications.getExpoPushTokenAsync({ projectId })
          ).data;
          console.log("My Expo Push Token:", token);

          if (token) {
            await api.post("/api/users/register-push-token/", {
              push_token: token,
            });
            console.log("✅ Push token successfully sent to server.");
          }
        } catch (error) {
          console.error("Failed to get or send push token", error);
        }
      }
    };

    setupNotifications();
  }, [accessToken]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (user && navigationRef.isReady() && data && data.screen) {
          const screenName = data.screen as string;
          let params: any = undefined;
          if (data.params && typeof data.params === "string") {
            try {
              params = JSON.parse(data.params);
            } catch (e) {
              console.error("Failed to parse notification params:", e);
              return;
            }
          }

          const screensInTabs: Array<keyof MemberTabParamList> = [
            "Home",
            "MyBookings",
            "Progress",
            "ChatList",
            "Profile",
            "Reminder",
            "WorkoutPlanList",
          ];

          if ((screensInTabs as string[]).includes(screenName)) {
            navigationRef.navigate("MainTabs", {
              screen: screenName as keyof MemberTabParamList,
              params: params,
            });
          } else if (
            screenName in (navigationRef.getRootState()?.routeNames || [])
          ) {
            navigationRef.navigate(screenName as any, params as any);
          } else {
            console.warn(
              `Unknown or inaccessible screen name in notification: ${screenName}`
            );
          }
        }
      }
    );

    return () => subscription.remove();
  }, [user]);
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (user && navigationRef.isReady() && data && data.screen) {
          const screenName = data.screen as string;
          let params: any = undefined;
          if (data.params && typeof data.params === "string") {
            try {
              params = JSON.parse(data.params);
            } catch (e) {
              console.error("Failed to parse notification params:", e);
              return;
            }
          }

          const screensInTabs: Array<keyof MemberTabParamList> = [
            "Home",
            "MyBookings",
            "Progress",
            "ChatList",
            "Profile",
            "Reminder",
            "WorkoutPlanList",
          ];

          if ((screensInTabs as string[]).includes(screenName)) {
            navigationRef.navigate("MainTabs", {
              screen: screenName as keyof MemberTabParamList,
              params: params,
            });
          } else if (
            screenName in (navigationRef.getRootState()?.routeNames || [])
          ) {
            navigationRef.navigate(screenName as any, params as any);
          } else {
            console.warn(
              `Unknown or inaccessible screen name in notification: ${screenName}`
            );
          }
        }
      }
    );

    return () => subscription.remove();
  }, [user]);
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
    <NavigationContainer ref={navigationRef}>
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
