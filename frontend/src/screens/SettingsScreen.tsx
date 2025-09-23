import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
// Import đúng type cho navigation
import { MemberNavigationProp } from "../navigation/types";
// Component cho mỗi dòng cài đặt

const SettingRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children?: React.ReactNode;
  onPress?: () => void;
}> = ({ icon, title, children, onPress }) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={!onPress}
  >
    <Ionicons name={icon} size={24} color="#A0A0A0" />
    <Text style={styles.settingTitle}>{title}</Text>
    <View style={styles.settingControl}>{children}</View>
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const { isBiometricEnabled, isAppLockEnabled, toggleAppLock } = useAuth();
  const navigation = useNavigation<MemberNavigationProp>();

  const appVersion = Constants.expoConfig?.version;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Cài đặt</Text>

        <Text style={styles.sectionHeader}>Bảo mật</Text>
        {/* Chỉ hiển thị tùy chọn khóa app nếu người dùng đã bật đăng nhập sinh trắc học */}
        {isBiometricEnabled && (
          <SettingRow icon="finger-print" title="Khóa ứng dụng">
            <Switch
              value={isAppLockEnabled}
              onValueChange={toggleAppLock}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isAppLockEnabled ? "#A0FF00" : "#f4f3f4"}
            />
          </SettingRow>
        )}
        <SettingRow
          icon="lock-closed-outline"
          title="Đổi mật khẩu"
          onPress={() => navigation.navigate("ChangePassword")} // <-- Sửa lại đây
        />

        <Text style={styles.sectionHeader}>Thông tin</Text>
        <SettingRow
          icon="information-circle-outline"
          title="Về chúng tôi"
          onPress={() => {}}
        />
        <SettingRow
          icon="document-text-outline"
          title="Điều khoản dịch vụ"
          onPress={() => {}}
        />
        <SettingRow
          icon="shield-checkmark-outline"
          title="Chính sách bảo mật"
          onPress={() => {}}
        />

        <View style={styles.footer}>
          <Text style={styles.versionText}>
            Phiên bản ứng dụng: {appVersion}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  title: { fontSize: 28, fontWeight: "bold", color: "white", padding: 20 },
  sectionHeader: {
    color: "gray",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#121212",
  },
  settingTitle: { color: "white", fontSize: 16, flex: 1, marginLeft: 15 },
  settingControl: { marginLeft: "auto" },
  footer: { marginTop: 50, alignItems: "center" },
  versionText: { color: "gray", fontSize: 12 },
});

export default SettingsScreen;
