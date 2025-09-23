import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { PTNavigationProp } from "../../navigation/types";
import { Ionicons } from "@expo/vector-icons";

const PTDashboardScreen = () => {
  const { signOut, user } = useAuth();
  const navigation = useNavigation<PTNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.welcomeTitle}>Chào mừng trở lại,</Text>
        <Text style={styles.userName}>{user?.username || "PT"}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate("MyMembers")}
        >
          <Ionicons name="people-outline" size={28} color="#A0FF00" />
          <Text style={styles.menuButtonText}>Quản lý Hội viên</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="calendar-outline" size={28} color="#A0FF00" />
          <Text style={styles.menuButtonText}>Lịch làm việc</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate("ManageAppointments")} // <-- Sửa lại
        >
          <Ionicons name="calendar-outline" size={28} color="#A0FF00" />
          <Text style={styles.menuButtonText}>Quản lý Lịch hẹn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="chatbubbles-outline" size={28} color="#A0FF00" />
          <Text style={styles.menuButtonText}>Trò chuyện</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={22} color="#FF5A5F" />
        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    color: "#A0A0A0",
  },
  userName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 40,
  },
  menuContainer: {
    // Có thể dùng FlatList nếu có nhiều item
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  menuButtonText: {
    color: "white",
    fontSize: 18,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderColor: "#FF5A5F",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginTop: "auto",
  },
  logoutButtonText: {
    color: "#FF5A5F",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default PTDashboardScreen;
