import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import api from "../../api/api";
import { User, ManagerNavigationProp } from "../../navigation/types";

// Component cho mỗi dòng hội viên
const MemberItem: React.FC<{ item: User }> = ({ item }) => (
  <View style={styles.memberItem}>
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>
        {item.username.charAt(0).toUpperCase()}
      </Text>
    </View>
    <View>
      <Text style={styles.memberName}>{item.username}</Text>
      <Text style={styles.memberEmail}>{item.email}</Text>
    </View>
  </View>
);

const ManageMembersScreen = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      // Thêm tham số search vào URL nếu có
      const response = await api.get(
        `/api/users/members/?search=${searchQuery}`
      );
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]); // Chạy lại khi searchQuery thay đổi

  // Tải dữ liệu khi màn hình được focus hoặc khi search
  useEffect(() => {
    // Thêm debounce để tránh gọi API liên tục khi gõ
    const handler = setTimeout(() => {
      fetchMembers();
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => clearTimeout(handler);
  }, [searchQuery, fetchMembers]);

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Quản lý Hội viên</Text>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm hội viên theo tên..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={members}
        renderItem={({ item }) => <MemberItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không tìm thấy hội viên nào.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "white", padding: 20 },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  searchIcon: { paddingLeft: 15 },
  searchInput: {
    flex: 1,
    height: 50,
    color: "white",
    paddingHorizontal: 10,
    fontSize: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#A0FF00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "#121212", fontSize: 20, fontWeight: "bold" },
  memberName: { color: "white", fontSize: 16, fontWeight: "bold" },
  memberEmail: { color: "gray", fontSize: 14, marginTop: 4 },
  emptyText: { color: "gray", textAlign: "center", marginTop: 50 },
});

export default ManageMembersScreen;
