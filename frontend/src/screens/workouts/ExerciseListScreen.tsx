import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  MemberStackParamList,
  MemberNavigationProp,
  WorkoutDayExercise,
} from "../../navigation/types";
import PrimaryButton from "../../screens/components/PrimaryButton";

// --- CHILD COMPONENTS ---

// Component cho mỗi dòng bài tập đã được "đánh bóng"
const ExerciseItem: React.FC<{ item: WorkoutDayExercise; index: number }> = ({
  item,
  index,
}) => {
  const navigation = useNavigation<MemberNavigationProp>();
  const exercise = item.exercise; // Lấy object exercise ra cho dễ dùng

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(index * 100)}>
      <View style={styles.exerciseItem}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })
          }
        >
          <Image
            source={{
              uri: exercise.gif_url || "https://via.placeholder.com/100",
            }}
            style={styles.exerciseImage}
          />
        </TouchableOpacity>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName} numberOfLines={2}>
            {exercise.name}
          </Text>
          <Text style={styles.exerciseDetail}>
            {item.sets} Hiệp x {item.reps} Reps
          </Text>
        </View>

        {/* --- LOGIC HIỂN THỊ CÓ ĐIỀU KIỆN --- */}
        {exercise.ai_supported ? (
          // Nếu được AI hỗ trợ, hiển thị nút "AI Coach"
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => navigation.navigate("AICoach")}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#121212" />
            <Text style={styles.aiButtonText}>AI</Text>
          </TouchableOpacity>
        ) : (
          // Nếu không, hiển thị mũi tên như cũ
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })
            }
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#555"
              style={{ padding: 10 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Component Header đã được "đánh bóng"
const ExerciseListHeader: React.FC<{
  dayTitle: string | null;
  exercises: WorkoutDayExercise[];
}> = ({ dayTitle, exercises }) => {
  const estimatedTime = useMemo(() => {
    const totalSeconds = exercises.reduce(
      (acc, curr) => acc + curr.sets * curr.rest_period,
      0
    );
    return Math.ceil(totalSeconds / 60);
  }, [exercises]);

  return (
    <>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5",
        }}
        style={styles.headerImage}
      >
        <LinearGradient
          colors={["rgba(18,18,18,0.2)", "#121212"]}
          style={styles.gradient}
        >
          <Text style={styles.headerTitle}>{dayTitle}</Text>
        </LinearGradient>
      </ImageBackground>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Ionicons name="list" size={24} color="#A0A0A0" />
          <Text style={styles.summaryValue}>{exercises.length} bài tập</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.summaryItem}>
          <Ionicons name="time-outline" size={24} color="#A0A0A0" />
          <Text style={styles.summaryValue}>~ {estimatedTime} phút</Text>
        </View>
      </View>
      <Text style={styles.listTitle}>Danh sách bài tập</Text>
    </>
  );
};

// --- MAIN COMPONENT ---

const ExerciseListScreen = () => {
  const route = useRoute<RouteProp<MemberStackParamList, "ExerciseList">>();
  const navigation = useNavigation<MemberNavigationProp>();
  const insets = useSafeAreaInsets(); // Hook để lấy vùng an toàn
  const { dayId, dayTitle, exercises } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backButton, { top: insets.top + 10 }]} // Tự động căn chỉnh nút back
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <FlatList
        data={exercises}
        renderItem={({ item, index }) => (
          <ExerciseItem item={item} index={index} />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <ExerciseListHeader dayTitle={dayTitle} exercises={exercises} />
        }
        contentContainerStyle={{ paddingBottom: 120 }} // Tăng không gian cho nút
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <PrimaryButton
          title="BẮT ĐẦU BUỔI TẬP"
          onPress={() =>
            navigation.replace("WorkoutSession", { dayId, dayTitle, exercises })
          } // Dùng replace để có UX tốt hơn
        />
      </View>
    </View>
  );
};

// --- STYLES ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },
  headerImage: { width: "100%", height: 220 }, // Tăng chiều cao
  gradient: { flex: 1, justifyContent: "flex-end", padding: 20 },
  headerTitle: { fontSize: 36, fontWeight: "bold", color: "white" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center", // Căn giữa theo chiều dọc
    paddingVertical: 10,
    backgroundColor: "none",
    marginHorizontal: 120,
    borderRadius: 20,
    marginTop: 0,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  summaryItem: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  summaryValue: { color: "#A0A0A0", fontSize: 12, fontWeight: "bold" },
  summaryLabel: {
    color: "#A0A0A0",
    fontSize: 13,
    marginTop: 5,
    textTransform: "uppercase",
  },
  separator: { width: 1, backgroundColor: "#333" },
  listTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 15,
    backgroundColor: "#333",
  },
  exerciseInfo: { flex: 1 },
  exerciseName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  exerciseDetail: { color: "gray", fontSize: 14 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 51, 51, 0.5)", // Viền mờ hơn
  },
  aiButton: {
    backgroundColor: "#A0FF00",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  aiButtonText: {
    color: "#121212",
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default ExerciseListScreen;
