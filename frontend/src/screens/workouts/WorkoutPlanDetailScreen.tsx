import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useRoute,
  RouteProp,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import api from "../../api/api";
import {
  WorkoutPlan,
  WorkoutDay,
  MemberNavigationProp,
  MemberStackParamList,
} from "../../navigation/types";

const DayItem: React.FC<{
  item: WorkoutDay;
  index: number;
  navigation: MemberNavigationProp;
}> = ({ item, index, navigation }) => {
  const handlePress = () => {
    if (!item.is_rest_day) {
      navigation.navigate("ExerciseList", {
        dayId: item.id,
        dayTitle: item.title || `Ngày ${item.day_number}`,
        exercises: item.exercises,
      });
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(index * 100)}>
      <TouchableOpacity
        style={styles.dayItemContainer}
        onPress={handlePress}
        disabled={item.is_rest_day}
      >
        <View style={styles.dayNumberCircle}>
          <Text style={styles.dayNumberText}>{item.day_number}</Text>
        </View>
        <View style={styles.dayInfo}>
          <Text style={styles.dayTitle}>
            {item.is_rest_day
              ? "Ngày nghỉ"
              : item.title || `Ngày ${item.day_number}`}
          </Text>
          <Text style={styles.daySubtitle}>
            {item.is_rest_day
              ? "Nghỉ ngơi & Phục hồi"
              : `${item.exercises.length} bài tập`}
          </Text>
        </View>
        {item.is_completed && !item.is_rest_day ? (
          // Nếu đã hoàn thành VÀ không phải ngày nghỉ, hiển thị dấu tick màu xanh
          <Ionicons name="checkmark-circle" size={28} color="#A0FF00" />
        ) : !item.is_rest_day ? (
          // Nếu chưa hoàn thành VÀ không phải ngày nghỉ, hiển thị mũi tên
          <Ionicons name="chevron-forward" size={24} color="#A0A0A0" />
        ) : // Nếu là ngày nghỉ, không hiển thị gì cả
        null}
      </TouchableOpacity>
    </Animated.View>
  );
};

const WorkoutPlanDetailScreen = () => {
  const route =
    useRoute<RouteProp<MemberStackParamList, "WorkoutPlanDetail">>();
  const navigation = useNavigation<MemberNavigationProp>();
  const { planId } = route.params;

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlanDetail = useCallback(async () => {
    try {
      const response = await api.get(`/api/workouts/plans/${planId}/`);
      setPlan(response.data);
    } catch (error) {
      console.error("Failed to fetch plan detail", error);
    } finally {
      if (loading) setLoading(false);
    }
  }, [planId]);

  useFocusEffect(
    useCallback(() => {
      fetchPlanDetail();
    }, [fetchPlanDetail])
  );

  if (loading || !plan) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <ScrollView>
        <ImageBackground
          source={{ uri: plan.image_url || "..." }}
          style={styles.headerImage}
        >
          <LinearGradient
            colors={["transparent", "rgba(18,18,18,0.8)", "#121212"]}
            style={styles.gradient}
          >
            <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              ></TouchableOpacity>
              <Text style={styles.planName}>{plan.name}</Text>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.contentContainer}>
          <Text style={styles.description}>{plan.description}</Text>
          {plan.days?.map((day, index) => (
            <DayItem
              key={day.id}
              item={day}
              index={index}
              navigation={navigation}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  headerImage: { width: "100%", height: 250 },
  gradient: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  backButton: { position: "absolute", top: 10, left: 0 },
  planName: { fontSize: 32, fontWeight: "bold", color: "white" },
  contentContainer: { padding: 20 },
  description: {
    fontSize: 16,
    color: "#A0A0A0",
    lineHeight: 24,
    marginBottom: 20,
  },
  dayItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  dayNumberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  dayNumberText: { color: "white", fontWeight: "bold" },
  dayInfo: { flex: 1 },
  dayTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
  daySubtitle: { color: "gray", fontSize: 13, marginTop: 4 },
  dayItemCompleted: {
    backgroundColor: "#1A1A1A",
    opacity: 0.7,
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  timerLabel: { color: "gray", fontSize: 16, marginBottom: 10 },
  timerText: { color: "#A0FF00", fontSize: 40, fontWeight: "bold" },

  pauseButton: {
    marginTop: 20,
  },
});

export default WorkoutPlanDetailScreen;
