import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ProgressBarProps {
  progress: number; // Giá trị từ 0 đến 1
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const progressPercent = Math.round(progress * 100);
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${progressPercent}%` }]} />
      <Text style={styles.text}>{progressPercent}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 20,
    width: "100%",
    backgroundColor: "#333",
    borderRadius: 10,
    justifyContent: "center",
    overflow: "hidden",
  },
  bar: { height: "100%", backgroundColor: "#A0FF00", borderRadius: 10 },
  text: {
    position: "absolute",
    alignSelf: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textShadowColor: "black",
    textShadowRadius: 2,
  },
});

export default ProgressBar;
