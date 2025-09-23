import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Ionicons } from "@expo/vector-icons";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  MemberStackParamList,
  PTStackParamList,
  SummaryData,
  Log,
} from "../navigation/types";

// --- IMPORT CÁC COMPONENT CON ---
import SummaryView from "./progress_components/SummaryView";
import ChartView from "./progress_components/ChartView";
import AddProgressLogModal from "./components/AddProgressLogModal";
import ComparisonView from "./progress_components/ComparisonView";

// --- TYPES & CONSTANTS ---
type ProgressScreenParams = { memberId?: number; memberName?: string };
type ProgressScreenRouteProp = RouteProp<
  MemberStackParamList & PTStackParamList,
  "MainTabs" | "MemberProgress"
>;

// --- MAIN COMPONENT ---
const ProgressScreen = () => {
  const route = useRoute<ProgressScreenRouteProp>();
  const { user } = useAuth();
  const params = (route.params as ProgressScreenParams) || {};
  const { memberId, memberName } = params;
  const subjectId = memberId || user?.id;
  const subjectName = memberName || user?.username;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [advice, setAdvice] = useState<{
    diet_advice: string;
    workout_advice: string;
  } | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const fetchData = useCallback(async () => {
    if (!subjectId) {
      setLoading(false);
      return;
    }
    // setLoading(true);
    const apiUrlSuffix =
      user?.role === "pt" && memberId ? `?member_id=${memberId}` : "";
    try {
      // Chỉ cần tải summary, ChartView sẽ tự tải dữ liệu của nó
      const [summaryRes, logsRes] = await Promise.all([
        api.get(`/api/tracking/summary/${apiUrlSuffix}`),
        api.get(`/api/tracking/logs/${apiUrlSuffix}`),
      ]);
      setSummaryData(summaryRes.data);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      // --- GỌI API AI SAU KHI CÓ DỮ LIỆU ---
      if (summaryRes.data && summaryRes.data.bmi) {
        setLoadingAdvice(true);
        try {
          const userProfile = await api.get("/api/users/profile/"); // Lấy profile để có chiều cao
          const adviceRes = await api.post("/api/tracking/generate-advice/", {
            weight: summaryRes.data.latest_log.weight,
            height: userProfile.data.height,
            bmi: summaryRes.data.bmi,
          });
          setAdvice(adviceRes.data);
        } catch (adviceError) {
          console.error("Failed to fetch AI advice", adviceError);
        } finally {
          setLoadingAdvice(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch progress data", error);
      // } finally {
      // setLoading(false);
    }
  }, [subjectId, user?.role, memberId]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true); // Bật loading
        await fetchData(); // Gọi hàm async
        setLoading(false); // Tắt loading sau khi xong
      };

      loadData();
    }, [fetchData]) // Phụ thuộc vào fetchData
  );
  const renderContent = () => {
    // Không cần truyền loading vào SummaryView nữa vì nó được xử lý ở đây
    if (loading)
      return (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          size="large"
          color="#A0FF00"
        />
      );

    switch (selectedIndex) {
      case 0: // Tổng quan
        return (
          <SummaryView
            summary={summaryData}
            isLoading={loading}
            advice={advice}
            loadingAdvice={loadingAdvice}
          />
        );
      case 1: // Chi tiết (trước là Tháng)
        return <ChartView period="month" memberId={memberId} />;
      case 2: // Năm
        return <ChartView period="year" memberId={memberId} />;
      case 3: // So sánh
        return <ComparisonView summary={summaryData} isLoading={loading} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {user?.role === "pt" && memberId && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="#121212" />
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.title}>Theo dõi Tiến độ</Text>
        <Text style={styles.subtitle}>{subjectName}</Text>
        <View style={styles.segmentContainer}>
          <SegmentedControl
            values={["Tổng quan", "Tháng", "Năm", "So sánh"]}
            selectedIndex={selectedIndex}
            onChange={(event) =>
              setSelectedIndex(event.nativeEvent.selectedSegmentIndex)
            }
            tintColor="#A0FF00"
            backgroundColor="#333"
            fontStyle={{ color: "white" }}
            activeFontStyle={{ color: "black", fontWeight: "bold" }}
          />
        </View>
        {renderContent()}
      </ScrollView>

      {memberId && (
        <AddProgressLogModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onLogAdded={fetchData} // Tải lại summary sau khi thêm log mới
          memberId={memberId}
        />
      )}
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },
  segmentContainer: { paddingHorizontal: 20, marginBottom: 10 },
  noticeText: {
    color: "#A0A0A0",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#A0FF00",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 8,
  },
});

export default ProgressScreen;
