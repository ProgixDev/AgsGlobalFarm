import React, { useCallback } from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { haptic } from "@/utils/haptics";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type HapticType = "light" | "medium" | "heavy" | "selection" | "none";

interface AnimatedPressableProps extends PressableProps {
  hapticType?: HapticType;
  scaleValue?: number;
  className?: string;
  style?: ViewStyle;
}

export default function AnimatedPressable({
  children,
  onPress,
  onPressIn,
  onPressOut,
  hapticType = "light",
  scaleValue = 0.97,
  style,
  className,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      scale.value = withSpring(scaleValue, { stiffness: 400, damping: 15 });
      onPressIn?.(e);
    },
    [scale, scaleValue, onPressIn],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withSpring(1, { stiffness: 400, damping: 15 });
      onPressOut?.(e);
    },
    [scale, onPressOut],
  );

  const handlePress = useCallback(
    (e: any) => {
      if (hapticType !== "none") {
        haptic[hapticType]();
      }
      onPress?.(e);
    },
    [hapticType, onPress],
  );

  return (
    <AnimatedPressableBase
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      className={className}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  );
}
