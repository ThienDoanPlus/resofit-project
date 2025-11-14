import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import api from "../../api/api";
import {
  PTAssignment,
  PTNavigationProp,
  ChatPartner,
} from "../../navigation/types";

const MemberChatItem: React.FC<{ assignment: PTAssignment }> = ({
  assignment,
}) => {
  const navigation = useNavigation<PTNavigationProp>();
  const member = assignment.member;

  const handlePress = () => {
    const chatPartner: ChatPartner = {
      id: member.id,
      username: member.username,
      role: "member",
    };
    navigation.navigate("Chat", { chatPartner });
  };

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={handlePress}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {member.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View>
        <Text style={styles.itemName}>{member.username}</Text>
        <Text style={styles.itemEmail}>{member.email}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color="#333"
        style={{ marginLeft: "auto" }}
      />
    </TouchableOpacity>
  );
};

const ChatListScreen_For_PT = () => {
  const [assignments, setAssignments] = useState<PTAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/pts/my-members/");
      setAssignments(response.data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách hội viên.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMembers();
    }, [fetchMembers])
  );

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Trò chuyện với Hội viên</Text>
      <FlatList
        data={assignments}
        renderItem={({ item }) => <MemberChatItem assignment={item} />}
        keyExtractor={(item) => item.member.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Bạn chưa quản lý hội viên nào để trò chuyện.
          </Text>
        }
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
    padding: 20,
    textAlign: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2C",
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
  avatarText: {
    color: "#A0FF00",
    fontSize: 20,
    fontWeight: "bold",
  },
  itemName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemEmail: {
    color: "gray",
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    color: "gray",
    textAlign: "center",
    marginTop: 50,
    fontStyle: "italic",
  },
});

export default ChatListScreen_For_PT;
