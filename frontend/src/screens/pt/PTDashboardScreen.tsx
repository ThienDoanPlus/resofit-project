import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { PTNavigationProp } from "../../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/api";
import PressableScale from "../../screens/components/PressableScale";

// --- CHILD COMPONENTS  ---
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = ({ title, value, icon }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={24} color="#A0FF00" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

// --- MAIN COMPONENT ---
const PTDashboardScreen = () => {
  const { signOut, user } = useAuth();
  const navigation = useNavigation<PTNavigationProp>();

  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get("/api/pts/dashboard-summary/");
      setSummaryData(response.data);
    } catch (error) {
      console.error("Failed to fetch PT dashboard summary", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await fetchData();
        setLoading(false);
      };

      loadData();
    }, [fetchData])
  );
  const menuItems = [
    {
      key: "appointments",
      title: "Lịch hẹn",
      icon: "calendar-outline",
      screen: "ManageAppointments",
    },
    {
      key: "members",
      title: "Hội viên",
      icon: "people-outline",
      screen: "MyMembers",
    },
    {
      key: "chat",
      title: "Trò chuyện",
      icon: "chatbubbles-outline",
      screen: "ChatList_For_PT",
    },
    {
      key: "profile",
      title: "Hồ sơ",
      icon: "person-circle-outline",
      screen: "Profile",
    },
  ];

  const Header = () => (
    <>
      <Text style={styles.welcomeTitle}>Chào, {user?.username}!</Text>
      <View style={styles.statsContainer}>
        <StatCard
          title="Lịch hẹn hôm nay"
          value={String(summaryData?.appointments_today || 0)}
          icon="today-outline"
        />
        <StatCard
          title="Yêu cầu mới"
          value={String(summaryData?.pending_requests || 0)}
          icon="notifications-outline"
        />
        <StatCard
          title="Số hội viên"
          value={String(summaryData?.active_members || 0)}
          icon="body-outline"
        />
      </View>
      <Text style={styles.sectionTitle}>Chức năng</Text>
    </>
  );

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={menuItems}
        ListHeaderComponent={<Header />}
        renderItem={({ item }) => (
          <PressableScale
            style={styles.menuButton}
            onPress={() =>
              item.screen && navigation.navigate(item.screen as any)
            }
          >
            <Ionicons name={item.icon as any} size={32} color="white" />
            <Text style={styles.menuButtonText}>{item.title}</Text>
          </PressableScale>
        )}
        numColumns={2}
        keyExtractor={(item) => item.key}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListFooterComponent={
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color="#FF5A5F" />
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    paddingTop: 20,
    paddingBottom: 20,
  },
  statsContainer: { marginBottom: 20 },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  statValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
    flex: 1,
  },
  statTitle: { color: "#A0A0A0", fontSize: 14 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    marginTop: 10,
  },
  menuButton: {
    backgroundColor: "#1E1E1E",
    width: "48%",
    aspectRatio: 1.1,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  menuButtonText: { color: "white", fontSize: 16, marginTop: 10 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    padding: 15,
    marginVertical: 30,
  },
  logoutButtonText: {
    color: "#FF5A5F",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default PTDashboardScreen;
