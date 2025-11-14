import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RevenueChart from "../reports/components/RevenueChart";
import MemberChart from "../reports/components/MemberChart";

const ReportsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Báo cáo & Thống kê</Text>

        {/* Chúng ta sẽ đặt biểu đồ doanh thu ở đây */}
        <RevenueChart />
        <MemberChart />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  title: { fontSize: 28, fontWeight: "bold", color: "white", padding: 20 },
  chartContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  chartTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
});

export default ReportsScreen;
