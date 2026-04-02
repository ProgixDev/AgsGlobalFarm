import React, { useState } from "react";
import { View, Text, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useJobsStore } from "@/stores/jobsStore";
import { useUserStore } from "@/stores/userStore";
import { useMapStore } from "@/stores/mapStore";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { TAB_BAR_HEIGHT } from "@/components/ui/FloatingTabBar";
import JobsHeroHeader from "@/components/jobs/JobsHeroHeader";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import Mapbox, { Camera, MapView, PointAnnotation } from "@rnmapbox/maps";

Mapbox.setAccessToken(
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_ACCESS_TOKEN",
);

function normalizeText(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function getFarmCenter(farm: FarmLocation) {
  if (farm.geometryType === "point" && farm.coordinates)
    return farm.coordinates;
  const points = farm.boundaryCoordinates ?? [];
  if (points.length < 3) return null;
  const total = points.reduce(
    (acc, point) => ({
      longitude: acc.longitude + point.longitude,
      latitude: acc.latitude + point.latitude,
    }),
    { longitude: 0, latitude: 0 },
  );
  return {
    longitude: total.longitude / points.length,
    latitude: total.latitude / points.length,
  };
}

export default function JobDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const getJobById = useJobsStore((state) => state.getJobById);
  const deleteJob = useJobsStore((state) => state.deleteJob);
  const duplicateJob = useJobsStore((state) => state.duplicateJob);
  const hasApplied = useJobsStore((state) => state.hasApplied);
  const userType = useUserStore((state) => state.userType);
  const currentUser = useUserStore((state) => state.currentUser);
  const farmLocations = useMapStore((state) => state.farmLocations);

  useHideTabBar();

  const jobId = params.id as string;
  const job = getJobById(jobId);

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const isRecruiter = (currentUser?.userType ?? userType) === "farm_owner";
  const isMyJob =
    !!job &&
    isRecruiter &&
    (!!currentUser?.id ? job.createdBy === currentUser.id : false);
  const alreadyApplied =
    !isRecruiter && !!currentUser && hasApplied(jobId, currentUser.id);
  const isJobSeeker = !isRecruiter;

  const candidateFarms = farmLocations.filter((farm) => {
    if (!job?.createdBy) return true;
    return farm.userId === job.createdBy;
  });

  const farmMatch = (() => {
    if (!job) return null;
    const farmName = normalizeText(job.farmName);
    const location = normalizeText(job.location);

    const exactName = candidateFarms.find(
      (farm) => normalizeText(farm.name) === farmName,
    );
    if (exactName) return exactName;

    const exactLocation = candidateFarms.find(
      (farm) => normalizeText(farm.name) === location,
    );
    if (exactLocation) return exactLocation;

    const partialMatch = candidateFarms.find((farm) => {
      const name = normalizeText(farm.name);
      return (
        (farmName.length > 0 &&
          (name.includes(farmName) || farmName.includes(name))) ||
        (location.length > 0 &&
          (name.includes(location) || location.includes(name)))
      );
    });
    if (partialMatch) return partialMatch;

    return candidateFarms.find((farm) => getFarmCenter(farm) !== null) ?? null;
  })();

  const farmCenter = farmMatch ? getFarmCenter(farmMatch) : null;

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

  const handleEdit = () => {
    router.push({ pathname: "/(tabs)/jobs/post", params: { id: jobId } });
  };

  const handleDelete = () => {
    haptic.warning();
    deleteJob(jobId);
    router.back();
  };

  const handleDuplicate = () => {
    duplicateJob(jobId);
    router.back();
  };

  const handleViewApplications = () => {
    router.push({
      pathname: "/(tabs)/jobs/applications",
      params: { id: jobId },
    });
  };

  const handleApply = () => {
    haptic.success();
    router.push({ pathname: "/(tabs)/jobs/apply", params: { id: jobId } });
  };

  const handleStatistics = () => {
    setShowStatsModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center flex-1">
            <AnimatedPressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color={colors.muted} />
            </AnimatedPressable>
            <View className="ml-3 flex-1">
              <Text
                className="text-base font-heading-bold text-gray-900"
                numberOfLines={1}
              >
                {job.title}
              </Text>
              <Text
                className="text-xs font-sans text-gray-500"
                numberOfLines={1}
              >
                {job.farmName}
              </Text>
            </View>
          </View>

          {isMyJob ? (
            <AnimatedPressable
              onPress={() => setShowActionMenu(!showActionMenu)}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={colors.muted}
              />
            </AnimatedPressable>
          ) : null}
        </View>

        {!isRecruiter && (
          <JobsHeroHeader
            title={job.title}
            subtitle={`${job.farmName} - ${job.location}`}
            roleLabel="Candidat"
            roleIcon="person-outline"
          />
        )}
      </View>

      {/* Action Menu Dropdown */}
      {showActionMenu && isMyJob && (
        <View className="bg-white border-b border-gray-200 px-4 py-2">
          <AnimatedPressable
            onPress={handleEdit}
            className="flex-row items-center py-3 border-b border-gray-100"
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text className="text-base font-sans text-gray-800 ml-3">
              Modifier
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleViewApplications}
            className="flex-row items-center py-3 border-b border-gray-100"
          >
            <Ionicons name="eye-outline" size={20} color={colors.info} />
            <Text className="text-base font-sans text-gray-800 ml-3">
              Voir candidatures ({job.applicantsCount})
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleDuplicate}
            className="flex-row items-center py-3 border-b border-gray-100"
          >
            <Ionicons name="copy-outline" size={20} color={colors.info} />
            <Text className="text-base font-sans text-gray-800 ml-3">
              Dupliquer
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleStatistics}
            className="flex-row items-center py-3 border-b border-gray-100"
          >
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color={colors.warning}
            />
            <Text className="text-base font-sans text-gray-800 ml-3">
              Statistiques
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleDelete}
            className="flex-row items-center py-3"
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text className="text-base font-sans text-red-500 ml-3">
              Supprimer
            </Text>
          </AnimatedPressable>
        </View>
      )}

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
      >
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

        {isJobSeeker && farmCenter && (
          <View className="mb-6">
            <Text className="text-lg font-heading-bold text-gray-800 mb-3">
              Localisation de la ferme
            </Text>
            <View className="rounded-2xl overflow-hidden border border-gray-200 h-44">
              <MapView
                style={{ flex: 1 }}
                styleURL="mapbox://styles/mapbox/light-v11"
                compassEnabled={false}
                scaleBarEnabled={false}
                logoEnabled={false}
                attributionEnabled={false}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Camera
                  defaultSettings={{
                    centerCoordinate: [
                      farmCenter.longitude,
                      farmCenter.latitude,
                    ],
                    zoomLevel: 10,
                  }}
                />
                <PointAnnotation
                  id={`farm-mini-${farmMatch?.id ?? "unknown"}`}
                  coordinate={[farmCenter.longitude, farmCenter.latitude]}
                >
                  <Ionicons name="location" size={28} color={colors.primary} />
                </PointAnnotation>
              </MapView>
            </View>
          </View>
        )}

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
          {!isMyJob && (
            <View className="flex-row items-center">
              <Ionicons name="people" size={18} color={colors.muted} />
              <Text className="text-sm font-sans text-gray-600 ml-2">
                {job.applicantsCount} personne
                {job.applicantsCount > 1 ? "s" : ""} ont déjà postulé
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        {isMyJob ? (
          <View className="flex-row gap-2">
            <AnimatedPressable
              onPress={handleViewApplications}
              className="flex-1 bg-primary rounded-xl py-4 flex-row items-center justify-center"
            >
              <Ionicons name="eye" size={20} color="white" />
              <Text className="text-white text-lg font-sans-bold ml-2">
                Candidatures ({job.applicantsCount})
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={handleEdit}
              className="bg-gray-100 rounded-xl px-6 py-4 flex-row items-center justify-center"
            >
              <Ionicons name="create" size={20} color={colors.primary} />
            </AnimatedPressable>
          </View>
        ) : alreadyApplied ? (
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

      <Modal
        visible={showStatsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-5">
          <View className="bg-white rounded-2xl w-full p-5 border border-gray-200">
            <Text className="text-lg font-heading-bold text-gray-900 mb-3">
              Statistiques de l&apos;offre
            </Text>

            <View className="bg-gray-50 rounded-xl p-3 mb-2">
              <Text className="text-xs font-sans text-gray-500">Vues</Text>
              <Text className="text-xl font-sans-bold text-gray-900">127</Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-3 mb-2">
              <Text className="text-xs font-sans text-gray-500">
                Candidatures
              </Text>
              <Text className="text-xl font-sans-bold text-gray-900">
                {job.applicantsCount}
              </Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-3 mb-4">
              <Text className="text-xs font-sans text-gray-500">
                Taux de conversion
              </Text>
              <Text className="text-xl font-sans-bold text-gray-900">
                {((job.applicantsCount / 127) * 100).toFixed(1)}%
              </Text>
            </View>

            <AnimatedPressable
              onPress={() => setShowStatsModal(false)}
              className="bg-primary rounded-xl py-3 items-center"
            >
              <Text className="text-white font-sans-semibold">Fermer</Text>
            </AnimatedPressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
