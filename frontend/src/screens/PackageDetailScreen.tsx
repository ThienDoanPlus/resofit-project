import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated"; // Thêm import

import {
  MemberStackParamList,
  MemberNavigationProp,
} from "../navigation/types";
import api from "../api/api";
import axios from "axios";
import PrimaryButton from "../screens/components/PrimaryButton";

// Component nhỏ cho mỗi quyền lợi
const BenefitItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}> = ({ icon, text }) => (
  <View style={styles.benefitRow}>
    <Ionicons name={icon} size={24} color="#A0FF00" />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const PackageDetailScreen = () => {
  const route = useRoute<RouteProp<MemberStackParamList, "PackageDetail">>();
  const navigation = useNavigation<MemberNavigationProp>();
  const { packageItem } = route.params;
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Gọi API để tạo yêu cầu thanh toán MoMo
      const response = await api.post("/api/payments/create-momo/", {
        package_id: packageItem.id,
      });

      const { payUrl } = response.data;

      if (payUrl) {
        // Nếu có payUrl, điều hướng đến màn hình WebView
        navigation.navigate("PaymentWebView", { uri: payUrl });
      } else {
        Alert.alert(
          "Lỗi",
          "Không thể tạo yêu cầu thanh toán. Vui lòng thử lại."
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(error.response.data);
      }
      Alert.alert("Lỗi", "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- PHẦN HÌNH ẢNH HEADER --- */}
        <Animated.View
          // @ts-ignore: sharedTransitionTag là prop hợp lệ của Reanimated v3 nhưng chưa có type
          sharedTransitionTag={`package-card-${packageItem.id}`}
        >
          <ImageBackground
            source={{
              uri:
                packageItem.image_url ||
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
            }} // Ảnh mặc định
            style={styles.headerImage}
          >
            <LinearGradient
              colors={["transparent", "rgba(18,18,18,0.8)", "#121212"]}
              style={styles.gradient}
            >
              <Text style={styles.packageName}>{packageItem.name}</Text>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>

        {/* --- PHẦN THÔNG TIN CHI TIẾT --- */}
        <View style={styles.contentContainer}>
          <Text style={styles.description}>{packageItem.description}</Text>

          <Text style={styles.sectionTitle}>Quyền lợi bao gồm</Text>
          <BenefitItem
            icon="time-outline"
            text={`${packageItem.duration} ngày sử dụng`}
          />
          <BenefitItem
            icon="barbell-outline"
            text={`${packageItem.pt_sessions} buổi tập cùng Huấn luyện viên`}
          />
          <BenefitItem icon="wifi-outline" text="Wifi & Nước uống miễn phí" />
          <BenefitItem icon="lock-closed-outline" text="Tủ đồ cá nhân" />
        </View>
      </ScrollView>

      {/* --- PHẦN FOOTER THANH TOÁN --- */}
      <SafeAreaView style={styles.footer} edges={["bottom"]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Tổng cộng</Text>
          <Text style={styles.priceValue}>
            {parseFloat(packageItem.price).toLocaleString("vi-VN")} VNĐ
          </Text>
        </View>
        <PrimaryButton
          title="Tiến hành Thanh toán"
          onPress={handlePayment}
          loading={loading}
          style={{ flex: 1, marginVertical: 0 }}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 120 }, // Thêm padding để footer không che nội dung
  headerImage: {
    width: "100%",
    height: 300,
    justifyContent: "flex-end",
  },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    padding: 20,
  },
  packageName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  contentContainer: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: "#BDBDBD",
    lineHeight: 24,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  benefitText: {
    color: "#EFEFEF",
    fontSize: 16,
    marginLeft: 15,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  priceContainer: {
    marginRight: 15,
  },
  priceLabel: {
    color: "gray",
    fontSize: 14,
  },
  priceValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default PackageDetailScreen;
