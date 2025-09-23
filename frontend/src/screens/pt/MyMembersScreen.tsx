import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api/api";
// Import các kiểu dữ liệu từ types.ts (chúng ta sẽ tạo chúng)
import { Member, PTAssignment, PTNavigationProp } from "../../navigation/types";
import { useNavigation } from "@react-navigation/native";

const MemberItem: React.FC<{ assignment: PTAssignment }> = ({ assignment }) => {
  const navigation = useNavigation<PTNavigationProp>();

  const handlePress = () => {
    // Điều hướng đến màn hình MemberProgress và truyền thông tin của hội viên
    navigation.navigate("MemberProgress", {
      memberId: assignment.member.id,
      memberName: assignment.member.username,
    });
  };

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={handlePress}>
      <Text style={styles.itemName}>{assignment.member.username}</Text>
      <Text style={styles.itemEmail}>{assignment.member.email}</Text>
    </TouchableOpacity>
  );
};

const MyMembersScreen = () => {
  const [assignments, setAssignments] = useState<PTAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get("/api/pts/my-members/");
        setAssignments(response.data);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải danh sách hội viên.");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Hội viên của tôi</Text>
      <FlatList
        data={assignments}
        renderItem={({ item }) => <MemberItem assignment={item} />}
        keyExtractor={(item) => item.member.id.toString()}
        // ... thêm loading, empty component ...
      />
    </SafeAreaView>
  );
};

// ... styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", padding: 20 },
  itemContainer: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  itemName: { color: "white", fontSize: 18, fontWeight: "bold" },
  itemEmail: { color: "#A0A0A0", fontSize: 14, marginTop: 5 },
});

export default MyMembersScreen;
