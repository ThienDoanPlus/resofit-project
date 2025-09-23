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

const screenWidth = Dimensions.get("window").width;

// Định nghĩa kiểu dữ liệu cho API response
interface ChartDataType {
  labels: string[];
  datasets: { data: number[] }[];
}

const RevenueChart = () => {
  const [periodIndex, setPeriodIndex] = useState(0); // 0: Tháng, 1: Năm
  const [chartData, setChartData] = useState<ChartDataType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      const periodParam = periodIndex === 1 ? "month" : "year";
      try {
        const response = await api.get<{ labels: string[]; data: number[] }>(
          `/api/reports/revenue/?period=${periodParam}`
        );
        if (response.data && response.data.labels && response.data.data) {
          const scaledData = response.data.data.map((value) => value / 1000);
          setChartData({
            labels: response.data.labels,
            datasets: [{ data: scaledData }],
          });
        }
      } catch (error) {
        console.error("Failed to fetch revenue", error);
        setChartData(null); // Reset data nếu lỗi
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [periodIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Thống kê Doanh thu</Text>
      <SegmentedControl
        values={["Năm nay", "Tháng này"]}
        selectedIndex={periodIndex}
        onChange={(event) =>
          setPeriodIndex(event.nativeEvent.selectedSegmentIndex)
        }
        style={{ marginBottom: 20 }}
        tintColor="#A0FF00"
        backgroundColor="#333"
        fontStyle={{ color: "white" }}
        activeFontStyle={{ color: "black", fontWeight: "bold" }}
      />
      {loading ? (
        <ActivityIndicator color="#A0FF00" style={{ height: 220 }} />
      ) : chartData && chartData.datasets[0].data.length > 0 ? (
        <BarChart
          data={chartData} // Truyền trực tiếp
          width={screenWidth - 40} // Chiều rộng màn hình trừ padding
          height={220}
          yAxisLabel=""
          yAxisSuffix="k" // Hiển thị đơn vị nghìn (k)
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          style={{ borderRadius: 16, paddingRight: 40 }}
          fromZero={true}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Không có dữ liệu doanh thu.</Text>
        </View>
      )}
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#1E1E1E",
  backgroundGradientTo: "#1E1E1E",
  decimalPlaces: 0, // Không hiển thị số thập phân
  color: (opacity = 1) => `rgba(160, 255, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForBars: {
    strokeWidth: 2,
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
  chartTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  noDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: { color: "gray", textAlign: "center", fontStyle: "italic" },
});

export default RevenueChart;
