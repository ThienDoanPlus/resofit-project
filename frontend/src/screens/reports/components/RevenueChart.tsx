import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import api from "../../../api/api";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrencyShort } from "../../../utils/formatters";
const screenWidth = Dimensions.get("window").width;

interface ChartDataType {
  labels: string[];
  datasets: { data: number[] }[];
}

const RevenueChart = () => {
  const [periodIndex, setPeriodIndex] = useState(0);
  const [chartData, setChartData] = useState<ChartDataType | null>(null);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    label: `${currentYear - i}`,
    value: currentYear - i,
  }));
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      const periodParam = periodIndex === 0 ? "year" : "month";
      try {
        const response = await api.get<{ labels: string[]; data: number[] }>(
          `/api/reports/revenue/?period=${periodParam}&year=${selectedYear}`
        );
        if (response.data && response.data.labels && response.data.data) {
          setChartData({
            labels: response.data.labels,
            datasets: [{ data: response.data.data }],
          });
        }
      } catch (error) {
        console.error("Failed to fetch revenue", error);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [periodIndex, selectedYear]);

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Thống kê Doanh thu</Text>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={{ flex: 6, marginRight: 10 }}>
          <SegmentedControl
            values={[`Năm ${selectedYear}`, `Tháng ${currentMonth}`]}
            selectedIndex={periodIndex}
            onChange={(event) =>
              setPeriodIndex(event.nativeEvent.selectedSegmentIndex)
            }
            tintColor="#A0FF00"
            backgroundColor="#333"
            style={{ borderRadius: 8 }}
            fontStyle={{ color: "white" }}
            activeFontStyle={{ color: "black", fontWeight: "bold" }}
          />
        </View>
        <View style={{ flex: 4 }}>
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
      ) : chartData && chartData.datasets[0].data.length > 0 ? (
        <BarChart
          data={chartData}
          width={screenWidth - 60}
          height={240}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          style={{ borderRadius: 16, marginVertical: 10 }}
          fromZero
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="alert-circle-outline" size={32} color="gray" />
          <Text style={styles.noDataText}>Không có dữ liệu doanh thu.</Text>
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
  propsForBars: {
    strokeWidth: 2,
    stroke: "#A0FF00",
  },
  formatYLabel: (yLabel: string) => formatCurrencyShort(Number(yLabel)),
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  noDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "gray",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 5,
  },
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
    backgroundColor: "#1E1E1E",
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
    backgroundColor: "#1E1E1E",
    paddingRight: 30,
  },
  iconContainer: {
    top: 10,
    right: 10,
  },
});

export default RevenueChart;
