import React from "react";
import { View, Text } from "react-native";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";

interface JobsFilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function JobsFilterChips({
  options,
  selected,
  onSelect,
}: JobsFilterChipsProps) {
  return (
    <View className="px-4 py-3 bg-white border-b border-gray-100">
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option === selected;
          return (
            <AnimatedPressable
              key={option}
              onPress={() => {
                haptic.selection();
                onSelect(option);
              }}
              className={`px-3 py-2 rounded-full ${isActive ? "bg-primary" : "bg-gray-100"}`}
            >
              <Text
                className={`text-xs font-sans-medium ${isActive ? "text-white" : "text-gray-700"}`}
              >
                {option}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}
