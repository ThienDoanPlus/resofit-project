// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Platform,
//   Button,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { CameraView } from "expo-camera"; // Import CameraView
// import { useCameraPermissions } from "expo-camera";
// import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
// import * as posedetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs";
// import type { Tensor3D } from "@tensorflow/tfjs-core";
// import { repCounters } from "../ai/repCounters";

// import Canvas from "react-native-canvas";

// // --- SETUP & CONSTANTS ---

// const TensorCamera = cameraWithTensors(CameraView); // Truyền CameraView vào

// // Kích thước mong muốn cho input của model AI.
// // Kích thước nhỏ hơn -> nhanh hơn nhưng kém chính xác hơn.
// const TENSOR_WIDTH = 152;
// const TENSOR_HEIGHT = 200;

// // --- HELPER FUNCTIONS ---

// /**
//  * Tính toán góc được tạo bởi 3 điểm khớp A, B, C (góc tại B).
//  * @returns Góc tính bằng độ (0-180).
//  */
// function calculateAngle(
//   A: posedetection.Keypoint,
//   B: posedetection.Keypoint,
//   C: posedetection.Keypoint
// ): number {
//   const radians =
//     Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
//   let angle = Math.abs((radians * 180.0) / Math.PI);
//   if (angle > 180.0) {
//     angle = 360 - angle;
//   }
//   return angle;
// }

// // --- MAIN COMPONENT ---

// const AICoachScreen = () => {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [model, setModel] = useState<posedetection.PoseDetector>();
//   const [repCount, setRepCount] = useState(0);
//   const [poseState, setPoseState] = useState<"up" | "down">("up");
//   const [feedback, setFeedback] = useState("Đang tải mô hình AI...");

//   const canvasRef = useRef<any>(null);
//   const rafId = useRef<number | null>(null); // Lưu trữ ID của requestAnimationFrame

//   // 1. Tải mô hình AI và thiết lập backend
//   useEffect(() => {
//     const loadModel = async () => {
//       try {
//         await tf.ready();
//         const detector = await posedetection.createDetector(
//           posedetection.SupportedModels.MoveNet,
//           { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
//         );
//         setModel(detector);
//         setFeedback("Hãy vào tư thế chống đẩy!");
//         console.log("✅ MoveNet model loaded");
//       } catch (error) {
//         console.error("Failed to load model", error);
//         setFeedback("Lỗi tải mô hình AI.");
//       }
//     };
//     loadModel();

//     // Hàm dọn dẹp để dừng vòng lặp khi thoát màn hình
//     return () => {
//       if (rafId.current) {
//         cancelAnimationFrame(rafId.current);
//       }
//     };
//   }, []);

//   // 2. Hàm xử lý luồng camera tensor
//   const handleCameraStream = (images: IterableIterator<Tensor3D>) => {
//     const loop = async () => {
//       const nextImageTensor = images.next().value;
//       if (nextImageTensor && model) {
//         try {
//           // Nhận diện tư thế từ tensor
//           const poses = await model.estimatePoses(nextImageTensor, {
//             flipHorizontal: false, // Không lật ảnh nếu dùng camera trước
//           });

//           if (poses && poses.length > 0) {
//             analyzePose(poses[0]);
//             drawKeypoints(poses[0]);
//           }
//         } catch (e) {
//           console.log("Pose estimation error:", e);
//         }

//         // Giải phóng bộ nhớ tensor để tránh rò rỉ bộ nhớ
//         tf.dispose(nextImageTensor);
//       }
//       // Lặp lại cho frame tiếp theo một cách mượt mà
//       rafId.current = requestAnimationFrame(loop);
//     };
//     loop();
//   };

//   // 3. Hàm phân tích tư thế để đếm rep
//   const analyzePose = (pose: posedetection.Pose) => {
//     const { keypoints } = pose;
//     const lShoulder = keypoints.find((k) => k.name === "left_shoulder");
//     const rShoulder = keypoints.find((k) => k.name === "right_shoulder");
//     const lElbow = keypoints.find((k) => k.name === "left_elbow");
//     const rElbow = keypoints.find((k) => k.name === "right_elbow");
//     const lWrist = keypoints.find((k) => k.name === "left_wrist");
//     const rWrist = keypoints.find((k) => k.name === "right_wrist");

//     // GỘP TẤT CẢ CÁC KIỂM TRA VÀO MỘT CÂU LỆNH `IF` DUY NHẤT
//     if (
//       // 1. Kiểm tra sự tồn tại của các đối tượng keypoint
//       lShoulder &&
//       lElbow &&
//       lWrist &&
//       rShoulder &&
//       rElbow &&
//       rWrist &&
//       // 2. Sau đó, kiểm tra sự tồn tại của thuộc tính `score` cho mỗi keypoint
//       lShoulder.score != null &&
//       lElbow.score != null &&
//       lWrist.score != null &&
//       rShoulder.score != null &&
//       rElbow.score != null &&
//       rWrist.score != null &&
//       // 3. Cuối cùng, mới so sánh giá trị của `score`
//       lShoulder.score > 0.5 &&
//       lElbow.score > 0.5 &&
//       lWrist.score > 0.5 &&
//       rShoulder.score > 0.5 &&
//       rElbow.score > 0.5 &&
//       rWrist.score > 0.5
//     ) {
//       // Bên trong khối `if` này, TypeScript đã chắc chắn 100%
//       // rằng tất cả các giá trị đều tồn tại và là `number`.

//       const leftAngle = calculateAngle(lShoulder, lElbow, lWrist);
//       const rightAngle = calculateAngle(rShoulder, rElbow, rWrist);
//       const averageAngle = (leftAngle + rightAngle) / 2;

//       if (averageAngle < 90 && poseState === "up") {
//         setPoseState("down");
//         setFeedback("⬇️ Tốt! Giữ và đẩy lên");
//       } else if (averageAngle > 160 && poseState === "down") {
//         setRepCount((prev) => prev + 1);
//         setPoseState("up");
//         setFeedback("⬆️ Lên!");
//       }
//     } else {
//       // Nếu bất kỳ điều kiện nào ở trên không được thỏa mãn
//       setFeedback("Không thấy rõ tay, hãy lùi ra xa hơn.");
//     }
//   };

//   // 4. Hàm vẽ các điểm khớp lên canvas
//   const drawKeypoints = (pose: posedetection.Pose) => {
//     const ctx = canvasRef.current?.getContext("2d");
//     if (ctx && canvasRef.current) {
//       if (Platform.OS === "android") {
//         canvasRef.current.width = TENSOR_WIDTH;
//         canvasRef.current.height = TENSOR_HEIGHT;
//       }

//       ctx.clearRect(0, 0, TENSOR_WIDTH, TENSOR_HEIGHT);

//       pose.keypoints.forEach((keypoint) => {
//         if (keypoint.score && keypoint.score > 0.5) {
//           const { x, y } = keypoint;
//           ctx.beginPath();
//           ctx.arc(x, y, 5, 0, 2 * Math.PI);
//           ctx.fillStyle = "#A0FF00";
//           ctx.fill();
//         }
//       });
//     }
//   };

//   // --- UI RENDERING ---

//   if (!permission) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator />
//       </View>
//     );
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.state}>Ứng dụng cần quyền truy cập camera</Text>
//         <Button title="Cấp quyền" onPress={requestPermission} color="#A0FF00" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>AI Coach — Chống đẩy</Text>
//       <View style={styles.cameraContainer}>
//         {model ? (
//           <TensorCamera
//             style={styles.camera}
//             facing="front" // Đúng
//             onReady={handleCameraStream}
//             resizeWidth={TENSOR_WIDTH}
//             resizeHeight={TENSOR_HEIGHT}
//             resizeDepth={3}
//             autorender={true}
//             useCustomShadersToResize={false} // 👈 thêm dòng này
//             cameraTextureHeight={1920}
//             cameraTextureWidth={1080}
//           />
//         ) : (
//           <View style={styles.center}>
//             <ActivityIndicator size="large" color="#A0FF00" />
//             <Text style={[styles.state, { marginTop: 10 }]}>{feedback}</Text>
//           </View>
//         )}
//         <Canvas ref={canvasRef} style={styles.canvas} />
//       </View>
//       <View style={styles.counter}>
//         <Text style={styles.rep}>SỐ REP: {repCount}</Text>
//         <Text style={styles.state}>{feedback}</Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#121212" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: {
//     color: "white",
//     fontSize: 22,
//     textAlign: "center",
//     margin: 10,
//     fontWeight: "bold",
//   },
//   cameraContainer: {
//     flex: 1,
//     borderRadius: 20, // Bo góc
//     overflow: "hidden",
//     marginHorizontal: 10,
//     position: "relative",
//   },
//   camera: {
//     width: "100%",
//     height: "100%",
//   },
//   canvas: {
//     position: "absolute",
//     zIndex: 1,
//     width: "100%",
//     height: "100%",
//   },
//   counter: { paddingVertical: 20, backgroundColor: "#1E1E1E" },
//   rep: {
//     color: "#A0FF00",
//     fontSize: 32,
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   state: { color: "white", fontSize: 18, textAlign: "center", marginTop: 5 },
// });

// export default AICoachScreen;
