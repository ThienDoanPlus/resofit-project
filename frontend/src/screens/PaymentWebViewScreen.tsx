import React from "react";
import { WebView } from "react-native-webview";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import {
  MemberStackParamList,
  MemberNavigationProp,
} from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, StyleSheet } from "react-native";

const PaymentWebViewScreen = () => {
  const route = useRoute<RouteProp<MemberStackParamList, "PaymentWebView">>();
  const navigation = useNavigation<MemberNavigationProp>();
  const { uri } = route.params;

  // Hàm này sẽ được gọi mỗi khi URL trong WebView thay đổi
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Kiểm tra xem URL có phải là returnUrl mà chúng ta đã định nghĩa không
    // Ví dụ: resofit://payment-success
    if (url.startsWith("resofit://")) {
      // Đóng WebView và quay lại màn hình trước đó
      navigation.goBack();
      // Có thể điều hướng đến một màn hình "Thanh toán thành công"
      // navigation.navigate('PaymentSuccess');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <WebView
        source={{ uri }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            color="#A0FF00"
            style={StyleSheet.absoluteFill}
            size="large"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default PaymentWebViewScreen;
