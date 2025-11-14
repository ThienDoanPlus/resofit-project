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
import { Ionicons } from "@expo/vector-icons";

import api from "../../api/api";
import { User } from "../../navigation/types";

const StaffItem: React.FC<{ item: User }> = ({ item }) => (
  <View style={styles.staffItem}>
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>
        {item.username.charAt(0).toUpperCase()}
      </Text>
    </View>
    <View>
      <Text style={styles.staffName}>{item.username}</Text>
      <Text style={styles.staffRole}>
        {item.role === "pt" ? "Huấn luyện viên" : "Quản lý"}
      </Text>
    </View>
  </View>
);

const ManageStaffScreen = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/users/staff/?search=${searchQuery}`);
      setStaff(response.data);
    } catch (error) {
      console.error("Failed to fetch staff", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Logic tìm kiếm với debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStaff();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchStaff]);

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Quản lý Nhân viên</Text>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhân viên theo tên..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={staff}
        renderItem={({ item }) => <StaffItem item={item} />}
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
  staffItem: {
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
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "#A0FF00", fontSize: 20, fontWeight: "bold" },
  staffName: { color: "white", fontSize: 16, fontWeight: "bold" },
  staffRole: {
    color: "gray",
    fontSize: 14,
    marginTop: 4,
    textTransform: "capitalize",
  },
  emptyText: { color: "gray", textAlign: "center", marginTop: 50 },
});

export default ManageStaffScreen;
