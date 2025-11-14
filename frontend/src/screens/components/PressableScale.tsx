import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface PressableScaleProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
}

const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  style,
  activeScale = 0.98,
  ...props
}) => {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    // Sử dụng withSpring để tạo hiệu ứng nảy mượt mà
    scale.value = withSpring(activeScale, { damping: 15, stiffness: 400 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    // Sử dụng Pressable gốc của React Native
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} {...props}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

export default PressableScale;
