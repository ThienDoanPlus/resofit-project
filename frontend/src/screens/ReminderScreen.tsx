import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

import PrimaryButton from "../screens/components/PrimaryButton";

const REMINDER_STORAGE_KEY = "@resofit_water_reminder_settings";

interface ReminderSettings {
  isEnabled: boolean;
  startTime: number;
  endTime: number;
  frequency: number;
}

const ReminderScreen = () => {
  const [settings, setSettings] = useState<ReminderSettings>({
    isEnabled: false,
    startTime: moment().hour(8).minute(0).second(0).valueOf(),
    endTime: moment().hour(22).minute(0).second(0).valueOf(),
    frequency: 60,
  });
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Hủy tất cả các thông báo cũ trước khi lên lịch mới
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (settings.isEnabled) {
      if (moment(settings.endTime).isSameOrBefore(moment(settings.startTime))) {
        Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu.");
        setIsSaving(false);
        return;
      }

      // --- CÀI ĐẶT KÊNH THÔNG BÁO CHO ANDROID (Rất quan trọng) ---
      const channelId = "water-reminder-channel";
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(channelId, {
          name: "Nhắc nhở uống nước",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
      let scheduledCount = 0;
      let currentTime = moment(settings.startTime);
      const endTime = moment(settings.endTime);

      while (currentTime.isBefore(endTime)) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "💧 Uống nước thôi nào!",
              body: "Đã đến lúc bổ sung nước để duy trì năng lượng rồi bạn ơi!",
              sound: true,
            },
            trigger: {
              hour: currentTime.hour(),
              minute: currentTime.minute(),
              repeats: true,
              channelId: channelId, // Sử dụng channelId đã định nghĩa
            },
          });
          scheduledCount++;
        } catch (error) {
          console.error("Failed to schedule notification:", error);
        }
        currentTime.add(settings.frequency, "minutes");
      }
      Alert.alert(
        "Đã lưu",
        `Đã lên lịch ${scheduledCount} lần nhắc nhở uống nước mỗi ngày.`
      );
    } else {
      Alert.alert("Đã tắt", "Tính năng nhắc nhở uống nước đã được tắt.");
    }

    await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
    setIsSaving(false);
  };

  const frequencyOptions = [
    { label: "Mỗi 30 phút", value: 30 },
    { label: "Mỗi 60 phút", value: 60 },
    { label: "Mỗi 90 phút", value: 90 },
    { label: "Mỗi 120 phút", value: 120 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nhắc nhở</Text>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="water" size={24} color="#A0FF00" />
            <Text style={styles.settingTitle}>Nhắc nhở Uống nước</Text>
          </View>
          <Switch
            value={settings.isEnabled}
            onValueChange={(value) =>
              setSettings((s) => ({ ...s, isEnabled: value }))
            }
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={settings.isEnabled ? "#A0FF00" : "#f4f3f4"}
          />
        </View>

        {settings.isEnabled && (
          <>
            <View style={styles.settingRow}>
              <Text style={styles.label}>Từ:</Text>
              <TouchableOpacity onPress={() => setStartTimePickerVisible(true)}>
                <Text style={styles.timeText}>
                  {moment(settings.startTime).format("HH:mm")}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.label}>Đến:</Text>
              <TouchableOpacity onPress={() => setEndTimePickerVisible(true)}>
                <Text style={styles.timeText}>
                  {moment(settings.endTime).format("HH:mm")}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.label}>Tần suất:</Text>
              <View style={{ flex: 1 }}>
                <RNPickerSelect
                  onValueChange={(value) =>
                    value && setSettings((s) => ({ ...s, frequency: value }))
                  }
                  items={frequencyOptions}
                  value={settings.frequency}
                  style={pickerSelectStyles}
                  placeholder={{}}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => (
                    <Ionicons name="chevron-down" size={24} color="gray" />
                  )}
                />
              </View>
            </View>
          </>
        )}
      </View>
      <PrimaryButton
        title="Lưu Cài đặt"
        onPress={handleSave}
        loading={isSaving}
        style={{ margin: 20 }}
      />

      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        date={new Date(settings.startTime)}
        onConfirm={(date) => {
          setSettings((s) => ({ ...s, startTime: date.valueOf() }));
          setStartTimePickerVisible(false);
        }}
        onCancel={() => setStartTimePickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        date={new Date(settings.endTime)}
        onConfirm={(date) => {
          setSettings((s) => ({ ...s, endTime: date.valueOf() }));
          setEndTimePickerVisible(false);
        }}
        onCancel={() => setEndTimePickerVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  title: { fontSize: 28, fontWeight: "bold", color: "white", padding: 20 },
  card: { backgroundColor: "#1E1E1E", borderRadius: 15, marginHorizontal: 20 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  settingInfo: { flexDirection: "row", alignItems: "center" },
  settingTitle: { color: "white", fontSize: 16, marginLeft: 15 },
  label: { color: "#A0A0A0", fontSize: 16 },
  timeText: { color: "#A0FF00", fontSize: 16, fontWeight: "bold" },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { color: "white", fontSize: 16 },
  inputAndroid: { color: "white", fontSize: 16 },
  iconContainer: { top: 0, right: 0 },
});

export default ReminderScreen;
