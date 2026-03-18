import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
}

export default function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  children,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="bg-primary px-6 pb-6"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-3">
          {showBack && (
            <AnimatedPressable
              onPress={() => router.back()}
              hapticType="light"
              className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </AnimatedPressable>
          )}
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">{title}</Text>
            {subtitle && (
              <Text className="text-white/70 text-sm mt-0.5">{subtitle}</Text>
            )}
          </View>
        </View>
        {rightAction}
      </View>
      {children}
    </View>
  );
}
