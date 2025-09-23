import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SummaryData } from "../../navigation/types";

// Component con cho mỗi chỉ số so sánh
const ComparisonRow: React.FC<{
  label: string;
  value: string;
  color?: string;
}> = ({ label, value, color = "white" }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color }]}>{value}</Text>
  </View>
);

const ComparisonView: React.FC<{
  summary: SummaryData | null;
  isLoading: boolean;
}> = ({ summary, isLoading }) => {
  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 40 }} color="#A0FF00" />;
  }

  if (
    !summary ||
    summary.first_log_weight == null ||
    !summary.latest_log ||
    summary.weight_change == null
  ) {
    return (
      <Text style={styles.noticeText}>
        Cần ít nhất hai bản ghi tiến độ để so sánh.
      </Text>
    );
  }

  const { first_log_weight, latest_log, weight_change } = summary;
  const changeColor =
    weight_change > 0 ? "#A0FF00" : weight_change < 0 ? "#FF5A5F" : "white";

  return (
    <Animated.View style={styles.card} entering={FadeIn.duration(500)}>
      <Text style={styles.cardHeader}>So sánh Quá trình</Text>
      <ComparisonRow
        label="Cân nặng bắt đầu"
        value={`${first_log_weight.toFixed(1)} kg`}
      />
      <ComparisonRow
        label="Cân nặng hiện tại"
        value={`${latest_log.weight.toFixed(1)} kg`}
      />
      <ComparisonRow
        label="Thay đổi"
        value={`${weight_change > 0 ? "+" : ""}${weight_change.toFixed(1)} kg`}
        color={changeColor}
      />
      {/* Thêm các chỉ số so sánh khác ở đây (ví dụ: % mỡ) nếu có */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  cardHeader: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  label: { color: "#A0A0A0", fontSize: 16 },
  value: { color: "white", fontSize: 16, fontWeight: "bold" },
  noticeText: {
    color: "#A0A0A0",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
});

export default ComparisonView;
