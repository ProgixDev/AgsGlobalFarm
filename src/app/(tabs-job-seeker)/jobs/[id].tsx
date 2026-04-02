import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useJobsStore } from "@/stores/jobsStore";
import { useUserStore } from "@/stores/userStore";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { TAB_BAR_HEIGHT } from "@/components/ui/FloatingTabBar";

export default function JobSeekerJobDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const getJobById = useJobsStore((state) => state.getJobById);
  const hasApplied = useJobsStore((state) => state.hasApplied);
  const currentUser = useUserStore((state) => state.currentUser);

  const jobId = params.id as string;
  const job = getJobById(jobId);

  const alreadyApplied = !!currentUser && hasApplied(jobId, currentUser.id);

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="bg-primary px-4 py-4">
          <View className="flex-row items-center">
            <AnimatedPressable onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </AnimatedPressable>
            <Text className="flex-1 text-white text-lg font-heading-bold">
              Détails de l&apos;offre
            </Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.mutedLighter}
          />
          <Text className="text-gray-500 font-sans text-center mt-4">
            Offre non trouvée
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleApply = () => {
    haptic.success();
    router.push({
      pathname: "/(tabs-job-seeker)/jobs/apply",
      params: { id: jobId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary px-4 py-4">
        <View className="flex-row items-center">
          <AnimatedPressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </AnimatedPressable>
          <Text className="flex-1 text-white text-lg font-heading-bold">
            Détails de l&apos;offre
          </Text>
          <AnimatedPressable>
            <Ionicons name="bookmark-outline" size={24} color="white" />
          </AnimatedPressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
      >
        {/* Job Title and Company */}
        <Text className="text-2xl font-heading-bold text-gray-800 mb-2">
          {job.title}
        </Text>
        <Text className="text-lg font-sans text-gray-600 mb-4">
          {job.farmName}
        </Text>

        {/* Badges */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          <View
            className={`px-4 py-2 rounded-full ${
              job.contractType === "CDI"
                ? "bg-green-100"
                : job.contractType === "CDD"
                  ? "bg-blue-100"
                  : job.contractType === "Saisonnier"
                    ? "bg-orange-100"
                    : "bg-purple-100"
            }`}
          >
            <Text
              className={`font-sans-medium ${
                job.contractType === "CDI"
                  ? "text-green-700"
                  : job.contractType === "CDD"
                    ? "text-blue-700"
                    : job.contractType === "Saisonnier"
                      ? "text-orange-700"
                      : "text-purple-700"
              }`}
            >
              {job.contractType}
            </Text>
          </View>
          <View className="bg-blue-100 px-4 py-2 rounded-full flex-row items-center">
            <Ionicons name="location" size={14} color={colors.infoDark} />
            <Text className="text-blue-700 font-sans-medium ml-1">
              {job.location}
            </Text>
          </View>
        </View>

        {/* Salary */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="cash" size={20} color={colors.primary} />
            <Text className="text-base font-heading-semibold text-gray-800 ml-2">
              Salaire proposé
            </Text>
          </View>
          <Text className="text-lg text-primary font-sans-bold">
            {job.salaryRange}
          </Text>
        </View>

        {/* Location Details */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="map" size={20} color={colors.primary} />
            <Text className="text-base font-heading-semibold text-gray-800 ml-2">
              Localisation
            </Text>
          </View>
          <Text className="text-base font-sans text-gray-700">
            {job.location}, {job.department}
          </Text>
          <Text className="text-sm font-sans text-gray-600 mt-1">
            Région: {job.region}
          </Text>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-lg font-heading-bold text-gray-800 mb-3">
            Description du poste
          </Text>
          <Text className="text-base font-sans text-gray-700 leading-6">
            {job.description}
          </Text>
        </View>

        {/* Requirements */}
        <View className="mb-6">
          <Text className="text-lg font-heading-bold text-gray-800 mb-3">
            Exigences du poste
          </Text>
          {job.requirements.map((req, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <View className="bg-primary w-2 h-2 rounded-full mt-2 mr-3" />
              <Text className="flex-1 text-base font-sans text-gray-700">
                {req}
              </Text>
            </View>
          ))}
        </View>

        {/* Posted Date and Applicants */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.muted}
              />
              <Text className="text-sm font-sans text-gray-600 ml-2">
                Publié le {new Date(job.postedDate).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="people" size={18} color={colors.muted} />
            <Text className="text-sm font-sans text-gray-600 ml-2">
              {job.applicantsCount} personne
              {job.applicantsCount > 1 ? "s" : ""} ont déjà postulé
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        {alreadyApplied ? (
          <View className="bg-gray-100 rounded-xl py-4 flex-row items-center justify-center">
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
            />
            <Text className="text-gray-600 text-lg font-sans-bold ml-2">
              Candidature envoyée
            </Text>
          </View>
        ) : (
          <AnimatedPressable
            onPress={handleApply}
            className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
          >
            <Ionicons name="send" size={20} color="white" />
            <Text className="text-white text-lg font-sans-bold ml-2">
              Postuler maintenant
            </Text>
          </AnimatedPressable>
        )}
      </View>
    </SafeAreaView>
  );
}
