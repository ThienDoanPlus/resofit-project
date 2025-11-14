import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import api from "../../api/api";
import { WorkoutPlan, PTStackParamList } from "../../navigation/types";

const AssignPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<PTStackParamList, "AssignPlan">>();
  const { memberId, memberName } = route.params;
  console.log(
    `[AssignPlanScreen] Received params: memberId=${memberId}, memberName=${memberName}`
  );

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/api/workouts/plans/");
        setPlans(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleAssign = async (planId: number, planName: string) => {
    Alert.alert(
      "Xác nhận Gán",
      `Bạn có chắc muốn gán chương trình "${planName}" cho hội viên ${memberName}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gán",
          onPress: async () => {
            try {
              const dataToSend = { member_id: memberId, plan_id: planId };
              console.log("[AssignPlanScreen] Sending to API:", dataToSend);

              await api.post("/api/workouts/assign-plan/", {
                member_id: memberId,
                plan_id: planId,
              });
              Alert.alert(
                "Thành công",
                `Đã gán chương trình cho ${memberName}.`
              );
              navigation.goBack();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể gán chương trình.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Gán cho {memberName}</Text>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.planItem}
            onPress={() => handleAssign(item.id, item.name)}
          >
            <Text style={styles.planName}>{item.name}</Text>
            <Text style={styles.planDifficulty}>{item.difficulty}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    padding: 20,
    textAlign: "center",
  },
  planItem: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  planDifficulty: {
    color: "#A0A0A0",
    fontSize: 14,
    textTransform: "capitalize",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});

export default AssignPlanScreen;
