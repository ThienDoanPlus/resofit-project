import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import moment from "moment";
import "moment/locale/vi";

import { Subscription, MemberNavigationProp } from "../../navigation/types";

interface SubscriptionCardProps {
  subscription: Subscription | null;
  isLoading: boolean;
  navigation: MemberNavigationProp;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  isLoading,
  navigation,
}) => {
  // Trạng thái Loading
  if (isLoading) {
    return (
      <Animated.View
        style={[styles.card, styles.skeletonCard]}
        entering={FadeInDown.duration(600).delay(200)}
      >
        <ActivityIndicator color="#A0FF00" />
      </Animated.View>
    );
  }

  // Trạng thái Chưa có Gói tập hoặc Gói đã hết hạn
  if (!subscription || !subscription.is_active) {
    return (
      <Animated.View
        style={styles.card}
        entering={FadeInDown.duration(600).delay(200)}
      >
        <Text style={styles.cardTitle}>Bạn chưa có Gói tập</Text>
        <Text style={styles.cardSubtitle}>
          Khám phá các gói tập phù hợp để bắt đầu hành trình của bạn!
        </Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate("PackageList")}
        >
          <Text style={styles.cardButtonText}>Xem Gói tập</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Trạng thái Có Gói tập đang hoạt động
  const startDate = moment(subscription.start_date);
  const endDate = moment(subscription.end_date);
  const totalDuration = endDate.diff(startDate, "days");
  const daysRemaining = endDate.diff(moment(), "days");

  // Đảm bảo progress không bao giờ âm hoặc lớn hơn 1
  let progress = 0;
  if (totalDuration > 0) {
    progress = Math.max(0, daysRemaining) / totalDuration;
  }

  return (
    <Animated.View
      style={styles.card}
      entering={FadeInDown.duration(600).delay(200)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Gói tập Hiện tại</Text>
        <Ionicons name="shield-checkmark-outline" size={24} color="#A0FF00" />
      </View>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("PackageList")}
      >
        <Text style={styles.secondaryButtonText}>
          Gia hạn hoặc Nâng cấp gói
        </Text>
      </TouchableOpacity>
      <Text style={styles.packageName}>{subscription.package.name}</Text>

      <Progress.Bar
        progress={progress}
        width={null}
        color="#A0FF00"
        unfilledColor="#333"
        borderWidth={0}
        height={6}
        style={{ marginVertical: 15 }}
      />

      <View style={styles.dateContainer}>
        <View>
          <Text style={styles.expiryLabel}>Ngày bắt đầu</Text>
          <Text style={styles.expiryDate}>
            {startDate.format("DD/MM/YYYY")}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.expiryLabel}>Ngày hết hạn</Text>
          <Text style={styles.expiryDate}>{endDate.format("DD/MM/YYYY")}</Text>
        </View>
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
    marginTop: 15,
  },
  skeletonCard: {
    justifyContent: "center",
    alignItems: "center",
    height: 170,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    lineHeight: 22,
    marginBottom: 15,
  },
  cardButton: {
    backgroundColor: "#A0FF00",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  cardButtonText: {
    color: "#121212",
    fontSize: 14,
    fontWeight: "bold",
  },
  packageName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expiryLabel: {
    color: "gray",
    fontSize: 12,
  },
  expiryDate: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  secondaryButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A0A0A0",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#A0A0A0",
    fontSize: 14,
    fontWeight: "bold",
  },
});
export default SubscriptionCard;
