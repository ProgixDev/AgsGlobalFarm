import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/animated";

interface JobCardProps {
  job: Job;
  applied?: boolean;
  onPress?: () => void;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
}

export default function JobCard({
  job,
  applied,
  onPress,
  onPrimaryAction,
  primaryLabel,
}: JobCardProps) {
  const showAction = !!onPrimaryAction && !!primaryLabel;

  return (
    <AnimatedPressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
    >
      <View className="flex-row items-start justify-between mb-1">
        <Text className="flex-1 text-base font-heading-bold text-gray-900 mr-2">
          {job.title}
        </Text>
        <View className="px-2 py-0.5 rounded-full bg-gray-100">
          <Text className="text-xs font-sans-medium text-gray-700">
            {job.contractType}
          </Text>
        </View>
      </View>

      <Text className="text-sm font-sans text-gray-500 mb-2">
        {job.farmName}
      </Text>

      <View className="flex-row items-center mb-1">
        <Ionicons name="location-outline" size={14} color="#6B7280" />
        <Text className="text-sm font-sans text-gray-600 ml-1">
          {job.location}
        </Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="cash-outline" size={14} color="#6B7280" />
        <Text className="text-sm font-sans text-gray-600 ml-1">
          {job.salaryRange}
        </Text>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <Text className="text-xs font-sans text-gray-400">
          {job.applicantsCount} candidature
          {job.applicantsCount !== 1 ? "s" : ""}
        </Text>

        {applied ? (
          <View className="bg-green-50 rounded-lg px-3 py-1.5">
            <Text className="text-green-700 text-xs font-sans-medium">
              Candidature envoyee
            </Text>
          </View>
        ) : showAction ? (
          <AnimatedPressable
            onPress={onPrimaryAction}
            className="bg-primary rounded-lg px-3 py-1.5"
          >
            <Text className="text-white text-xs font-sans-semibold">
              {primaryLabel}
            </Text>
          </AnimatedPressable>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}
