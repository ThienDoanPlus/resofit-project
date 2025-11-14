// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useNavigation } from "@react-navigation/native";
// import api from "../../api/api";
// import { Exercise, MemberNavigationProp } from "../../navigation/types";

// const AICoachSelectionScreen = () => {
//   const navigation = useNavigation<MemberNavigationProp>();
//   const [exercises, setExercises] = useState<Exercise[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchExercises = async () => {
//       try {
//         // API này cần được tạo ở backend (lấy tất cả exercises)
//         const response = await api.get("/api/workouts/exercises/");
//         // Lọc ra các bài tập có hỗ trợ AI
//         const aiExercises = response.data.filter(
//           (ex: Exercise) => !!ex.rep_counting_logic
//         );
//         setExercises(aiExercises);
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchExercises();
//   }, []);

//   if (loading) {
//     /* ... */
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Chọn Bài tập với AI Coach</Text>
//       <FlatList
//         data={exercises}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.item}
//             onPress={() => navigation.navigate("AICoach")}
//           >
//             <Text style={styles.itemText}>{item.name}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#121212" },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "white",
//     padding: 20,
//     textAlign: "center",
//   },
//   item: {
//     backgroundColor: "#1E1E1E",
//     padding: 20,
//     marginHorizontal: 20,
//     marginBottom: 10,
//     borderRadius: 10,
//   },
//   itemText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   center: {
//     // Cho ActivityIndicator
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
// export default AICoachSelectionScreen;
