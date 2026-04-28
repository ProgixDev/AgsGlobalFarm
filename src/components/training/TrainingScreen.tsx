import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { useTrainingStore } from "@/stores/trainingStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { useTabBarInset } from "@/components/ui/FloatingTabBar";

const CARD_WIDTH = Dimensions.get("window").width * 0.72;

function getLevelBgColor(level: string) {
  const l = level.toLowerCase();
  if (l.includes("débutant") || l.includes("debutant")) return "bg-green-100";
  if (l.includes("intermédiaire") || l.includes("intermediaire"))
    return "bg-orange-100";
  if (l.includes("avancé") || l.includes("avance")) return "bg-red-100";
  return "bg-gray-100";
}

function getLevelTextColor(level: string) {
  const l = level.toLowerCase();
  if (l.includes("débutant") || l.includes("debutant")) return "text-green-700";
  if (l.includes("intermédiaire") || l.includes("intermediaire"))
    return "text-orange-700";
  if (l.includes("avancé") || l.includes("avance")) return "text-red-700";
  return "text-gray-700";
}

function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function getNextOpenSession(formation: PresentialFormation) {
  const sessions = (formation.sessions || []).filter(
    (s) => s.status === "open",
  );
  if (sessions.length === 0) return null;
  return sessions.reduce((earliest, s) => {
    const sStart =
      typeof s.startDate === "string" ? new Date(s.startDate) : s.startDate;
    const eStart =
      typeof earliest.startDate === "string"
        ? new Date(earliest.startDate)
        : earliest.startDate;
    return sStart < eStart ? s : earliest;
  });
}

export default function TrainingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const online = useTrainingStore((state) => state.online);
  const presential = useTrainingStore((state) => state.presential);
  const formationsStatus = useTrainingStore((state) => state.formationsStatus);
  const formationsError = useTrainingStore((state) => state.formationsError);
  const loadFormations = useTrainingStore((state) => state.loadFormations);
  const loadOwned = useTrainingStore((state) => state.loadOwned);
  const ownedOnline = useTrainingStore((state) => state.ownedOnline);
  const ownedPresential = useTrainingStore((state) => state.ownedPresential);
  const getProgressPercentage = useTrainingStore(
    (state) => state.getProgressPercentage,
  );
  const loadProgress = useTrainingStore((state) => state.loadProgress);

  useEffect(() => {
    if (formationsStatus === "idle") {
      loadFormations();
      loadOwned();
    }
  }, [formationsStatus, loadFormations, loadOwned]);

  useEffect(() => {
    ownedOnline.forEach((f) => {
      loadProgress(f._id);
    });
  }, [ownedOnline, loadProgress]);

  const ownedCount = ownedOnline.length + ownedPresential.length;
  const totalCount = online.length + presential.length;

  const ownedFormations: (OnlineFormation | PresentialFormation)[] = [
    ...ownedOnline,
    ...ownedPresential,
  ];

  const allFormations: (OnlineFormation | PresentialFormation)[] = [
    ...online,
    ...presential,
  ];

  const isLoading = formationsStatus === "loading";
  const hasError = formationsStatus === "error";

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: tabBarInset }}
    >
      <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-sans-semibold uppercase tracking-wider text-gray-500">
            Formation
          </Text>
          {ownedCount > 0 && (
            <AnimatedPressable
              className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
              onPress={() => {
                haptic.selection();
                router.push("/training/dashboard");
              }}
            >
              <Ionicons name="stats-chart" size={18} color={colors.primary} />
            </AnimatedPressable>
          )}
        </View>

        <View className="bg-white border border-gray-100 rounded-3xl p-4">
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mr-3">
              <Ionicons name="school" size={26} color={colors.white} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-heading-bold text-gray-900">
                Développez vos compétences
              </Text>
              <Text className="text-xs font-sans text-gray-500 mt-0.5">
                Cours pratiques pour progresser pas à pas
              </Text>
            </View>
          </View>

          <View className="flex-row mt-4 gap-2">
            <View className="flex-1 rounded-2xl bg-primary/5 border border-primary/15 px-3 py-3">
              <Text className="text-[11px] font-sans-semibold uppercase tracking-wide text-primary/80">
                Formations
              </Text>
              <Text className="text-2xl font-heading-bold text-primary mt-1">
                {totalCount}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-3">
              <Text className="text-[11px] font-sans-semibold uppercase tracking-wide text-emerald-700">
                Mes formations
              </Text>
              <Text className="text-2xl font-heading-bold text-emerald-700 mt-1">
                {ownedCount}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <FadeInView className="px-5 mt-2" delay={80}>
        <AnimatedPressable
          className="bg-[#fffdf8] border border-[#e8dfc5] rounded-3xl p-4"
          onPress={() => {
            haptic.selection();
            router.push("/itineraire/generator" as Href);
          }}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-[#f5edd1] items-center justify-center mr-3">
              <Ionicons
                name="leaf-outline"
                size={22}
                color={colors.primaryDark}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-heading-bold text-gray-900">
                Générateur d&apos;itinéraire technique
              </Text>
              <Text className="text-xs font-sans text-gray-600 mt-0.5">
                Programme fertilisation + phyto adapté à votre superficie,
                téléchargeable en PDF.
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.primaryDark}
            />
          </View>
        </AnimatedPressable>
      </FadeInView>

      {ownedCount > 0 && (
        <FadeInView className="px-5 mt-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider">
              Mes formations
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            {ownedFormations.map((f) => {
              const isOnline = f.type === "online";
              const progress = isOnline ? getProgressPercentage(f._id) : 0;

              return (
                <AnimatedPressable
                  key={f._id}
                  className="bg-white border border-gray-100 rounded-3xl mr-3 overflow-hidden"
                  style={{ width: CARD_WIDTH }}
                  onPress={() => router.push(`/training/${f._id}` as Href)}
                >
                  <Image
                    source={{ uri: f.image }}
                    className="w-full h-32 rounded-t-2xl"
                    resizeMode="cover"
                  />
                  <View className="p-4">
                    <View className="flex-row items-center mb-1.5">
                      <View
                        className={`px-2 py-0.5 rounded-full ${isOnline ? "bg-blue-100" : "bg-purple-100"}`}
                      >
                        <Text
                          className={`text-[10px] font-sans-bold uppercase ${isOnline ? "text-blue-700" : "text-purple-700"}`}
                        >
                          {isOnline ? "En ligne" : "Présentiel"}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-base font-heading-bold text-gray-900 mb-3"
                      numberOfLines={2}
                    >
                      {f.title}
                    </Text>

                    {isOnline ? (
                      <>
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-xs font-sans text-gray-500">
                            Progression
                          </Text>
                          <Text className="text-xs font-sans-semibold text-primary">
                            {progress}%
                          </Text>
                        </View>
                        <View className="bg-primary/15 h-2 rounded-full mb-1.5 overflow-hidden">
                          <View
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                      </>
                    ) : (
                      <Text className="text-xs font-sans text-gray-500">
                        {(f as PresentialFormation).durationDays} jours ·{" "}
                        {(f as PresentialFormation).address}
                      </Text>
                    )}
                  </View>
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </FadeInView>
      )}

      <FadeInView className="px-5 mt-5 pb-8" delay={100}>
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {ownedCount > 0 ? "Toutes les formations" : "Formations disponibles"}
        </Text>

        {isLoading && (
          <View className="items-center px-6 py-16">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-sm font-sans text-gray-500 mt-3">
              Chargement des formations...
            </Text>
          </View>
        )}

        {hasError && !isLoading && (
          <View className="items-center px-6 py-16">
            <Ionicons
              name="cloud-offline-outline"
              size={64}
              color={colors.mutedLight}
            />
            <Text className="text-base font-heading-bold text-gray-700 mt-3">
              Impossible de charger les formations
            </Text>
            {formationsError && (
              <Text className="text-xs font-sans text-gray-500 mt-1 text-center">
                {formationsError}
              </Text>
            )}
            <AnimatedPressable
              className="mt-4 px-5 py-2.5 rounded-full bg-primary"
              onPress={() => {
                loadFormations();
                loadOwned();
              }}
            >
              <Text className="text-sm font-sans-semibold text-white">
                Réessayer
              </Text>
            </AnimatedPressable>
          </View>
        )}

        {!isLoading &&
          !hasError &&
          allFormations.map((f) => {
            const isOnline = f.type === "online";
            const owned = !!f.owned;
            const progress = isOnline ? getProgressPercentage(f._id) : 0;
            const presentialFormation = isOnline
              ? null
              : (f as PresentialFormation);
            const nextSession = presentialFormation
              ? getNextOpenSession(presentialFormation)
              : null;

            return (
              <AnimatedPressable
                key={f._id}
                className="bg-white rounded-3xl border border-gray-100 mb-3 p-3"
                onPress={() => router.push(`/training/${f._id}` as Href)}
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: f.image }}
                    className="w-24 rounded-2xl"
                    style={{ alignSelf: "stretch" }}
                    resizeMode="cover"
                  />
                  <View className="flex-1 pl-3">
                    <View className="flex-row items-start justify-between mb-1.5">
                      <Text
                        className="text-base font-heading-bold text-gray-900 flex-1 mr-2"
                        numberOfLines={2}
                      >
                        {f.title}
                      </Text>
                      {owned && (
                        <View className="bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                          <Text className="text-primary text-xs font-sans-semibold">
                            Inscrit
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      className="text-xs font-sans text-muted-foreground mb-3"
                      numberOfLines={2}
                    >
                      {f.description}
                    </Text>

                    <View className="flex-row items-center flex-wrap gap-1.5">
                      <View
                        className={`px-2.5 py-1 rounded-full ${isOnline ? "bg-blue-100 border border-blue-200" : "bg-purple-100 border border-purple-200"}`}
                      >
                        <Text
                          className={`text-xs font-sans-semibold ${isOnline ? "text-blue-700" : "text-purple-700"}`}
                        >
                          {isOnline ? "En ligne" : "Présentiel"}
                        </Text>
                      </View>

                      <View
                        className={`${getLevelBgColor(f.level)} border border-black/5 px-2.5 py-1 rounded-full`}
                      >
                        <Text
                          className={`${getLevelTextColor(f.level)} text-xs font-sans-semibold capitalize`}
                        >
                          {f.level}
                        </Text>
                      </View>

                      {isOnline && (f as OnlineFormation).duration && (
                        <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color={colors.muted}
                          />
                          <Text className="text-muted-foreground text-xs font-sans ml-1">
                            {(f as OnlineFormation).duration}
                          </Text>
                        </View>
                      )}

                      {isOnline && (f as OnlineFormation).stats && (
                        <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                          <Ionicons
                            name="book-outline"
                            size={12}
                            color={colors.muted}
                          />
                          <Text className="text-muted-foreground text-xs font-sans ml-1">
                            {(f as OnlineFormation).stats!.totalLessons} leçons
                          </Text>
                        </View>
                      )}

                      {!isOnline && presentialFormation && (
                        <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                          <Ionicons
                            name="calendar-outline"
                            size={12}
                            color={colors.muted}
                          />
                          <Text className="text-muted-foreground text-xs font-sans ml-1">
                            {presentialFormation.durationDays}j
                          </Text>
                        </View>
                      )}

                      {!isOnline && nextSession && (
                        <View className="flex-row items-center bg-emerald-100 px-2 py-1 rounded-full">
                          <Ionicons
                            name="flag-outline"
                            size={12}
                            color={colors.primaryDark}
                          />
                          <Text className="text-emerald-700 text-xs font-sans ml-1">
                            {formatDate(nextSession.startDate)}
                          </Text>
                        </View>
                      )}

                      {!isOnline && nextSession && (
                        <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                          <Ionicons
                            name="people-outline"
                            size={12}
                            color={colors.warningDark}
                          />
                          <Text className="text-yellow-700 text-xs font-sans ml-1">
                            {Math.max(
                              nextSession.availableSpots -
                                (nextSession.reservedSpots || 0),
                              0,
                            )}{" "}
                            places
                          </Text>
                        </View>
                      )}
                    </View>

                    {owned && isOnline && progress > 0 && (
                      <View className="mt-3">
                        <View className="flex-row items-center justify-between mb-1.5">
                          <Text className="text-[11px] font-sans text-gray-500">
                            Progression
                          </Text>
                          <Text className="text-[11px] font-sans-semibold text-primary">
                            {progress}%
                          </Text>
                        </View>
                        <View className="bg-primary/15 h-1.5 rounded-full overflow-hidden">
                          <View
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </AnimatedPressable>
            );
          })}

        {!isLoading && !hasError && allFormations.length === 0 && (
          <View className="items-center px-6 py-16">
            <Ionicons name="school-outline" size={64} color={colors.mutedLight} />
            <Text className="text-lg font-heading-bold text-gray-400 mt-4">
              Aucune formation disponible
            </Text>
          </View>
        )}
      </FadeInView>
    </ScrollView>
  );
}
