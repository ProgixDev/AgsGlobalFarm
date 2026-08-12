import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface KpiItem {
  key: string;
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  colorClass?: string;
}

interface JobsKpiCardsProps {
  items: KpiItem[];
}

export default function JobsKpiCards({ items }: JobsKpiCardsProps) {
  return (
    <View className="px-4 pt-4">
      <View className="flex-row gap-3">
        {items.map((item) => (
          <View
            key={item.key}
            className="flex-1 bg-white rounded-2xl border border-gray-200 p-3"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name={item.icon} size={18} color="#6B7280" />
              <Text
                className={`text-xl font-sans-bold ${item.colorClass ?? "text-gray-900"}`}
              >
                {item.value}
              </Text>
            </View>
            <Text className="text-xs font-sans text-gray-500">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
