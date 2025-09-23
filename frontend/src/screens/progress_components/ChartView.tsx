import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Switch,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import api from "../../api/api";
import { Log } from "../../navigation/types";
import Animated, { FadeIn } from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

interface ChartViewProps {
  period: "month" | "year";
  memberId?: number;
}
type ChartDataType = {
  labels: string[];
  datasets: { data: number[] }[];
  legend?: string[];
};

const ChartView: React.FC<ChartViewProps> = ({ period, memberId }) => {
  const [data, setData] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"weight" | "bmi">("weight"); // State mới để quản lý loại biểu đồ

  // Tạo danh sách năm và tháng cho dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    label: `${currentYear - i}`,
    value: currentYear - i,
  }));
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: i + 1,
  }));

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        let apiUrl = `/api/tracking/logs/?year=${selectedYear}`;
        if (period === "month") {
          apiUrl += `&month=${selectedMonth}`;
        }
        if (memberId) {
          apiUrl += `&member_id=${memberId}`;
        }
        const response = await api.get(apiUrl);
        setData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(`Failed to fetch ${period} data`, error);
        setData([]); // Reset data về mảng rỗng nếu lỗi
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [period, selectedYear, selectedMonth, memberId]);

  const chartData = useMemo((): ChartDataType | null => {
    const labels = data.map((log) =>
      moment(log.date).format(period === "month" ? "DD" : "MMM")
    );
    let datasetData: number[];
    let legend: string;

    if (chartType === "bmi") {
      // Lọc ra các log có dữ liệu bmi
      const bmiData = data.filter((log) => log.bmi != null);
      if (bmiData.length < 2) {
        return null; // Trả về null nếu không đủ dữ liệu
      }
      datasetData = bmiData.map((log) => log.bmi!); // Dấu ! để báo rằng chúng ta chắc chắn nó không null
      legend = "Chỉ số BMI";
    } else {
      // Mặc định là 'weight'
      const weightData = data.filter((log) => log.weight != null);
      if (weightData.length < 2) {
        return null; // Trả về null nếu không đủ dữ liệu
      }
      datasetData = weightData.map((log) => log.weight);
      legend = "Cân nặng (kg)";
    }

    // Lọc lại labels cho khớp với dữ liệu đã lọc
    const filteredLabels = data
      .filter((log) =>
        chartType === "bmi" ? log.bmi != null : log.weight != null
      )
      .map((log) => moment(log.date).format(period === "month" ? "DD" : "MMM"));

    return {
      labels: filteredLabels,
      datasets: [{ data: datasetData }],
      legend: [legend],
    };
  }, [data, chartType, period]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} color="#A0FF00" />;
  }

  if (data.length < 2) {
    return (
      <Text style={styles.noticeText}>
        Cần ít nhất 2 bản ghi để vẽ biểu đồ cho giai đoạn này.
      </Text>
    );
  }

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(500)}>
      <View style={styles.pickerContainer}>
        {period === "month" && (
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedMonth(value)}
              items={months}
              value={selectedMonth}
              placeholder={{}}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => (
                <Ionicons name="chevron-down" size={20} color="gray" />
              )}
            />
          </View>
        )}
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedYear(value)}
            items={years}
            value={selectedYear}
            placeholder={{}}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Ionicons name="chevron-down" size={20} color="gray" />}
          />
        </View>
      </View>
      {/* --- KHỐI CHUYỂN ĐỔI BIỂU ĐỒ --- */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Cân nặng</Text>
        <Switch
          value={chartType === "bmi"}
          onValueChange={(value) => setChartType(value ? "bmi" : "weight")}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={chartType === "bmi" ? "#A0FF00" : "#f4f3f4"}
        />
        <Text style={styles.switchLabel}>BMI</Text>
      </View>

      {chartData ? (
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={250}
          chartConfig={chartConfig}
          bezier
          style={{ borderRadius: 16 }}
        />
      ) : (
        <Text style={styles.noticeText}>
          Không đủ dữ liệu để vẽ biểu đồ {chartType.toUpperCase()}.
        </Text>
      )}
    </Animated.View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#1E1E1E",
  backgroundGradientTo: "#121212",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(160, 255, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: "6", strokeWidth: "2", stroke: "#A0FF00" },
};

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: 10, marginHorizontal: 20 },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
  },
  pickerWrapper: { flex: 1, marginHorizontal: 5 },
  noticeText: {
    color: "#A0A0A0",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  switchLabel: {
    color: "white",
    fontSize: 14,
    marginHorizontal: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    color: "white",
    backgroundColor: "#1E1E1E",
  },
  inputAndroid: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    color: "white",
    backgroundColor: "#1E1E1E",
  },
  iconContainer: { top: 12, right: 12 },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  switchLabel: {
    color: "white",
    fontSize: 14,
    marginHorizontal: 10,
  },
  container: { alignItems: "center", marginVertical: 10, marginHorizontal: 20 },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
  },
  pickerWrapper: { flex: 1, marginHorizontal: 5 },
  noticeText: {
    color: "#A0A0A0",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
});

export default ChartView;
