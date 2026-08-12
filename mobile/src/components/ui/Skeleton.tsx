import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
  className,
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonJobCard() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <Skeleton width="60%" height={18} borderRadius={6} />
        <Skeleton width={70} height={22} borderRadius={12} />
      </View>
      <Skeleton
        width="40%"
        height={14}
        borderRadius={4}
        style={{ marginBottom: 12 }}
      />
      <Skeleton
        width="50%"
        height={14}
        borderRadius={4}
        style={{ marginBottom: 6 }}
      />
      <Skeleton
        width="35%"
        height={14}
        borderRadius={4}
        style={{ marginBottom: 12 }}
      />
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <Skeleton width={100} height={14} borderRadius={4} />
        <Skeleton width={80} height={28} borderRadius={8} />
      </View>
    </View>
  );
}

export function SkeletonCourseCard() {
  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden flex-row">
      <Skeleton width={112} height={120} borderRadius={0} />
      <View className="flex-1 p-4">
        <Skeleton
          width="80%"
          height={16}
          borderRadius={4}
          style={{ marginBottom: 8 }}
        />
        <Skeleton
          width="100%"
          height={12}
          borderRadius={4}
          style={{ marginBottom: 4 }}
        />
        <Skeleton
          width="70%"
          height={12}
          borderRadius={4}
          style={{ marginBottom: 12 }}
        />
        <View className="flex-row gap-2">
          <Skeleton width={60} height={22} borderRadius={12} />
          <Skeleton width={50} height={22} borderRadius={12} />
          <Skeleton width={60} height={22} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}
