import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import api from "../../../api/api";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const MemberChart = () => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    label: `${currentYear - i}`,
    value: currentYear - i,
  }));
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const fetchMemberStats = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/api/reports/members/?year=${selectedYear}`
        );
        if (response.data && response.data.labels && response.data.data) {
          setChartData({
            labels: response.data.labels,
            datasets: [{ data: response.data.data }],
          });
        }
      } catch (error) {
        console.error("Failed to fetch member stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberStats();
  }, [selectedYear]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.chartTitle}>Hội viên mới theo Tháng</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => value && setSelectedYear(value)}
            items={years}
            value={selectedYear}
            placeholder={{}}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Ionicons name="chevron-down" size={20} color="gray" />}
          />
        </View>
      </View>

      {/* Chart */}
      {loading ? (
        <ActivityIndicator color="#A0FF00" style={{ height: 220 }} />
      ) : chartData && chartData.datasets[0].data.some((d) => d > 0) ? (
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{ borderRadius: 16 }}
          fromZero={true}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Không có dữ liệu cho năm {selectedYear}.
          </Text>
        </View>
      )}
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#1E1E1E",
  backgroundGradientTo: "#1E1E1E",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(160, 255, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#A0FF00",
  },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  chartTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  pickerWrapper: {
    width: 120,
  },
  noDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: { color: "gray", textAlign: "center", fontStyle: "italic" },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    color: "white",
    backgroundColor: "#2A2A2A",
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    color: "white",
    backgroundColor: "#2A2A2A",
    paddingRight: 30,
  },
  iconContainer: {
    top: 10,
    right: 10,
  },
});

export default MemberChart;
