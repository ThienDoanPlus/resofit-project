import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import api from "../../api/api";
import { WorkoutPlan, MemberNavigationProp } from "../../navigation/types";
import ProgressBar from "../../screens/components/ProgressBar"; // Import component mới

// Component con cho mỗi thẻ chương trình tập
const PlanCard: React.FC<{ item: WorkoutPlan; index: number }> = ({
  item,
  index,
}) => {
  const navigation = useNavigation<MemberNavigationProp>();
  const progress =
    item.total_days > 0 ? item.completed_days / item.total_days : 0;

  const getDifficultyColor = () => {
    switch (item.difficulty) {
      case "beginner":
        return "#2ecc71"; // Green
      case "intermediate":
        return "#f1c40f"; // Yellow
      case "advanced":
        return "#e74c3c"; // Red
      default:
        return "gray";
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(index * 150)}>
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() =>
          navigation.navigate("WorkoutPlanDetail", { planId: item.id })
        }
      >
        <ImageBackground
          source={{
            uri: item.image_url || "https://via.placeholder.com/400x200",
          }}
          style={styles.cardImage}
          imageStyle={{ borderRadius: 15 }}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          >
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor() },
              ]}
            >
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.name}</Text>
          </LinearGradient>
        </ImageBackground>
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
          <Text style={styles.progressText}>
            {item.completed_days} / {item.total_days} ngày
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const WorkoutPlanListScreen = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    // Không cần setLoading(true) ở đây nữa
    try {
      const response = await api.get("/api/workouts/plans/");
      setPlans(response.data);
    } catch (error) {
      console.error("Failed to fetch workout plans", error);
    } finally {
      // setLoading(false); // Quản lý loading ở hook
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true); // Bật loading
        await fetchPlans(); // Gọi hàm async
        setLoading(false); // Tắt loading sau khi xong
      };

      loadData();
    }, [fetchPlans]) // Phụ thuộc vào fetchPlans
  );
  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={plans}
        renderItem={({ item, index }) => <PlanCard item={item} index={index} />}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <Text style={styles.title}>Chương trình Tập luyện</Text>
        }
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    marginTop: 10,
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  cardImage: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
  },
  gradient: {
    flex: 1,
    justifyContent: "space-between",
    borderRadius: 15,
    padding: 15,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "capitalize",
  },
  cardTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  progressContainer: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginTop: -1, // Để che đi đường viền của ImageBackground
  },
  progressText: {
    color: "gray",
    fontSize: 12,
    marginTop: 8,
    alignSelf: "flex-end",
  },
});

export default WorkoutPlanListScreen;
