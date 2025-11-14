import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/api";
import { PTNavigationProp, PTStackParamList } from "../../navigation/types";
import PressableScale from "../../screens/components/PressableScale";
import Animated, { FadeInDown } from "react-native-reanimated";
import moment from "moment";
import "moment/locale/vi";

const ActionButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  delay: number;
}> = ({ icon, label, onPress, delay }) => (
  <Animated.View entering={FadeInDown.duration(500).delay(delay)}>
    <PressableScale style={styles.actionButton} onPress={onPress}>
      <Ionicons name={icon} size={28} color="#A0FF00" />
      <Text style={styles.actionText}>{label}</Text>
    </PressableScale>
  </Animated.View>
);

const InfoCard: React.FC<{
  title: string;
  children: React.ReactNode;
  delay: number;
}> = ({ title, children, delay }) => (
  <Animated.View
    style={styles.infoCard}
    entering={FadeInDown.duration(500).delay(delay)}
  >
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </Animated.View>
);

const MemberDetailScreen = () => {
  const route = useRoute<RouteProp<PTStackParamList, "MemberDetail">>();
  const navigation = useNavigation<PTNavigationProp>();
  const { memberId, memberName } = route.params;

  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: memberName });
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/users/members/${memberId}/`);
        setMemberData(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu hội viên.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [memberId, memberName, navigation]);

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  if (!memberData) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>Không có dữ liệu.</Text>
      </View>
    );
  }

  const profile = memberData.memberprofile;
  const subscription = memberData.subscription;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${memberData.username.replace(
                " ",
                "+"
              )}&background=A0FF00&color=121212&size=128&bold=true`,
            }}
            style={styles.avatar}
          />
        </Animated.View>
        <Animated.Text
          style={styles.username}
          entering={FadeInDown.duration(500).delay(100)}
        >
          {memberData.username}
        </Animated.Text>
        <Animated.Text
          style={styles.email}
          entering={FadeInDown.duration(500).delay(200)}
        >
          {memberData.email}
        </Animated.Text>
      </View>

      <View style={styles.actionsContainer}>
        <ActionButton
          icon="analytics-outline"
          label="Tiến độ"
          onPress={() =>
            navigation.navigate("MemberProgress", { memberId, memberName })
          }
          delay={300}
        />
        <ActionButton
          icon="calendar-outline"
          label="Lịch hẹn"
          onPress={() =>
            navigation.navigate("MemberBookings", { memberId, memberName })
          }
          delay={400}
        />
        <ActionButton
          icon="document-text-outline"
          label="Gán Plan"
          onPress={() => {
            console.log("[MemberDetailScreen] Navigating to AssignPlan with:", {
              memberId,
              memberName,
            });
            navigation.navigate("AssignPlan", { memberId, memberName });
          }}
          delay={600}
        />
        <ActionButton
          icon="chatbubbles-outline"
          label="Chat"
          onPress={() =>
            navigation.navigate("Chat", {
              chatPartner: {
                id: memberId,
                username: memberName,
                role: "member",
              },
            })
          }
          delay={500}
        />
      </View>

      <InfoCard title="Mục tiêu" delay={600}>
        <Text style={styles.cardContent}>
          {profile?.goal || "Chưa cập nhật"}
        </Text>
      </InfoCard>

      {subscription && subscription.package ? (
        <InfoCard title="Gói tập hiện tại" delay={700}>
          <Text style={styles.cardContentBold}>
            {subscription.package.name}
          </Text>
          <Text style={styles.cardContent}>
            Hết hạn: {moment(subscription.end_date).format("DD/MM/YYYY")}
          </Text>
        </InfoCard>
      ) : (
        <InfoCard title="Gói tập hiện tại" delay={700}>
          <Text style={styles.cardContent}>
            Chưa có gói nào đang hoạt động.
          </Text>
        </InfoCard>
      )}

      <InfoCard title="Thông tin khác" delay={800}>
        <Text style={styles.cardContent}>
          Ngày tham gia: {moment(memberData.date_joined).format("DD/MM/YYYY")}
        </Text>
        <Text style={styles.cardContent}>
          Ngày sinh:{" "}
          {profile?.dob
            ? moment(profile.dob).format("DD/MM/YYYY")
            : "Chưa cập nhật"}
        </Text>
      </InfoCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1E1E1E",
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#A0FF00",
  },
  username: { fontSize: 24, fontWeight: "bold", color: "white" },
  email: { fontSize: 16, color: "gray", marginTop: 4 },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  actionButton: { alignItems: "center", padding: 10 },
  actionText: {
    color: "#A0FF00",
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  cardTitle: {
    color: "gray",
    fontSize: 14,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  cardContent: { color: "white", fontSize: 16, lineHeight: 24 },
  cardContentBold: {
    color: "#A0FF00",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default MemberDetailScreen;
