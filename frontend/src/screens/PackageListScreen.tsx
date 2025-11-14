import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/api";
import { useNavigation } from "@react-navigation/native";
import { MemberNavigationProp, Package } from "../navigation/types";

const PackageCard: React.FC<{ item: Package }> = ({ item }) => {
  const navigation = useNavigation<MemberNavigationProp>();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("PackageDetail", { packageItem: item })
      }
    >
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardDetails}>Thời hạn: {item.duration} ngày</Text>
      <Text style={styles.cardPrice}>
        {parseFloat(item.price).toLocaleString("vi-VN")} VNĐ
      </Text>
    </TouchableOpacity>
  );
};

const PackageListScreen = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get(`/api/gyms/packages/`);
        setPackages(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", "Không thể tải danh sách gói tập.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A0FF00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chọn Gói Tập Của Bạn</Text>
      <FlatList
        data={packages}
        renderItem={({ item }) => <PackageCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

// Giữ nguyên các style
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    padding: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderColor: "#333",
    borderWidth: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#A0FF00",
    textAlign: "right",
    marginTop: 10,
  },
  cardDetails: { fontSize: 14, color: "#A0A0A0", marginTop: 5 },
});

export default PackageListScreen;
