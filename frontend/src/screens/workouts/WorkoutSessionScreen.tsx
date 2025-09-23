import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import * as Progress from "react-native-progress";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode, Audio } from "expo-av";
import * as Haptics from "expo-haptics";

import api from "../../api/api";
import {
  MemberStackParamList,
  MemberNavigationProp,
  WorkoutDayExercise,
} from "../../navigation/types";
import PrimaryButton from "../../screens/components/PrimaryButton";

const WorkoutSessionScreen = () => {
  const route = useRoute<RouteProp<MemberStackParamList, "WorkoutSession">>();
  const navigation = useNavigation<MemberNavigationProp>();
  const { dayId, dayTitle, exercises } = route.params;

  // State để theo dõi tiến trình
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  // State để quản lý trạng thái nghỉ
  const [isResting, setIsResting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // Trạng thái tạm dừng
  const soundObject = useRef(new Audio.Sound());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentExercise = exercises[currentExerciseIndex];

  // Load âm thanh
  useEffect(() => {
    const loadSound = async () => {
      try {
        await soundObject.current.loadAsync(
          require("../../../assets/sounds/beep.mp3")
        );
      } catch (error) {
        console.error("Failed to load sound", error);
      }
    };
    loadSound();
    return () => {
      // Unload âm thanh khi component unmount
      soundObject.current.unloadAsync();
    };
  }, []);

  // Hook để xử lý logic đếm ngược
  useEffect(() => {
    if (isResting && countdown > 0 && !isPaused) {
      // Chỉ đếm khi không bị pause
      timerRef.current = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (isResting && countdown === 0) {
      playSoundAndGoNext();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isResting, countdown, isPaused]); // Thêm isPaused vào dependencies

  const playSoundAndGoNext = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Yêu cầu phát và LẤY TRẠNG THÁI (status) của âm thanh
      const status = await soundObject.current.replayAsync();

      // Dựa vào thời lượng của âm thanh để đợi
      // Nếu âm thanh dài 0.5s, chúng ta sẽ đợi khoảng 0.5s
      if (status.isLoaded && status.durationMillis) {
        // Đợi một khoảng thời gian bằng độ dài của âm thanh
        await new Promise((resolve) =>
          setTimeout(resolve, status.durationMillis)
        );
      }
    } catch (error) {
      console.error("Failed to play sound", error);
    }

    // CHỈ GỌI goToNextStep SAU KHI ĐÃ ĐỢI
    goToNextStep();
  };

  const goToNextStep = () => {
    if (isWorkoutFinished) {
      setIsResting(false);
      return;
    }
    setIsResting(false); // Tắt trạng thái nghỉ
    setCountdown(0); // Reset bộ đếm

    if (currentSet < currentExercise.sets) {
      setCurrentSet((s) => s + 1);
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((i) => i + 1);
      setCurrentSet(1);
    }
  };

  const handleActionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Khi nhấn nút "Hoàn thành Hiệp", bắt đầu nghỉ
    setIsResting(true);
    setCountdown(currentExercise.rest_period);
  };

  const handleCompleteWorkout = async () => {
    try {
      await api.post("/api/workouts/progress/complete-day/", { day_id: dayId });

      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đánh dấu hoàn thành.");
    }
  };
  const handlePauseResume = () => {
    setIsPaused((p) => !p);
  };

  const handleStopWorkout = () => {
    Alert.alert(
      "Dừng buổi tập?",
      "Bạn có chắc chắn muốn kết thúc buổi tập ngay bây giờ không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "OK",
          onPress: () => navigation.goBack(),
          style: "destructive",
        },
      ]
    );
  };
  const isLastExercise = currentExerciseIndex >= exercises.length - 1;
  const isLastSet = currentSet >= (currentExercise?.sets || 1); // Thêm `?.` và giá trị mặc định
  // Biến để kiểm tra xem đã đến bài tập và hiệp cuối cùng chưa
  const isWorkoutFinished = isLastExercise && isLastSet;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleStopWorkout}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{dayTitle}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.mediaContainer}>
        {/* Ưu tiên video trước tiên */}
        {currentExercise.exercise.video_url ? (
          <Video
            source={{ uri: currentExercise.exercise.video_url }}
            style={styles.media}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={true} // Tự động phát video khi sẵn sàng
            useNativeControls={true}
          />
        ) : currentExercise.exercise.gif_url ? (
          // Nếu không có video, dùng ảnh GIF
          <Image
            source={{ uri: currentExercise.exercise.gif_url }}
            style={styles.media}
          />
        ) : (
          // Nếu không có cả hai, hiển thị thông báo
          <View style={styles.noMediaContainer}>
            <Ionicons name="image-outline" size={50} color="gray" />
            <Text style={styles.noMediaText}>Không có hình ảnh hoặc video</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.progressText}>
          BÀI TẬP {currentExerciseIndex + 1} / {exercises.length}
        </Text>
        <Text style={styles.exerciseName}>{currentExercise.exercise.name}</Text>

        {isResting ? (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>NGHỈ NGƠI</Text>
            <Progress.Circle
              progress={countdown / currentExercise.rest_period}
              size={150}
              color="#A0FF00"
              unfilledColor="rgba(255,255,255,0.1)"
              borderWidth={5}
              thickness={10}
              showsText={true}
              formatText={() => `${countdown}s`}
              textStyle={styles.timerText}
            />
            <TouchableOpacity
              onPress={handlePauseResume}
              style={styles.pauseButton}
            >
              <Ionicons
                name={isPaused ? "play-circle-outline" : "pause-circle-outline"}
                size={48} // Tăng kích thước cho dễ nhấn
                color="white"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.repsContainer}>
            <Text style={styles.repsLabel}>
              HIỆP {currentSet} / {currentExercise.sets}
            </Text>
            <Text style={styles.repsText}>{currentExercise.reps}</Text>
            <Text style={styles.repsUnit}>REPS</Text>
          </View>
        )}
      </View>

      <View style={styles.actionContainer}>
        {isWorkoutFinished && !isResting ? (
          <PrimaryButton
            title="Hoàn thành & Kết thúc"
            onPress={handleCompleteWorkout}
          />
        ) : isResting ? (
          isPaused ? (
            <Text style={styles.pausedText}>ĐÃ TẠM DỪNG</Text>
          ) : (
            <TouchableOpacity onPress={goToNextStep} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Bỏ qua nghỉ</Text>
            </TouchableOpacity>
          )
        ) : (
          <PrimaryButton title="Hoàn thành Hiệp" onPress={handleActionPress} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  mediaContainer: {
    flex: 0.4,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  media: { width: "100%", height: "100%", resizeMode: "contain" },
  infoContainer: {
    flex: 0.45,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  progressText: {
    color: "gray",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  exerciseName: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  repsContainer: { alignItems: "center" },
  repsLabel: { color: "gray", fontSize: 16 },
  repsText: { color: "#A0FF00", fontSize: 64, fontWeight: "bold" },
  repsUnit: { color: "gray", fontSize: 16 },
  timerContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  timerLabel: { color: "gray", fontSize: 16, marginBottom: 10 },
  timerText: { color: "#A0FF00", fontSize: 40, fontWeight: "bold" },
  actionContainer: {
    flex: 0.15,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  skipButton: { alignSelf: "center" },
  skipButtonText: { color: "#A0A0A0", fontSize: 16 },
  noMediaContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  noMediaText: {
    color: "gray",
    marginTop: 10,
  },
  pausedText: {
    color: "#FFD700", // Màu vàng
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  pauseButton: {
    marginTop: 20,
  },
});

export default WorkoutSessionScreen;
