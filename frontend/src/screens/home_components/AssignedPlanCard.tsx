import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import {
  UserWorkoutPlanAssignment,
  MemberNavigationProp,
} from "../../navigation/types";

interface AssignedPlanCardProps {
  assignment: UserWorkoutPlanAssignment;
}

const AssignedPlanCard: React.FC<AssignedPlanCardProps> = ({ assignment }) => {
  const navigation = useNavigation<MemberNavigationProp>();

  if (!assignment || !assignment.plan) {
    return null;
  }

  const handlePress = () => {
    navigation.navigate("WorkoutPlanDetail", { planId: assignment.plan.id });
  };

  return (
    <Animated.View
      style={styles.cardWrapper}
      entering={FadeInDown.duration(600)}
    >
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <ImageBackground
          source={{
            uri: assignment.plan.image_url || "https://via.placeholder.com/400",
          }}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: 20 }}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          >
            <Text style={styles.headerText}>
              PT {assignment.pt.username} đã chỉ định cho bạn:
            </Text>
            <Text style={styles.planName}>{assignment.plan.name}</Text>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Bắt đầu ngay</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: "#A0FF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  container: {
    width: "100%",
    height: 180,
    borderRadius: 20,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: "flex-end",
  },
  headerText: {
    color: "#EFEFEF",
    fontSize: 14,
  },
  planName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
  button: {
    backgroundColor: "rgba(160, 255, 0, 0.2)",
    borderColor: "#A0FF00",
    borderWidth: 1,
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  buttonText: {
    color: "#A0FF00",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default AssignedPlanCard;
