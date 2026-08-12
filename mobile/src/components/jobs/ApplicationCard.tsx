import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/animated";

interface ApplicationCardProps {
  application: JobApplication;
  job?: Job;
  onPress?: () => void;
}

const STATUS_LABEL: Record<JobApplication["status"], string> = {
  pending: "En attente",
  reviewed: "Examinee",
  accepted: "Acceptee",
  rejected: "Refusee",
};

export default function ApplicationCard({
  application,
  job,
  onPress,
}: ApplicationCardProps) {
  return (
    <AnimatedPressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-2">
          <Text className="text-base font-heading-bold text-gray-900">
            {job?.title ?? "Offre non disponible"}
          </Text>
          <Text className="text-sm font-sans text-gray-500 mt-0.5">
            {job?.farmName ?? application.applicantName}
          </Text>
        </View>
        <View className="bg-gray-100 px-2.5 py-1 rounded-full">
          <Text className="text-xs font-sans-medium text-gray-700">
            {STATUS_LABEL[application.status]}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
          <Text className="text-xs font-sans text-gray-400 ml-1">
            {new Date(application.appliedDate).toLocaleDateString("fr-FR")}
          </Text>
        </View>
        {job?.contractType ? (
          <Text className="text-xs font-sans text-gray-500">
            {job.contractType}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}
