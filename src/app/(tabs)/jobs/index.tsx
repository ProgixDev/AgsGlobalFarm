import React, { useMemo, useState } from "react";
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
import JobsHeroHeader from "@/components/jobs/JobsHeroHeader";
import JobsSegmentedTabs from "@/components/jobs/JobsSegmentedTabs";
import JobsKpiCards from "@/components/jobs/JobsKpiCards";
import JobsFilterChips from "@/components/jobs/JobsFilterChips";
import JobCard from "@/components/jobs/JobCard";
import ApplicationCard from "@/components/jobs/ApplicationCard";
import JobsEmptyState from "@/components/jobs/JobsEmptyState";

type JobSeekerTab = "discover" | "applications";
type RecruiterTab = "overview" | "posts" | "applications";

const CONTRACT_FILTERS = ["Tous", "CDI", "CDD", "Saisonnier", "Stage"];

export default function JobsScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const userType = useUserStore((state) => state.userType);

  const getPublicActiveJobs = useJobsStore(
    (state) => state.getPublicActiveJobs,
  );
  const getRecruiterJobs = useJobsStore((state) => state.getRecruiterJobs);
  const getRecruiterActiveOffersCount = useJobsStore(
    (state) => state.getRecruiterActiveOffersCount,
  );
  const getRecruiterApplications = useJobsStore(
    (state) => state.getRecruiterApplications,
  );
  const getMyApplications = useJobsStore((state) => state.getMyApplications);
  const getJobById = useJobsStore((state) => state.getJobById);
  const hasApplied = useJobsStore((state) => state.hasApplied);

  const [jobSeekerTab, setJobSeekerTab] = useState<JobSeekerTab>("discover");
  const [recruiterTab, setRecruiterTab] = useState<RecruiterTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [contractFilter, setContractFilter] = useState("Tous");

  const isJobSeeker = (currentUser?.userType ?? userType) === "job_seeker";
  const userId = currentUser?.id ?? "";

  const discoverJobs = getPublicActiveJobs();
  const recruiterJobs = getRecruiterJobs(userId);
  const recruiterApplications = getRecruiterApplications(userId);
  const myApplications = currentUser ? getMyApplications(userId) : [];

  const filteredDiscoverJobs = useMemo(() => {
    return discoverJobs.filter((job) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        job.title.toLowerCase().includes(q) ||
        job.farmName.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q);
      const matchesContract =
        contractFilter === "Tous" || job.contractType === contractFilter;
      return matchesSearch && matchesContract;
    });
  }, [discoverJobs, searchQuery, contractFilter]);

  const recruiterApplicationsPending = recruiterApplications.filter(
    (app) => app.status === "pending",
  ).length;
  const recruiterActiveOffers = getRecruiterActiveOffersCount(userId);

  const openDetails = (jobId: string) => {
    router.push({ pathname: "/(tabs)/jobs/[id]", params: { id: jobId } });
  };

  const goApply = (jobId: string) => {
    const isJobSeeker = (currentUser?.userType ?? userType) === "job_seeker";
    router.push({
      pathname: isJobSeeker
        ? "/(tabs-job-seeker)/jobs/apply"
        : "/(tabs)/jobs/apply",
      params: { id: jobId },
    });
  };

  const goApplications = (jobId: string) => {
    router.push({
      pathname: "/(tabs)/jobs/applications",
      params: { id: jobId },
    });
  };

  const goPost = () => {
    router.push("/(tabs)/jobs/post");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <JobsHeroHeader
        title="Emplois"
        subtitle={
          isJobSeeker
            ? "Consultez les publications et suivez vos candidatures"
            : "Pilotez vos offres et vos candidatures"
        }
        roleLabel={isJobSeeker ? "Candidat" : "Recruteur"}
        roleIcon={isJobSeeker ? "person-outline" : "business-outline"}
      />

      {isJobSeeker ? (
        <>
          <JobsSegmentedTabs
            tabs={[
              {
                key: "discover",
                label: "Offres",
                count: filteredDiscoverJobs.length,
              },
              {
                key: "applications",
                label: "Mes candidatures",
                count: myApplications.length,
              },
            ]}
            activeKey={jobSeekerTab}
            onChange={(key) => setJobSeekerTab(key as JobSeekerTab)}
          />

          {jobSeekerTab === "discover" && (
            <>
              <View className="px-4 pt-3 pb-2 bg-white border-b border-gray-100">
                <View className="bg-gray-50 rounded-xl flex-row items-center px-3 py-2.5">
                  <Ionicons name="search" size={18} color={colors.muted} />
                  <TextInput
                    className="flex-1 ml-2 text-sm font-sans text-gray-800"
                    placeholder="Rechercher une offre..."
                    placeholderTextColor={colors.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={colors.muted}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <JobsFilterChips
                options={CONTRACT_FILTERS}
                selected={contractFilter}
                onSelect={setContractFilter}
              />

              <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
              >
                {filteredDiscoverJobs.length > 0 ? (
                  filteredDiscoverJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      applied={currentUser ? hasApplied(job.id, userId) : false}
                      onPress={() => openDetails(job.id)}
                      onPrimaryAction={() => goApply(job.id)}
                      primaryLabel="Postuler"
                    />
                  ))
                ) : (
                  <JobsEmptyState
                    icon="search-outline"
                    title="Aucune offre trouvee"
                    subtitle="Essayez un autre filtre ou modifiez la recherche."
                  />
                )}
              </ScrollView>
            </>
          )}

          {jobSeekerTab === "applications" && (
            <ScrollView
              className="flex-1 px-4 py-4"
              contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
            >
              {myApplications.length > 0 ? (
                myApplications.map((application) => {
                  const job = getJobById(application.jobId);
                  return (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      job={job}
                      onPress={() => job && openDetails(job.id)}
                    />
                  );
                })
              ) : (
                <JobsEmptyState
                  icon="document-outline"
                  title="Aucune candidature"
                  subtitle="Postulez a une offre et suivez son statut ici."
                  ctaLabel="Voir les offres"
                  onPressCta={() => {
                    haptic.selection();
                    setJobSeekerTab("discover");
                  }}
                />
              )}
            </ScrollView>
          )}
        </>
      ) : (
        <>
          <JobsSegmentedTabs
            tabs={[
              { key: "overview", label: "Vue d'ensemble" },
              {
                key: "posts",
                label: "Mes offres",
                count: recruiterJobs.length,
              },
              {
                key: "applications",
                label: "Candidatures",
                count: recruiterApplications.length,
              },
            ]}
            activeKey={recruiterTab}
            onChange={(key) => setRecruiterTab(key as RecruiterTab)}
          />

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
          >
            {recruiterTab === "overview" && (
              <>
                <JobsKpiCards
                  items={[
                    {
                      key: "active",
                      label: "Offres actives",
                      value: recruiterActiveOffers,
                      icon: "briefcase-outline",
                    },
                    {
                      key: "applications",
                      label: "Total candidatures",
                      value: recruiterApplications.length,
                      icon: "people-outline",
                    },
                    {
                      key: "pending",
                      label: "A traiter",
                      value: recruiterApplicationsPending,
                      icon: "time-outline",
                    },
                  ]}
                />

                <View className="px-4 pt-4">
                  <AnimatedPressable
                    onPress={goPost}
                    className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="white"
                    />
                    <Text className="text-white text-base font-sans-semibold ml-2">
                      Publier une offre
                    </Text>
                  </AnimatedPressable>
                </View>
              </>
            )}

            {recruiterTab === "posts" && (
              <View className="px-4 py-4">
                {recruiterJobs.length > 0 ? (
                  recruiterJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onPress={() => openDetails(job.id)}
                      onPrimaryAction={() => goApplications(job.id)}
                      primaryLabel="Candidatures"
                    />
                  ))
                ) : (
                  <JobsEmptyState
                    icon="briefcase-outline"
                    title="Aucune offre publiee"
                    subtitle="Publiez votre premiere offre pour recevoir des candidatures."
                    ctaLabel="Publier"
                    onPressCta={goPost}
                  />
                )}
              </View>
            )}

            {recruiterTab === "applications" && (
              <View className="px-4 py-4">
                {recruiterApplications.length > 0 ? (
                  recruiterApplications.map((application) => {
                    const job = getJobById(application.jobId);
                    return (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        job={job}
                        onPress={() => job && goApplications(job.id)}
                      />
                    );
                  })
                ) : (
                  <JobsEmptyState
                    icon="people-outline"
                    title="Aucune candidature"
                    subtitle="Les candidatures recues sur vos offres apparaitront ici."
                  />
                )}
              </View>
            )}

            {recruiterTab === "posts" && recruiterJobs.length > 0 && null}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}
