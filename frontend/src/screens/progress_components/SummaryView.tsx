import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { SummaryData, MemberNavigationProp } from "../../navigation/types";
import { Ionicons } from "@expo/vector-icons";

interface SummaryViewProps {
  summary: SummaryData | null;
  isLoading: boolean;
  advice: { diet_advice: string; workout_advice: string } | null;
  loadingAdvice: boolean;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  summary,
  isLoading,
  advice,
  loadingAdvice,
}) => {
  const navigation = useNavigation<MemberNavigationProp>();

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 40 }} color="#A0FF00" />;
  }

  if (summary?.is_height_missing) {
    return (
      <Animated.View
        style={[styles.card, styles.missingInfoCard]}
        entering={FadeIn.duration(500)}
      >
        <Text style={styles.cardHeader}>Thiếu thông tin Chiều cao</Text>
        <Text style={styles.cardSubtitle}>
          Vui lòng cập nhật chiều cao để tính toán chỉ số BMI chính xác.
        </Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.cardButtonText}>Cập nhật ngay</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (!summary || !summary.bmi) {
    return (
      <Animated.View style={styles.card} entering={FadeIn.duration(500)}>
        <Text style={styles.cardHeader}>Tổng quan Hôm nay</Text>
        <Text style={styles.noticeText}>Chưa đủ dữ liệu để hiển thị.</Text>
      </Animated.View>
    );
  }

  const getBmiInterpretation = (
    bmi: number
  ): { text: string; color: string } => {
    if (bmi < 16) return { text: "Gầy độ III", color: "#3498db" };
    if (bmi < 17) return { text: "Gầy độ II", color: "#5dade2" };
    if (bmi < 18.5) return { text: "Gầy độ I", color: "#85c1e9" };
    if (bmi < 25) return { text: "Bình thường", color: "#2ecc71" };
    if (bmi < 30) return { text: "Thừa cân", color: "#f1c40f" };
    if (bmi < 35) return { text: "Béo phì độ I", color: "#e67e22" };
    if (bmi < 40) return { text: "Béo phì độ II", color: "#d35400" };
    return { text: "Béo phì độ III", color: "#e74c3c" };
  };

  const bmiInfo = getBmiInterpretation(summary.bmi);
  const bmiPercentage = Math.min(
    Math.max(((summary.bmi - 15) / (40 - 15)) * 100, 0),
    100
  );

  return (
    <Animated.View style={styles.card} entering={FadeIn.duration(500)}>
      <Text style={styles.cardHeader}>Tổng quan Hôm nay</Text>
      <View style={styles.bmiContainer}>
        <View style={styles.bmiHeader}>
          <Text style={styles.bmiLabel}>Chỉ số BMI</Text>
          <Text style={styles.bmiValue}>{summary.bmi.toFixed(1)}</Text>
        </View>
        <View style={styles.bmiBarContainer}>
          <LinearGradient
            colors={["#3498db", "#2ecc71", "#f1c40f", "#e74c3c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bmiBar}
          />
          <View style={[styles.bmiIndicator, { left: `${bmiPercentage}%` }]} />
        </View>
        <Text style={[styles.bmiInterpretation, { color: bmiInfo.color }]}>
          {bmiInfo.text}
        </Text>
      </View>
      {summary.first_log_weight != null && summary.weight_change != null && (
        <View style={styles.weightCompare}>
          <View style={styles.compareRow}>
            <Text style={styles.compareText}>Bắt đầu:</Text>
            <Text style={styles.compareValue}>
              {summary.first_log_weight} kg
            </Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={styles.compareText}>Hiện tại:</Text>
            <Text style={styles.compareValue}>
              {summary.latest_log.weight} kg
            </Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={styles.compareText}>Thay đổi:</Text>
            <Text
              style={[
                styles.compareValue,
                {
                  color:
                    summary.weight_change > 0
                      ? "#A0FF00"
                      : summary.weight_change < 0
                      ? "#FF5A5F"
                      : "white",
                },
              ]}
            >
              {summary.weight_change > 0 ? "+" : ""}
              {summary.weight_change.toFixed(1)} kg
            </Text>
          </View>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Ghi chú</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: "#3498db" }]} />
          <Text style={styles.legendText}>Dưới 18.5: Gầy</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: "#2ecc71" }]} />
          <Text style={styles.legendText}>18.5 - 24.9: Bình thường</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: "#f1c40f" }]} />
          <Text style={styles.legendText}>25 - 29.9: Thừa cân</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: "#e74c3c" }]} />
          <Text style={styles.legendText}>Trên 30: Béo phì</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Lời khuyên từ AI Coach</Text>
        {loadingAdvice ? (
          <ActivityIndicator color="#A0FF00" style={{ marginVertical: 10 }} />
        ) : advice ? (
          <>
            <View style={styles.adviceRow}>
              <Ionicons name="nutrition-outline" size={20} color="#A0FF00" />
              <Text style={styles.adviceText}>{advice.diet_advice}</Text>
            </View>
            <View style={styles.adviceRow}>
              <Ionicons name="barbell-outline" size={20} color="#A0FF00" />
              <Text style={styles.adviceText}>{advice.workout_advice}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noticeText}>Không có lời khuyên nào.</Text>
        )}
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
    marginVertical: 10,
  },
  cardHeader: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  cardSubtitle: {
    color: "#A0A0A0",
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  cardButton: {
    backgroundColor: "#A0FF00",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  cardButtonText: { color: "#121212", fontSize: 14, fontWeight: "bold" },
  missingInfoCard: {
    backgroundColor: "rgba(255, 90, 95, 0.1)",
    borderColor: "#FF5A5F",
    borderWidth: 1,
  },
  bmiContainer: { marginBottom: 20 },
  bmiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  bmiLabel: { color: "#A0A0A0", fontSize: 14 },
  bmiValue: { color: "white", fontSize: 28, fontWeight: "bold" },
  bmiBarContainer: {
    height: 8,
    borderRadius: 4,
    marginTop: 10,
    backgroundColor: "#333",
  },
  bmiBar: { height: "100%", borderRadius: 4 },
  bmiIndicator: {
    position: "absolute",
    width: 4,
    height: 12,
    backgroundColor: "white",
    borderRadius: 2,
    top: -2,
  },
  bmiInterpretation: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "right",
  },
  weightCompare: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 15,
    marginTop: 15,
  },
  compareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  compareText: { color: "#EFEFEF", fontSize: 14 },
  compareValue: { color: "white", fontSize: 14, fontWeight: "bold" },
  noticeText: {
    color: "#A0A0A0",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 15,
    marginTop: 20,
  },
  sectionHeader: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 10,
  },
  legendText: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  adviceRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  adviceText: {
    color: "#EFEFEF",
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
    marginLeft: 10,
  },
});

export default SummaryView;
