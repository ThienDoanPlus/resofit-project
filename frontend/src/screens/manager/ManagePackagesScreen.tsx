import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import api from "../../api/api";
import { Ionicons } from "@expo/vector-icons";
import { ManagerNavigationProp, Package } from "../../navigation/types";
import { formatCurrency } from "../../utils/formatters";

const PlanCard: React.FC<{
  item: Package;
  onEdit: (item: Package) => void;
  onDelete: (itemId: number) => void;
}> = ({ item, onEdit, onDelete }) => {
  const showMenu = () => {
    Alert.alert(`Tùy chọn cho "${item.name}"`, "Bạn muốn làm gì?", [
      { text: "Sửa thông tin", onPress: () => onEdit(item) },
      {
        text: "Xóa gói tập",
        onPress: () => confirmDelete(),
        style: "destructive",
      },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Xác nhận Xóa",
      `Bạn có chắc chắn muốn xóa gói tập "${item.name}" không? Hành động này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: () => onDelete(item.id), style: "destructive" },
      ]
    );
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDetails}>Thời hạn: {item.duration} ngày</Text>
        <Text style={styles.cardPrice}>
          {formatCurrency(parseFloat(item.price))}
        </Text>
      </View>
      <TouchableOpacity style={styles.menuButton} onPress={showMenu}>
        <Ionicons name="ellipsis-vertical" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

const ManagePackagesScreen = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ManagerNavigationProp>();

  const fetchPackages = useCallback(async () => {
    try {
      const response = await api.get("/api/gyms/packages/");
      setPackages(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPackages();
    }, [])
  );
  const handleEdit = (item: Package) => {
    navigation.navigate("EditPackage", { packageItem: item });
  };
  const handleDelete = async (itemId: number) => {
    try {
      await api.delete(`/api/gyms/packages/${itemId}/`);
      Alert.alert("Thành công", "Đã xóa gói tập.");
      fetchPackages();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa gói tập.");
    }
  };

  if (loading) {
    return (
      <ActivityIndicator style={styles.center} size="large" color="#A0FF00" />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Gói tập</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreatePackage")}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={packages}
        renderItem={({ item }) => (
          <PlanCard item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Chưa có gói tập nào. Hãy thêm mới!
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "white" },
  addButton: {
    backgroundColor: "#A0FF00",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#121212", fontSize: 24, fontWeight: "bold" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  cardContent: {
    flex: 1,
  },
  menuButton: {
    padding: 10,
  },

  cardName: { fontSize: 18, fontWeight: "bold", color: "white" },
  cardDetails: { fontSize: 14, color: "#A0A0A0", marginTop: 5 },
  cardPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#A0FF00",
    textAlign: "right",
    marginTop: 10,
  },
  emptyText: {
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 50,
    fontStyle: "italic",
  },
});

export default ManagePackagesScreen;
