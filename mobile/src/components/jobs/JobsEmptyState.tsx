import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/animated";

interface JobsEmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onPressCta?: () => void;
}

export default function JobsEmptyState({
  icon,
  title,
  subtitle,
  ctaLabel,
  onPressCta,
}: JobsEmptyStateProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-8 items-center">
      <Ionicons name={icon} size={42} color="#CBD5E1" />
      <Text className="text-gray-700 font-sans-semibold text-center mt-4">
        {title}
      </Text>
      <Text className="text-gray-500 text-sm font-sans text-center mt-2">
        {subtitle}
      </Text>
      {ctaLabel && onPressCta && (
        <AnimatedPressable
          onPress={onPressCta}
          className="mt-4 bg-primary px-5 py-2.5 rounded-xl"
        >
          <Text className="text-white text-sm font-sans-semibold">
            {ctaLabel}
          </Text>
        </AnimatedPressable>
      )}
    </View>
  );
}
