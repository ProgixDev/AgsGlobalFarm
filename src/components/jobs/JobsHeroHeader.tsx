import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface JobsHeroHeaderProps {
  title: string;
  subtitle: string;
  roleLabel: string;
  roleIcon: React.ComponentProps<typeof Ionicons>["name"];
}

export default function JobsHeroHeader({
  title,
  subtitle,
  roleLabel,
  roleIcon,
}: JobsHeroHeaderProps) {
  return (
    <View className="bg-white border-b border-gray-100 px-4 pt-4 pb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-heading-bold text-gray-900">
            {title}
          </Text>
          <Text className="text-sm font-sans text-gray-500 mt-1">
            {subtitle}
          </Text>
        </View>
        <View className="bg-gray-100 px-3 py-2 rounded-full flex-row items-center">
          <Ionicons name={roleIcon} size={14} color="#4B5563" />
          <Text className="text-xs font-sans-semibold text-gray-700 ml-1.5">
            {roleLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
