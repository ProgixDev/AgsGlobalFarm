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
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { useTabBarInset } from "@/components/ui/FloatingTabBar";
import JobsHeroHeader from "@/components/jobs/JobsHeroHeader";
import JobsSegmentedTabs from "@/components/jobs/JobsSegmentedTabs";
import JobsFilterChips from "@/components/jobs/JobsFilterChips";
import JobCard from "@/components/jobs/JobCard";
import ApplicationCard from "@/components/jobs/ApplicationCard";
import JobsEmptyState from "@/components/jobs/JobsEmptyState";

type JobSeekerTab = "discover" | "applications";

const CONTRACT_FILTERS = ["Tous", "CDI", "CDD", "Saisonnier", "Stage"];

export default function JobSeekerJobsScreen() {
  const tabBarInset = useTabBarInset();
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const getPublicActiveJobs = useJobsStore(
    (state) => state.getPublicActiveJobs,
  );
  const getMyApplications = useJobsStore((state) => state.getMyApplications);
  const getJobById = useJobsStore((state) => state.getJobById);
  const hasApplied = useJobsStore((state) => state.hasApplied);

  const [tab, setTab] = useState<JobSeekerTab>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [contractFilter, setContractFilter] = useState("Tous");

  const userId = currentUser?.id ?? "";
  const discoverJobs = getPublicActiveJobs();
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

  const openDetails = (jobId: string) => {
    router.push({
      pathname: "/(tabs-job-seeker)/jobs/[id]",
      params: { id: jobId },
    });
  };

  const goApply = (jobId: string) => {
    router.push({
      pathname: "/(tabs-job-seeker)/jobs/apply",
      params: { id: jobId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <JobsHeroHeader
        title="Emplois"
        subtitle="Consultez les publications et suivez vos candidatures"
        roleLabel="Candidat"
        roleIcon="person-outline"
      />

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
        activeKey={tab}
        onChange={(key) => setTab(key as JobSeekerTab)}
      />

      {tab === "discover" && (
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
            contentContainerStyle={{ paddingBottom: tabBarInset }}
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

      {tab === "applications" && (
        <ScrollView
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ paddingBottom: tabBarInset }}
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
                setTab("discover");
              }}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
