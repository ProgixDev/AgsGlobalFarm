import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/components/ui/BackButton";

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

  return (
    <View
      className="bg-primary px-6 pb-6"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-3">
          {showBack && <BackButton variant="light" />}
          <View className="flex-1">
            <Text className="text-white text-2xl font-heading-bold">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-white/70 text-sm font-sans mt-0.5">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightAction}
      </View>
      {children}
    </View>
  );
}
