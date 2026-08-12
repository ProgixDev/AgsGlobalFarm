import React from "react";
import { View, Text } from "react-native";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";

interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface JobsSegmentedTabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function JobsSegmentedTabs({
  tabs,
  activeKey,
  onChange,
}: JobsSegmentedTabsProps) {
  return (
    <View className="px-4 pt-3 pb-2 bg-white border-b border-gray-100">
      <View className="flex-row bg-gray-50 rounded-xl p-1">
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key;
          return (
            <AnimatedPressable
              key={tab.key}
              onPress={() => {
                haptic.selection();
                onChange(tab.key);
              }}
              className={`flex-1 rounded-lg py-2.5 px-2 flex-row items-center justify-center ${isActive ? "bg-primary" : ""}`}
            >
              <Text
                className={`text-xs font-sans-semibold ${isActive ? "text-white" : "text-gray-600"}`}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {typeof tab.count === "number" && tab.count > 0 && (
                <View
                  className={`ml-1.5 min-w-5 h-5 rounded-full items-center justify-center px-1 ${isActive ? "bg-white/25" : "bg-gray-200"}`}
                >
                  <Text
                    className={`text-[10px] font-sans-bold ${isActive ? "text-white" : "text-gray-700"}`}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}
