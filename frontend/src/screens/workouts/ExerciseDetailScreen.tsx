import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

import api from "../../api/api";
import {
  Exercise,
  MemberStackParamList,
  MemberNavigationProp,
} from "../../navigation/types";

const ExerciseDetailScreen = () => {
  const route = useRoute<RouteProp<MemberStackParamList, "ExerciseDetail">>();
  const navigation = useNavigation<MemberNavigationProp>();
  const { exerciseId } = route.params;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    const fetchExerciseDetail = async () => {
      try {
        const response = await api.get(
          `/api/workouts/exercises/${exerciseId}/`
        );
        setExercise(response.data);
      } catch (error) {
        console.error("Failed to fetch exercise detail", error);
        Alert.alert("Lỗi", "Không thể tải chi tiết bài tập.");
      } finally {
        setLoading(false);
      }
    };
    fetchExerciseDetail();
  }, [exerciseId]);

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  if (!exercise) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy bài tập.</Text>
      </View>
    );
  }
  const videoSource = exercise?.video_url;
  console.log("Attempting to play video from URL:", videoSource);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScrollView>
        <View style={styles.videoContainer}>
          {videoSource ? (
            <Video
              ref={videoRef}
              style={styles.video}
              source={{ uri: videoSource }} // <-- Sử dụng trực tiếp
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                // Thêm kiểu
                if (status.isLoaded && !status.isPlaying) {
                  // Có thể có lỗi ở đây, playAsync() không tồn tại trên status
                  // mà nằm trên videoRef.current
                  // videoRef.current?.playAsync(); // Logic này đã đúng
                }
              }}
            />
          ) : (
            <View style={styles.noVideoContainer}>
              <Ionicons name="videocam-off-outline" size={50} color="gray" />
              <Text style={styles.errorText}>Không có video hướng dẫn</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {exercise.muscle_group || "Toàn thân"}
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exercise.equipment}</Text>
            </View>
          </View>

          {/* PHẦN HƯỚNG DẪN ĐÃ ĐƯỢC NÂNG CẤP */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Các bước thực hiện</Text>
              {exercise.instructions.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="close" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "gray", fontSize: 16 },
  backButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderRadius: 20,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "black",
  },
  video: { width: "100%", height: "100%" },
  noVideoContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  contentContainer: { padding: 20 },
  exerciseName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  tagContainer: { flexDirection: "row", marginBottom: 20 },
  tag: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  tagText: { color: "#A0FF00", fontSize: 12, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  description: { fontSize: 16, color: "#A0A0A0", lineHeight: 24 },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  stepNumber: {
    color: "#A0FF00",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
    width: 25, // Dành không gian cho số
  },
  stepText: {
    color: "#BDBDBD",
    fontSize: 16,
    lineHeight: 24,
    flex: 1, // Để text tự xuống dòng
  },
});

export default ExerciseDetailScreen;
