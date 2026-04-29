import React, { useEffect, useMemo, useState } from "react";
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
import { useJobsStore, jobIdOf, appIdOf } from "@/stores/jobsStore";
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
  const allJobs = useJobsStore((state) => state.allJobs);
  const allJobsStatus = useJobsStore((state) => state.allJobsStatus);
  const loadAllJobs = useJobsStore((state) => state.loadAllJobs);
  const myApplications = useJobsStore((state) => state.myApplications);
  const loadMyApplications = useJobsStore((state) => state.loadMyApplications);
  const getJobById = useJobsStore((state) => state.getJobById);
  const hasApplied = useJobsStore((state) => state.hasApplied);

  const [tab, setTab] = useState<JobSeekerTab>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [contractFilter, setContractFilter] = useState("Tous");

  useEffect(() => {
    if (allJobsStatus === "idle") loadAllJobs();
    if (currentUser) loadMyApplications();
  }, [allJobsStatus, loadAllJobs, loadMyApplications, currentUser]);

  const filteredDiscoverJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (job.status !== "active") return false;
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
  }, [allJobs, searchQuery, contractFilter]);

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
              filteredDiscoverJobs.map((job) => {
                const id = jobIdOf(job);
                return (
                  <JobCard
                    key={id}
                    job={job}
                    applied={currentUser ? hasApplied(id) : false}
                    onPress={() => openDetails(id)}
                    onPrimaryAction={() => goApply(id)}
                    primaryLabel="Postuler"
                  />
                );
              })
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
                  key={appIdOf(application)}
                  application={application}
                  job={job}
                  onPress={() => job && openDetails(jobIdOf(job))}
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
