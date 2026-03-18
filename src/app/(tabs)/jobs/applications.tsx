import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useJobsStore } from "@/stores/jobsStore";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import ScreenHeader from "@/components/ui/ScreenHeader";

export default function JobApplicationsScreen() {
  const params = useLocalSearchParams();
  const getJobById = useJobsStore((state) => state.getJobById);
  const getApplicationsByJobId = useJobsStore(
    (state) => state.getApplicationsByJobId,
  );
  const updateApplicationStatus = useJobsStore(
    (state) => state.updateApplicationStatus,
  );

  const jobId = params.id as string;
  const job = getJobById(jobId);
  const applications = getApplicationsByJobId(jobId);

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScreenHeader title="Candidatures" showBack />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-center mt-4">
            Offre non trouvée
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <ScreenHeader title="Candidatures" subtitle={job.title} showBack />

      <ScrollView className="flex-1 px-4 py-4">
        {applications.length > 0 ? (
          applications.map((applicant) => (
            <View
              key={applicant.id}
              className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
            >
              {/* Header with Name and Status */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">
                    {applicant.applicantName}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {applicant.education}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    applicant.status === "pending"
                      ? "bg-orange-100"
                      : applicant.status === "reviewed"
                        ? "bg-blue-100"
                        : applicant.status === "accepted"
                          ? "bg-green-100"
                          : "bg-red-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      applicant.status === "pending"
                        ? "text-orange-700"
                        : applicant.status === "reviewed"
                          ? "text-blue-700"
                          : applicant.status === "accepted"
                            ? "text-green-700"
                            : "text-red-700"
                    }`}
                  >
                    {applicant.status === "pending"
                      ? "En attente"
                      : applicant.status === "reviewed"
                        ? "Examiné"
                        : applicant.status === "accepted"
                          ? "Accepté"
                          : "Rejeté"}
                  </Text>
                </View>
              </View>

              {/* Contact Information */}
              <View className="mb-3">
                {!!applicant.desiredPosition && (
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={colors.muted}
                    />
                    <Text className="text-sm text-gray-600 ml-2">
                      {applicant.desiredPosition}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={colors.muted}
                  />
                  <Text className="text-sm text-gray-600 ml-2">
                    {applicant.applicantEmail}
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color={colors.muted}
                  />
                  <Text className="text-sm text-gray-600 ml-2">
                    {applicant.applicantPhone}
                  </Text>
                </View>
                {!!applicant.applicantAddress && (
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={colors.muted}
                    />
                    <Text className="text-sm text-gray-600 ml-2">
                      {applicant.applicantAddress}
                      {applicant.department ? `, ${applicant.department}` : ""}
                      {applicant.region ? ` — ${applicant.region}` : ""}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name="briefcase-outline"
                    size={16}
                    color={colors.muted}
                  />
                  <Text className="text-sm text-gray-600 ml-2">
                    {applicant.experience}
                  </Text>
                </View>
                {!!applicant.salaryExpectation && (
                  <View className="flex-row items-center">
                    <Ionicons
                      name="cash-outline"
                      size={16}
                      color={colors.muted}
                    />
                    <Text className="text-sm text-gray-600 ml-2">
                      Prétentions : {applicant.salaryExpectation}
                    </Text>
                  </View>
                )}
              </View>

              {/* Cover Letter */}
              {applicant.coverLetter && (
                <View className="bg-gray-50 rounded-lg p-3 mb-3">
                  <Text className="text-xs font-semibold text-gray-700 mb-1">
                    Lettre de motivation
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {applicant.coverLetter}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                <AnimatedPressable
                  onPress={() => {
                    haptic.success();
                    updateApplicationStatus(applicant.id, jobId, "accepted");
                  }}
                  className="flex-1 bg-green-500 rounded-lg py-2.5 flex-row items-center justify-center"
                >
                  <Ionicons name="checkmark-circle" size={18} color="white" />
                  <Text className="text-white text-sm font-medium ml-1">
                    Accepter
                  </Text>
                </AnimatedPressable>
                <AnimatedPressable
                  onPress={() => {
                    haptic.warning();
                    updateApplicationStatus(applicant.id, jobId, "rejected");
                  }}
                  className="flex-1 bg-red-500 rounded-lg py-2.5 flex-row items-center justify-center"
                >
                  <Ionicons name="close-circle" size={18} color="white" />
                  <Text className="text-white text-sm font-medium ml-1">
                    Rejeter
                  </Text>
                </AnimatedPressable>
                <AnimatedPressable className="bg-blue-500 rounded-lg px-4 py-2.5 flex-row items-center justify-center">
                  <Ionicons name="chatbubble-outline" size={18} color="white" />
                </AnimatedPressable>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-xl p-8 items-center">
            <Ionicons name="people-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-4">
              Aucune candidature pour le moment
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
