import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import PrimaryButton from "../screens/components/PrimaryButton";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();

  const handleMenuItemPress = (itemName: string) => {
    alert(`Chức năng "${itemName}" đang được phát triển!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Phần Header chứa thông tin cá nhân */}
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: `https://ui-avatars.com/api/?name=${
              user?.username || "A"
            }&background=A0FF00&color=121212&bold=true&size=128`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === "pt"
              ? "Huấn luyện viên"
              : user?.role === "manager"
              ? "Quản lý"
              : "Hội viên"}
          </Text>
        </View>
      </View>

      {/* Phần Menu chức năng */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Ionicons name="person-outline" size={22} color="#A0A0A0" />
          <Text style={styles.menuText}>Chỉnh sửa Hồ sơ</Text>
          <Ionicons name="chevron-forward-outline" size={22} color="#A0A0A0" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <Ionicons name="lock-closed-outline" size={22} color="#A0A0A0" />
          <Text style={styles.menuText}>Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward-outline" size={22} color="#A0A0A0" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={22} color="#A0A0A0" />
          <Text style={styles.menuText}>Cài đặt</Text>
          <Ionicons name="chevron-forward-outline" size={22} color="#A0A0A0" />
        </TouchableOpacity>

        {user?.role === "pt" && (
          <>
            <View style={styles.separator} />
            <Text style={styles.sectionHeader}>Công cụ PT</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("ManageAppointments")}
            >
              <Ionicons name="calendar-outline" size={22} color="#A0A0A0" />
              <Text style={styles.menuText}>Quản lý Lịch hẹn</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="#A0A0A0"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("MyMembers")}
            >
              <Ionicons name="people-outline" size={22} color="#A0A0A0" />
              <Text style={styles.menuText}>Danh sách Hội viên</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="#A0A0A0"
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Nút Đăng xuất */}
      <PrimaryButton
        title="Đăng xuất"
        onPress={signOut}
        style={styles.logoutButton}
        textStyle={styles.logoutButtonText}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E1E",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#A0FF00",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  email: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  menuContainer: {
    flex: 1,
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#121212",
  },
  menuText: {
    color: "white",
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: "#1E1E1E",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#FF5A5F",
  },
  roleBadge: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  roleText: {
    color: "#A0FF00",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  separator: { height: 20, backgroundColor: "#121212" },
  sectionHeader: {
    color: "gray",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});

export default ProfileScreen;
