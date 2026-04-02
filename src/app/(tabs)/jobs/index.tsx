import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { useJobsStore } from "@/stores/jobsStore";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { TAB_BAR_HEIGHT } from "@/components/ui/FloatingTabBar";

type JobSeekerTab = "offres" | "candidatures";

const CONTRACT_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  CDI: { bg: "bg-green-100", text: "text-green-700" },
  CDD: { bg: "bg-blue-100", text: "text-blue-700" },
  Saisonnier: { bg: "bg-orange-100", text: "text-orange-700" },
  Stage: { bg: "bg-purple-100", text: "text-purple-700" },
};

const APPLICATION_STATUS: Record<
  string,
  { label: string; bg: string; text: string; icon: string }
> = {
  pending: {
    label: "En attente",
    bg: "bg-orange-100",
    text: "text-orange-700",
    icon: "time-outline",
  },
  reviewed: {
    label: "Examinée",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: "eye-outline",
  },
  accepted: {
    label: "Acceptée",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: "checkmark-circle-outline",
  },
  rejected: {
    label: "Refusée",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: "close-circle-outline",
  },
};

export default function JobsScreen() {
  const router = useRouter();
  const userType = useUserStore((state) => state.userType);
  const currentUser = useUserStore((state) => state.currentUser);
  const allJobs = useJobsStore((state) => state.allJobs);
  const myJobs = useJobsStore((state) => state.myJobs);
  const deleteJob = useJobsStore((state) => state.deleteJob);
  const duplicateJob = useJobsStore((state) => state.duplicateJob);
  const getMyApplications = useJobsStore((state) => state.getMyApplications);
  const getJobById = useJobsStore((state) => state.getJobById);
  const hasApplied = useJobsStore((state) => state.hasApplied);

  const [jobSeekerTab, setJobSeekerTab] = useState<JobSeekerTab>("offres");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContractType, setSelectedContractType] =
    useState<string>("all");

  const isJobSeeker = (currentUser?.userType ?? userType) === "job_seeker";

  const myApplications = currentUser ? getMyApplications(currentUser.id) : [];

  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContract =
      selectedContractType === "all" ||
      job.contractType === selectedContractType;
    return matchesSearch && matchesContract;
  });

  const handleOpenJobDetails = (jobId: string) => {
    router.push({ pathname: "/(tabs)/jobs/[id]", params: { id: jobId } });
  };

  const handleApply = (jobId: string) => {
    router.push({ pathname: "/(tabs)/jobs/apply", params: { id: jobId } });
  };

  const handleOpenJobForm = () => {
    router.push("/(tabs)/jobs/post");
  };

  const handleEditJob = (jobId: string) => {
    router.push({ pathname: "/(tabs)/jobs/post", params: { id: jobId } });
  };

  const handleViewApplications = (jobId: string) => {
    router.push({
      pathname: "/(tabs)/jobs/applications",
      params: { id: jobId },
    });
  };

  const contractStyle = (type: string) =>
    CONTRACT_TYPE_STYLES[type] ?? { bg: "bg-gray-100", text: "text-gray-700" };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white text-2xl font-heading-bold">
              Emplois Agricoles
            </Text>
            <Text className="text-white/80 text-sm font-sans mt-1">
              {isJobSeeker ? "Trouvez votre opportunité" : "Gérez vos offres"}
            </Text>
          </View>
          <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center">
            <Ionicons
              name={isJobSeeker ? "person-outline" : "business-outline"}
              size={18}
              color="white"
            />
            <Text className="text-white text-xs ml-2 font-sans-medium">
              {isJobSeeker ? "Candidat" : "Recruteur"}
            </Text>
          </View>
        </View>

        {/* Job seeker tabs */}
        {isJobSeeker && (
          <View className="flex-row bg-white/20 rounded-xl p-1 mb-3">
            <AnimatedPressable
              onPress={() => {
                haptic.selection();
                setJobSeekerTab("offres");
              }}
              className={`flex-1 rounded-lg py-2 items-center ${jobSeekerTab === "offres" ? "bg-white" : ""}`}
            >
              <Text
                className={`text-sm font-sans-semibold ${jobSeekerTab === "offres" ? "text-primary" : "text-white"}`}
              >
                Offres
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => {
                haptic.selection();
                setJobSeekerTab("candidatures");
              }}
              className={`flex-1 rounded-lg py-2 items-center flex-row justify-center gap-2 ${jobSeekerTab === "candidatures" ? "bg-white" : ""}`}
            >
              <Text
                className={`text-sm font-sans-semibold ${jobSeekerTab === "candidatures" ? "text-primary" : "text-white"}`}
              >
                Mes candidatures
              </Text>
              {myApplications.length > 0 && (
                <View
                  className={`rounded-full w-5 h-5 items-center justify-center ${jobSeekerTab === "candidatures" ? "bg-primary" : "bg-white/40"}`}
                >
                  <Text
                    className={`text-xs font-sans-bold ${jobSeekerTab === "candidatures" ? "text-white" : "text-white"}`}
                  >
                    {myApplications.length}
                  </Text>
                </View>
              )}
            </AnimatedPressable>
          </View>
        )}

        {/* Search + filters — offres tab only */}
        {isJobSeeker && jobSeekerTab === "offres" && (
          <View>
            <View className="bg-white rounded-xl flex-row items-center px-4 py-3 mb-3">
              <Ionicons name="search" size={20} color={colors.mutedLight} />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-800"
                placeholder="Rechercher un emploi..."
                placeholderTextColor={colors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.mutedLight}
                  />
                </TouchableOpacity>
              )}
            </View>

            <AnimatedPressable
              onPress={() => {
                haptic.selection();
                setShowFilters(!showFilters);
              }}
              className="bg-white/20 rounded-xl px-4 py-2 flex-row items-center justify-center"
            >
              <Ionicons name="options-outline" size={18} color="white" />
              <Text className="text-white text-sm ml-2 font-sans-medium">
                Filtres
              </Text>
              {selectedContractType !== "all" && (
                <View className="bg-white rounded-full w-2 h-2 ml-2" />
              )}
            </AnimatedPressable>

            {showFilters && (
              <View className="bg-white rounded-xl p-4 mt-3">
                <Text className="text-sm font-sans-semibold text-gray-800 mb-3">
                  Type de contrat
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {["all", "CDI", "CDD", "Saisonnier", "Stage"].map((type) => (
                    <AnimatedPressable
                      key={type}
                      onPress={() => {
                        haptic.selection();
                        setSelectedContractType(type);
                      }}
                      className={`px-4 py-2 rounded-full ${selectedContractType === type ? "bg-primary" : "bg-gray-100"}`}
                    >
                      <Text
                        className={`text-sm font-sans-medium ${selectedContractType === type ? "text-white" : "text-gray-700"}`}
                      >
                        {type === "all" ? "Tous" : type}
                      </Text>
                    </AnimatedPressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── Job seeker: Offres tab ── */}
      {isJobSeeker && jobSeekerTab === "offres" && (
        <ScrollView
          className="flex-1 px-6 py-4"
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
        >
          <Text className="text-sm font-sans text-gray-500 mb-3">
            {filteredJobs.length} offre{filteredJobs.length !== 1 ? "s" : ""}{" "}
            disponible{filteredJobs.length !== 1 ? "s" : ""}
          </Text>

          {filteredJobs.map((job) => {
            const style = contractStyle(job.contractType);
            const applied = currentUser
              ? hasApplied(job.id, currentUser.id)
              : false;

            return (
              <AnimatedPressable
                key={job.id}
                onPress={() => handleOpenJobDetails(job.id)}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="flex-1 text-base font-heading-bold text-gray-800 mr-2">
                    {job.title}
                  </Text>
                  <View className={`px-2 py-0.5 rounded-full ${style.bg}`}>
                    <Text className={`text-xs font-sans-medium ${style.text}`}>
                      {job.contractType}
                    </Text>
                  </View>
                </View>

                <Text className="text-sm font-sans text-gray-500 mb-3">
                  {job.farmName}
                </Text>

                <View className="flex-row items-center mb-1">
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <Text className="text-sm font-sans text-gray-600 ml-1">
                    {job.location}
                  </Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="cash-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <Text className="text-sm font-sans text-gray-600 ml-1">
                    {job.salaryRange}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={colors.muted}
                    />
                    <Text className="text-xs font-sans text-gray-400 ml-1">
                      {job.applicantsCount} candidature
                      {job.applicantsCount !== 1 ? "s" : ""}
                    </Text>
                  </View>

                  {applied ? (
                    <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-lg">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={colors.primary}
                      />
                      <Text className="text-green-700 text-xs font-sans-medium ml-1">
                        Candidature envoyée
                      </Text>
                    </View>
                  ) : (
                    <AnimatedPressable
                      onPress={() => handleApply(job.id)}
                      className="bg-primary px-3 py-1.5 rounded-lg"
                    >
                      <Text className="text-white text-xs font-sans-semibold">
                        Postuler
                      </Text>
                    </AnimatedPressable>
                  )}
                </View>
              </AnimatedPressable>
            );
          })}

          {filteredJobs.length === 0 && (
            <View className="bg-white rounded-xl p-8 items-center mt-4">
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.mutedLighter}
              />
              <Text className="text-gray-500 text-center mt-4 font-sans-medium">
                Aucune offre trouvée
              </Text>
              <Text className="text-gray-400 text-center text-sm font-sans mt-2">
                Modifiez vos critères de recherche
              </Text>
            </View>
          )}

          <View className="h-4" />
        </ScrollView>
      )}

      {/* ── Job seeker: Mes candidatures tab ── */}
      {isJobSeeker && jobSeekerTab === "candidatures" && (
        <ScrollView
          className="flex-1 px-6 py-4"
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
        >
          {myApplications.length > 0 ? (
            <>
              <Text className="text-sm font-sans text-gray-500 mb-3">
                {myApplications.length} candidature
                {myApplications.length !== 1 ? "s" : ""} soumise
                {myApplications.length !== 1 ? "s" : ""}
              </Text>

              {myApplications.map((application) => {
                const job = getJobById(application.jobId);
                const statusInfo =
                  APPLICATION_STATUS[application.status] ??
                  APPLICATION_STATUS.pending;
                const contractStyle_ = job
                  ? contractStyle(job.contractType)
                  : { bg: "bg-gray-100", text: "text-gray-700" };

                return (
                  <AnimatedPressable
                    key={application.id}
                    onPress={() =>
                      job && handleOpenJobDetails(application.jobId)
                    }
                    className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
                  >
                    {/* Status badge */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-2">
                        <Text className="text-base font-heading-bold text-gray-800">
                          {job?.title ?? "Offre non disponible"}
                        </Text>
                        <Text className="text-sm font-sans text-gray-500 mt-0.5">
                          {job?.farmName}
                        </Text>
                      </View>
                      <View
                        className={`flex-row items-center px-2 py-1 rounded-full ${statusInfo.bg}`}
                      >
                        <Ionicons
                          name={statusInfo.icon as any}
                          size={12}
                          color={
                            application.status === "accepted"
                              ? colors.primaryDark
                              : application.status === "rejected"
                                ? colors.dangerDarker
                                : application.status === "reviewed"
                                  ? colors.infoDarker
                                  : colors.warningDarker
                          }
                        />
                        <Text
                          className={`text-xs font-sans-medium ml-1 ${statusInfo.text}`}
                        >
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    {job && (
                      <View className="flex-row items-center gap-3 mb-3">
                        <View
                          className={`px-2 py-0.5 rounded-full ${contractStyle_.bg}`}
                        >
                          <Text
                            className={`text-xs font-sans-medium ${contractStyle_.text}`}
                          >
                            {job.contractType}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons
                            name="location-outline"
                            size={13}
                            color={colors.muted}
                          />
                          <Text className="text-xs font-sans text-gray-500 ml-0.5">
                            {job.location}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="calendar-outline"
                          size={13}
                          color={colors.mutedLight}
                        />
                        <Text className="text-xs font-sans text-gray-400 ml-1">
                          Envoyée le{" "}
                          {new Date(application.appliedDate).toLocaleDateString(
                            "fr-FR",
                          )}
                        </Text>
                      </View>
                      {application.status === "accepted" && (
                        <View className="flex-row items-center">
                          <Ionicons
                            name="star"
                            size={13}
                            color={colors.primary}
                          />
                          <Text className="text-xs text-green-600 font-sans-medium ml-1">
                            Félicitations !
                          </Text>
                        </View>
                      )}
                    </View>
                  </AnimatedPressable>
                );
              })}
            </>
          ) : (
            <View className="bg-white rounded-xl p-8 items-center mt-4">
              <Ionicons
                name="document-outline"
                size={48}
                color={colors.mutedLighter}
              />
              <Text className="text-gray-500 text-center mt-4 font-sans-medium">
                Aucune candidature pour le moment
              </Text>
              <Text className="text-gray-400 text-center text-sm font-sans mt-2">
                Parcourez les offres et postulez depuis l&apos;onglet{" "}
                <Text className="text-primary font-sans-medium">Offres</Text>
              </Text>
              <AnimatedPressable
                onPress={() => {
                  haptic.selection();
                  setJobSeekerTab("offres");
                }}
                className="mt-4 bg-primary px-6 py-2.5 rounded-xl"
              >
                <Text className="text-white text-sm font-sans-semibold">
                  Voir les offres
                </Text>
              </AnimatedPressable>
            </View>
          )}

          <View className="h-4" />
        </ScrollView>
      )}

      {/* ── Recruiter view ── */}
      {!isJobSeeker && (
        <ScrollView
          className="flex-1 px-6 py-4"
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
        >
          {/* Stats */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="briefcase" size={24} color={colors.primary} />
                <Text className="text-2xl font-sans-bold text-gray-800">
                  {myJobs.length}
                </Text>
              </View>
              <Text className="text-sm font-sans text-gray-600">
                Offres actives
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="people" size={24} color={colors.info} />
                <Text className="text-2xl font-sans-bold text-gray-800">
                  {myJobs.reduce((sum, job) => sum + job.applicantsCount, 0)}
                </Text>
              </View>
              <Text className="text-sm font-sans text-gray-600">
                Candidatures
              </Text>
            </View>
          </View>

          {/* Post Job Button */}
          <AnimatedPressable
            onPress={handleOpenJobForm}
            className="bg-primary rounded-xl py-4 mb-4 flex-row items-center justify-center"
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white text-lg font-sans-bold ml-2">
              Publier une offre
            </Text>
          </AnimatedPressable>

          {/* My Jobs */}
          <Text className="text-lg font-heading-bold text-gray-800 mb-3">
            Mes offres publiées
          </Text>

          {myJobs.length > 0 ? (
            myJobs.map((job) => {
              const style = contractStyle(job.contractType);
              return (
                <View
                  key={job.id}
                  className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-base font-heading-bold text-gray-800 mb-1">
                        {job.title}
                      </Text>
                      <Text className="text-sm font-sans text-gray-500">
                        {job.farmName}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap gap-2 mb-3">
                    <View className={`px-3 py-1 rounded-full ${style.bg}`}>
                      <Text
                        className={`text-xs font-sans-medium ${style.text}`}
                      >
                        {job.contractType}
                      </Text>
                    </View>
                    <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                      <Ionicons
                        name="location"
                        size={12}
                        color={colors.infoDark}
                      />
                      <Text className="text-blue-700 text-xs font-sans-medium ml-1">
                        {job.location}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <Ionicons
                      name="cash-outline"
                      size={16}
                      color={colors.muted}
                    />
                    <Text className="text-sm font-sans text-gray-600 ml-1">
                      {job.salaryRange}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color={colors.muted}
                      />
                      <Text className="text-xs font-sans text-gray-500 ml-1">
                        {job.applicantsCount} candidature
                        {job.applicantsCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={colors.muted}
                      />
                      <Text className="text-xs font-sans text-gray-500 ml-1">
                        {new Date(job.postedDate).toLocaleDateString("fr-FR")}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 mt-3">
                    <AnimatedPressable
                      onPress={() => handleViewApplications(job.id)}
                      className="flex-1 bg-primary rounded-lg py-2.5 flex-row items-center justify-center"
                    >
                      <Ionicons name="eye-outline" size={18} color="white" />
                      <Text
                        className="text-white text-sm font-sans-medium ml-2"
                        numberOfLines={1}
                      >
                        Candidatures
                      </Text>
                    </AnimatedPressable>
                    <AnimatedPressable
                      onPress={() => handleEditJob(job.id)}
                      className="flex-1 bg-blue-500 rounded-lg py-2.5 items-center justify-center"
                    >
                      <Ionicons name="create-outline" size={18} color="white" />
                    </AnimatedPressable>
                    <AnimatedPressable
                      onPress={() => duplicateJob(job.id)}
                      className="flex-1 bg-purple-500 rounded-lg py-2.5 items-center justify-center"
                    >
                      <Ionicons name="copy-outline" size={18} color="white" />
                    </AnimatedPressable>
                    <AnimatedPressable
                      onPress={() => {
                        haptic.warning();
                        deleteJob(job.id);
                      }}
                      className="flex-1 bg-red-500 rounded-lg py-2.5 items-center justify-center"
                    >
                      <Ionicons name="trash-outline" size={18} color="white" />
                    </AnimatedPressable>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="bg-white rounded-xl p-8 items-center">
              <Ionicons
                name="briefcase-outline"
                size={48}
                color={colors.mutedLighter}
              />
              <Text className="text-gray-500 font-sans text-center mt-4">
                Aucune offre publiée
              </Text>
              <Text className="text-gray-400 text-center text-sm font-sans mt-2">
                Commencez par publier votre première offre
              </Text>
            </View>
          )}

          <View className="h-4" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
