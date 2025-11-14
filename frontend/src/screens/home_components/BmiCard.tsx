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

interface BmiCardProps {
  summary: SummaryData | null;
  isLoading: boolean;
}

const BmiCard: React.FC<BmiCardProps> = ({ summary, isLoading }) => {
  const navigation = useNavigation<MemberNavigationProp>();

  if (isLoading) {
    return (
      <View style={[styles.card, styles.skeletonCard]}>
        <ActivityIndicator color="#A0FF00" />
      </View>
    );
  }

  // Trạng thái thiếu chiều cao
  if (summary?.is_height_missing) {
    return (
      <Animated.View
        style={[styles.card, styles.missingInfoCard]}
        entering={FadeIn.duration(600).delay(400)}
      >
        <Text style={styles.cardTitle}>Thiếu thông tin Chiều cao</Text>
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

  // Trạng thái không có dữ liệu BMI
  if (!summary || summary.bmi == null) {
    return (
      <Animated.View
        style={styles.card}
        entering={FadeIn.duration(600).delay(400)}
      >
        <Text style={styles.cardTitle}>Chỉ số BMI</Text>
        <Text style={styles.cardSubtitle}>
          Cần ít nhất một bản ghi tiến độ để tính toán BMI.
        </Text>
      </Animated.View>
    );
  }

  // Hàm diễn giải BMI
  const getBmiInterpretation = (
    bmi: number
  ): { text: string; color: string } => {
    if (bmi < 18.5) return { text: "Trọng lượng gầy", color: "#85c1e9" };
    if (bmi < 25) return { text: "Bình thường", color: "#2ecc71" };
    if (bmi < 30) return { text: "Thừa cân", color: "#f1c40f" };
    return { text: "Béo phì", color: "#e74c3c" };
  };

  const bmiInfo = getBmiInterpretation(summary.bmi);
  // Tính toán vị trí con trỏ trên thanh BMI (0% -> 100%)
  const bmiPercentage = Math.min(
    Math.max(((summary.bmi - 15) / (40 - 15)) * 100, 0),
    100
  );

  // Trạng thái hiển thị đầy đủ
  return (
    <Animated.View
      style={styles.card}
      entering={FadeIn.duration(600).delay(400)}
    >
      <View style={styles.bmiHeader}>
        <Text style={styles.cardTitle}>Chỉ số BMI</Text>
        <Text style={styles.bmiValue}>{summary.bmi.toFixed(1)}</Text>
      </View>
      <View style={styles.bmiBarContainer}>
        <LinearGradient
          colors={["#85c1e9", "#2ecc71", "#f1c40f", "#e74c3c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bmiBar}
        />
        <View style={[styles.bmiIndicator, { left: `${bmiPercentage}%` }]} />
      </View>
      <Text style={[styles.bmiInterpretation, { color: bmiInfo.color }]}>
        {bmiInfo.text}
      </Text>
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
    height: 150,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    color: "#A0A0A0",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  cardButton: {
    backgroundColor: "#A0FF00",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 15,
  },
  cardButtonText: {
    color: "#121212",
    fontSize: 14,
    fontWeight: "bold",
  },
  missingInfoCard: {
    backgroundColor: "rgba(255, 90, 95, 0.1)",
    borderColor: "#FF5A5F",
    borderWidth: 1,
  },
  bmiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  bmiValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  bmiBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    justifyContent: "center",
  },
  bmiBar: {
    height: "100%",
    borderRadius: 4,
  },
  bmiIndicator: {
    position: "absolute",
    width: 4,
    height: 12,
    backgroundColor: "white",
    borderRadius: 2,
  },
  bmiInterpretation: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "right",
  },
  noticeText: {
    color: "#A0A0A0",
    fontSize: 14,
    marginTop: 10,
  },
});

export default BmiCard;
