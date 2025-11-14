import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import PressableScale from "../../screens/components/PressableScale";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Props {
  title: string;
  value: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  delay: number;
}

const StatGridCard: React.FC<Props> = ({
  title,
  value,
  description,
  icon,
  onPress,
  delay,
}) => {
  return (
    <Animated.View
      style={styles.gridCardWrapper}
      entering={FadeInDown.duration(600).delay(delay)}
    >
      <PressableScale style={styles.gridCard} onPress={onPress}>
        <View style={styles.gridCardHeader}>
          <Ionicons name={icon} size={20} color="#A0A0A0" />
          <Text style={styles.gridCardTitle}>{title}</Text>
        </View>
        <View style={styles.gridCardBody}>
          <Progress.Circle
            progress={value / 100}
            size={80}
            color="#A0FF00"
            unfilledColor="rgba(255,255,255,0.1)"
            borderWidth={0}
            thickness={8}
            showsText={true}
            formatText={() => `${value}%`}
            textStyle={styles.progressText}
          />
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gridCardWrapper: { width: "48%" },
  gridCard: { backgroundColor: "#1E1E1E", borderRadius: 20, padding: 15 },
  gridCardHeader: { flexDirection: "row", alignItems: "center" },
  gridCardTitle: { color: "#A0A0A0", marginLeft: 8, fontSize: 16 },
  gridCardBody: { alignItems: "center", marginTop: 20, paddingBottom: 10 },
  progressText: { color: "white", fontWeight: "bold", fontSize: 20 },
  descriptionText: {
    color: "gray",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },
});

export default StatGridCard;
