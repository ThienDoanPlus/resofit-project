import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ManagerNavigationProp } from "../../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/api";
import { formatCurrency } from "../../utils/formatters";
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={28} color="#A0FF00" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

// Component Header chứa mọi thứ ở trên Grid
const DashboardHeader: React.FC<{ summaryData: any | null }> = ({
  summaryData,
}) => {
  const { user } = useAuth();

  return (
    <>
      <Text style={styles.welcomeTitle}>Chào, Quản lý {user?.username}!</Text>
      <View style={styles.statsContainer}>
        {/* Sử dụng dữ liệu động */}
        <StatCard
          title="Tổng Hội viên"
          value={String(summaryData?.total_members || 0)}
          icon="people-sharp"
        />
        <StatCard
          title="Doanh thu Tháng này"
          value={formatCurrency(summaryData?.revenue_this_month)}
          icon="cash-sharp"
        />
        <StatCard
          title="PT Hoạt động"
          value={String(summaryData?.active_pts || 0)}
          icon="barbell-sharp"
        />
        <StatCard
          title="Lịch hẹn chờ duyệt"
          value={String(summaryData?.pending_appointments || 0)}
          icon="time-sharp"
        />
      </View>

      <Text style={styles.sectionTitle}>Chức năng</Text>
    </>
  );
};

const ManagerDashboardScreen = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation<ManagerNavigationProp>();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/reports/dashboard-summary/");
      setSummaryData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard summary", error);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const menuItems = [
    {
      key: "packages",
      title: "Gói tập",
      icon: "pricetags-outline",
      screen: "ManagePackages",
    },
    {
      key: "members",
      title: "Hội viên",
      icon: "people-outline",
      screen: "ManageMembers",
    },
    {
      key: "staff",
      title: "Nhân viên",
      icon: "person-outline",
      screen: "ManageStaff",
    },
    {
      key: "reports",
      title: "Báo cáo",
      icon: "stats-chart-outline",
      screen: "Reports",
    },
  ];
  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        // Dữ liệu cho Grid
        data={menuItems}
        // Component Header
        ListHeaderComponent={<DashboardHeader summaryData={summaryData} />}
        // Render Grid
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              item.screen && navigation.navigate(item.screen as any)
            }
          >
            <Ionicons name={item.icon as any} size={32} color="white" />
            <Text style={styles.menuButtonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
        // Cấu hình Grid
        numColumns={2}
        keyExtractor={(item) => item.key}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        // Component Footer
        ListFooterComponent={
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    paddingTop: 20,
    paddingBottom: 20,
  },
  statsContainer: { marginBottom: 20 },
  statCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
  },
  statValue: { color: "white", fontSize: 24, fontWeight: "bold", marginTop: 8 },
  statTitle: { color: "#A0A0A0", fontSize: 14, marginTop: 4 },
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
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  menuButtonText: { color: "white", fontSize: 16, marginTop: 10 },
  logoutButton: {
    backgroundColor: "#A0FF00",
    borderRadius: 10,
    padding: 15,
    marginVertical: 30,
    alignItems: "center",
  },
  logoutButtonText: { color: "#121212", fontSize: 16, fontWeight: "bold" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});

export default ManagerDashboardScreen;
