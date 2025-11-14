import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { MemberNavigationProp } from "../../navigation/types";
import api from "../../api/api";

interface ChatUser {
  id: number;
  username: string;
  role: "pt" | "manager" | "member";
}

// Component con để render mỗi item, có thể tùy chỉnh thêm avatar
const UserItem: React.FC<{ item: ChatUser }> = ({ item }) => {
  const navigation = useNavigation<MemberNavigationProp>();

  return (
    <TouchableOpacity
      style={styles.chatItem}
      // Truyền toàn bộ object user làm chatPartner
      onPress={() => navigation.navigate("Chat", { chatPartner: item })}
    >
      <View style={styles.avatarPlaceholder}>
        <Ionicons
          name={
            item.role === "manager"
              ? "shield-checkmark-outline"
              : "barbell-outline"
          }
          size={24}
          color="#A0FF00"
        />
      </View>
      <View>
        <Text style={styles.chatName}>{item.username}</Text>
        <Text style={styles.chatRole}>
          {item.role === "manager" ? "Quản lý" : "Huấn luyện viên"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ChatListScreen = () => {
  const [staff, setStaff] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get("/api/users/staff/");
        setStaff(response.data);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải danh sách liên hệ.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A0FF00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bắt đầu Trò chuyện</Text>
      <FlatList
        data={staff}
        renderItem={({ item }) => <UserItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không tìm thấy nhân viên nào.</Text>
        }
      />
    </SafeAreaView>
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
  title: { fontSize: 24, fontWeight: "bold", color: "white", padding: 20 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  chatName: { color: "white", fontSize: 18, fontWeight: "bold" },
  chatRole: { color: "#A0A0A0", fontSize: 14, marginTop: 4 },
  emptyText: { color: "#A0A0A0", textAlign: "center", marginTop: 50 },
});

export default ChatListScreen;
