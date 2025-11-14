import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

import PressableScale from "../../screens/components/PressableScale";

interface QuickAccessCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  delay: number;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  delay,
}) => {
  return (
    <Animated.View
      style={styles.cardWrapper}
      entering={FadeInUp.duration(600).delay(delay)}
    >
      {/* Sử dụng PressableScale để có hiệu ứng nhấn co lại */}
      <PressableScale onPress={onPress}>
        <View style={styles.quickAccessCard}>
          <LinearGradient
            // Mảng màu để tạo hiệu ứng chuyển sắc
            colors={["#2A2A2A", "#1E1E1E"]}
            // Điểm bắt đầu và kết thúc của gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Ionicons name={icon} size={36} color="#A0FF00" />
            <View>
              <Text style={styles.quickAccessTitle}>{title}</Text>
              <Text style={styles.quickAccessSubtitle}>{subtitle}</Text>
            </View>
          </LinearGradient>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: "48%", // Chiếm gần một nửa màn hình để nằm cạnh nhau
  },
  quickAccessCard: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden", // Quan trọng để gradient bo góc theo
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)", // Thêm viền trắng mờ
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between", // Đẩy icon lên trên và text xuống dưới
  },
  quickAccessTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  quickAccessSubtitle: {
    color: "#A0A0A0",
    fontSize: 13,
    marginTop: 4,
  },
});

export default QuickAccessCard;
