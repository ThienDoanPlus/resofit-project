import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Import các công cụ cần thiết
import { useAuth } from "../context/AuthContext";
import PrimaryButton from "../screens/components/PrimaryButton";
import { useNavigation } from "@react-navigation/native";
import { MemberNavigationProp } from "../navigation/types";

const ProfileScreen = () => {
  // Lấy thông tin người dùng và hàm signOut từ AuthContext
  const { user, signOut } = useAuth();
  const navigation = useNavigation<MemberNavigationProp>();

  // Xử lý khi nhấn vào một item trong menu (hiện tại chỉ thông báo)
  const handleMenuItemPress = (itemName: string) => {
    alert(`Chức năng "${itemName}" đang được phát triển!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Phần Header chứa thông tin cá nhân */}
      <View style={styles.profileHeader}>
        <Image
          // Sử dụng dịch vụ ui-avatars.com để tự động tạo avatar từ tên người dùng
          // Đây là một mẹo rất hay cho giai đoạn phát triển
          source={{
            uri: `https://ui-avatars.com/api/?name=${
              user?.username || "A"
            }&background=A0FF00&color=121212&bold=true&size=128`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
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
          onPress={() => navigation.navigate("ChangePassword")} // <-- Sửa lại đây
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
      </View>

      {/* Nút Đăng xuất */}
      <PrimaryButton
        title="Đăng xuất"
        onPress={signOut}
        style={styles.logoutButton} // Style tùy chỉnh cho nút logout
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
    flex: 1, // Đẩy nút logout xuống dưới
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
    flex: 1, // Đẩy icon chevron ra cuối
  },
  logoutButton: {
    backgroundColor: "#1E1E1E",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#FF5A5F",
  },
});

export default ProfileScreen;
