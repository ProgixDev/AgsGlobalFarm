import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTrainingStore } from "@/stores/trainingStore";
import { colors } from "@/theme/colors";

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
    month: "long",
    year: "numeric",
  });
}

export default function FormationDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { courseId: formationId } = useLocalSearchParams<{ courseId: string }>();

  const getFormationById = useTrainingStore((state) => state.getFormationById);
  const loadOnlineById = useTrainingStore((state) => state.loadOnlineById);
  const loadPresentialById = useTrainingStore(
    (state) => state.loadPresentialById,
  );
  const loadProgress = useTrainingStore((state) => state.loadProgress);
  const progressByFormationId = useTrainingStore(
    (state) => state.progressByFormationId,
  );
  const getProgressPercentage = useTrainingStore(
    (state) => state.getProgressPercentage,
  );
  const loadQuizResult = useTrainingStore((state) => state.loadQuizResult);
  const quizResultByFormationId = useTrainingStore(
    (state) => state.quizResultByFormationId,
  );
  const enrollFormation = useTrainingStore((state) => state.enrollFormation);

  const formation = getFormationById(formationId);
  const [status, setStatus] = useState<"idle" | "loading" | "missing">("idle");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!formationId) return;
    if (formation) {
      const isOnlineType = formation.type === "online";
      const hasSections = isOnlineType && (formation as OnlineFormation).sections !== undefined;
      if (isOnlineType && formation.owned) {
        loadProgress(formationId);
        loadQuizResult(formationId);
      }
      if (isOnlineType && !hasSections) {
        loadOnlineById(formationId);
      }
      return;
    }

    setStatus("loading");
    (async () => {
      const onlineResult = await loadOnlineById(formationId);
      if (onlineResult) {
        if (onlineResult.owned) {
          await loadProgress(formationId);
          await loadQuizResult(formationId);
        }
        setStatus("idle");
        return;
      }
      const presentialResult = await loadPresentialById(formationId);
      if (presentialResult) {
        setStatus("idle");
        return;
      }
      setStatus("missing");
    })();
  }, [
    formationId,
    formation,
    loadOnlineById,
    loadPresentialById,
    loadProgress,
    loadQuizResult,
  ]);

  const completedLessons = useMemo(
    () => progressByFormationId[formationId] || [],
    [progressByFormationId, formationId],
  );

  if (status === "loading") {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-sm font-sans text-gray-500 mt-3">
          Chargement de la formation...
        </Text>
      </View>
    );
  }

  if (!formation || status === "missing") {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.mutedLight}
        />
        <Text className="text-xl font-heading-bold text-gray-400 mt-4">
          Formation introuvable
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-xl mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-sans-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOnline = formation.type === "online";
  const owned = !!formation.owned;
  const progress = isOnline ? getProgressPercentage(formationId) : 0;
  const quizResult = quizResultByFormationId[formationId];

  const onlineFormation = isOnline ? (formation as OnlineFormation) : null;
  const presentialFormation = !isOnline
    ? (formation as PresentialFormation)
    : null;

  const totalLessons =
    onlineFormation?.sections?.reduce(
      (sum, s) => sum + (s.lessons?.length || 0),
      0,
    ) || onlineFormation?.stats?.totalLessons || 0;

  const isLessonCompleted = (sectionId: number, lessonId: number) => {
    return completedLessons.includes(`${sectionId}-${lessonId}`);
  };

  const handleLessonPress = async (sectionId: number, lessonId: number) => {
    if (!owned) {
      try {
        setEnrolling(true);
        await enrollFormation(formationId);
      } catch (err) {
        console.warn("Enroll failed", err);
        Alert.alert(
          "Erreur",
          "Impossible d'accéder à la formation pour le moment.",
        );
        return;
      } finally {
        setEnrolling(false);
      }
    }
    router.push(`/training/${formationId}/${sectionId}-${lessonId}` as any);
  };

  const handleStartFormation = async () => {
    if (enrolling) return;
    try {
      setEnrolling(true);
      await enrollFormation(formationId);
      if (isOnline) {
        const firstSection = onlineFormation?.sections?.[0];
        const firstLesson = firstSection?.lessons?.[0];
        if (firstSection && firstLesson) {
          router.push(
            `/training/${formationId}/${firstSection.id}-${firstLesson.id}` as any,
          );
        }
      } else {
        Alert.alert(
          "Inscription confirmée",
          "Votre place est réservée pour cette session.",
        );
      }
    } catch (err) {
      console.warn("Enroll failed", err);
      Alert.alert(
        "Erreur",
        "Impossible de vous inscrire pour le moment. Réessayez.",
      );
    } finally {
      setEnrolling(false);
    }
  };

  const allLessonsDone =
    isOnline && totalLessons > 0 && completedLessons.length >= totalLessons;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 112 }}>
        <View className="relative">
          <Image
            source={{ uri: formation.image?.startsWith('/') ? `https://ags-globalfarm-sarl.vercel.app${formation.image}` : formation.image }}
            className="w-full h-56"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute left-4 flex-row items-center gap-2 bg-white/90 border border-white rounded-full px-3 py-2"
            style={{ top: insets.top + 8 }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.black} />
            <Text style={{ color: colors.black }} className="font-sans-bold text-base">
              Retour
            </Text>
          </TouchableOpacity>

          {owned && isOnline && (
            <View className="absolute bottom-3 left-4 right-4 bg-white/95 border border-gray-100 rounded-2xl px-4 py-3">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 text-sm font-sans">
                  Progression
                </Text>
                <Text className="text-primary text-sm font-sans-bold">
                  {progress}%
                </Text>
              </View>
              <View className="bg-primary/10 h-2 rounded-full">
                <View
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
              {onlineFormation?.accessExpiresAt && (
                <Text className="text-[11px] text-gray-500 mt-2">
                  Accès jusqu&apos;au{" "}
                  {formatDate(onlineFormation.accessExpiresAt)}
                </Text>
              )}
            </View>
          )}
        </View>

        <View className="px-5 pt-6 pb-4">
          <Text className="text-2xl font-heading-bold text-gray-800 mb-3">
            {formation.title}
          </Text>

          <View className="flex-row items-center flex-wrap gap-2 mb-5">
            <View
              className={`${getLevelBgColor(formation.level)} px-3 py-1.5 rounded-full border border-black/5`}
            >
              <Text
                className={`${getLevelTextColor(formation.level)} text-sm font-sans-semibold capitalize`}
              >
                {formation.level}
              </Text>
            </View>

            {isOnline && onlineFormation?.duration && (
              <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                <Ionicons name="time-outline" size={16} color={colors.muted} />
                <Text className="text-gray-600 text-sm font-sans ml-1">
                  {onlineFormation.duration}
                </Text>
              </View>
            )}

            {isOnline && totalLessons > 0 && (
              <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                <Ionicons name="book-outline" size={16} color={colors.muted} />
                <Text className="text-gray-600 text-sm font-sans ml-1">
                  {totalLessons} leçons
                </Text>
              </View>
            )}

            {!isOnline && presentialFormation && (
              <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.muted}
                />
                <Text className="text-gray-600 text-sm font-sans ml-1">
                  {presentialFormation.durationDays} jours
                </Text>
              </View>
            )}
          </View>

          <Text className="text-base font-sans text-gray-600 mb-5 leading-6">
            {formation.description}
          </Text>

          {!isOnline && presentialFormation && (
            <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text className="text-base font-heading-bold text-gray-800 ml-2">
                  Lieu
                </Text>
              </View>
              <Text className="text-sm font-sans text-gray-600">
                {presentialFormation.address}
              </Text>
              {presentialFormation.contactPhone && (
                <Text className="text-sm font-sans text-gray-600 mt-1">
                  Tél: {presentialFormation.contactPhone}
                </Text>
              )}
              {presentialFormation.contactEmail && (
                <Text className="text-sm font-sans text-gray-600 mt-1">
                  Email: {presentialFormation.contactEmail}
                </Text>
              )}
            </View>
          )}

          {!owned && (
            <View className="bg-primary/5 border border-primary/15 rounded-2xl p-4 mb-4 flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-xs font-sans text-gray-500">Accès</Text>
                <Text className="text-2xl font-heading-bold text-primary">
                  Gratuit
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Online: Sections + Lessons */}
        {isOnline && onlineFormation?.sections && (
          <View className="px-5 pb-4">
            <Text className="text-xl font-heading-bold text-gray-800 mb-4">
              Contenu de la formation
            </Text>

            {onlineFormation.sections.map((section, sectionIndex) => {
              const completedCount = section.lessons.filter((l) =>
                isLessonCompleted(section.id, l.id),
              ).length;
              const total = section.lessons.length;
              const sectionProgress =
                total > 0 ? Math.round((completedCount / total) * 100) : 0;

              return (
                <View key={section.id} className="mb-4">
                  <View className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <View className="bg-primary/5 p-4 border-b border-primary/10">
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <Text className="text-xs text-primary font-sans-semibold mb-1">
                            Section {sectionIndex + 1}
                          </Text>
                          <Text className="text-base font-heading-bold text-gray-800">
                            {section.title}
                          </Text>
                          {section.description && (
                            <Text className="text-sm font-sans text-gray-600 mt-1">
                              {section.description}
                            </Text>
                          )}
                        </View>
                        {owned && (
                          <View className="ml-3">
                            <View className="bg-primary/15 border border-primary/20 rounded-full w-12 h-12 items-center justify-center">
                              <Text className="text-primary font-sans-bold text-xs">
                                {sectionProgress}%
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs font-sans text-gray-500 mt-2">
                        {total} leçon{total > 1 ? "s" : ""}
                      </Text>
                    </View>

                    <View>
                      {section.lessons.map((lesson, lessonIndex) => {
                        const completed = isLessonCompleted(
                          section.id,
                          lesson.id,
                        );

                        return (
                          <TouchableOpacity
                            key={lesson.id}
                            className={`px-4 py-4 flex-row items-center ${
                              lessonIndex < section.lessons.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }`}
                            onPress={() => handleLessonPress(section.id, lesson.id)}
                          >
                            <View
                              className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${
                                completed ? "bg-green-100" : "bg-gray-100"
                              }`}
                            >
                              {completed ? (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={24}
                                  color={colors.primary}
                                />
                              ) : (
                                <Ionicons
                                  name="play-circle-outline"
                                  size={24}
                                  color={colors.muted}
                                />
                              )}
                            </View>

                            <View className="flex-1">
                              <Text className="text-sm font-sans-semibold text-gray-800">
                                {lesson.title}
                              </Text>
                            </View>

                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color={colors.mutedLight}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Quiz CTA */}
            {owned && (
              <View className="mt-4 mb-2">
                {quizResult?.passed ? (
                  <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <View className="flex-row items-center mb-1">
                      <Ionicons
                        name="ribbon"
                        size={20}
                        color={colors.primaryDark}
                      />
                      <Text className="text-base font-heading-bold text-emerald-800 ml-2">
                        Quiz réussi
                      </Text>
                    </View>
                    <Text className="text-sm font-sans text-emerald-700">
                      Score: {quizResult.score}/{quizResult.totalQuestions} ·
                      Certificat envoyé
                    </Text>
                  </View>
                ) : allLessonsDone ? (
                  <TouchableOpacity
                    className="bg-primary py-4 rounded-2xl items-center"
                    onPress={() =>
                      router.push(`/training/${formationId}/quiz` as any)
                    }
                  >
                    <Text className="text-white font-sans-bold text-base">
                      Passer le quiz
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="bg-gray-100 rounded-2xl p-4">
                    <Text className="text-sm font-sans text-gray-600 text-center">
                      Complétez toutes les leçons pour accéder au quiz (
                      {completedLessons.length}/{totalLessons})
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Presential: Program + Sessions */}
        {!isOnline && presentialFormation && (
          <View className="px-5 pb-4">
            {presentialFormation.program?.length > 0 && (
              <>
                <Text className="text-xl font-heading-bold text-gray-800 mb-4">
                  Programme
                </Text>
                {presentialFormation.program.map((day, idx) => (
                  <View
                    key={`${day.name}-${idx}`}
                    className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
                  >
                    <Text className="text-base font-heading-bold text-gray-800 mb-2">
                      {day.name}
                    </Text>
                    {day.timeFrames.map((tf, tfIdx) => (
                      <View
                        key={`${tf.from}-${tfIdx}`}
                        className="border-l-2 border-primary/30 pl-3 py-1.5 mb-1"
                      >
                        <Text className="text-xs font-sans text-gray-500">
                          {tf.from} - {tf.to}
                        </Text>
                        <Text className="text-sm font-sans-semibold text-gray-800">
                          {tf.name}
                        </Text>
                        {tf.description && (
                          <Text className="text-xs font-sans text-gray-600 mt-0.5">
                            {tf.description}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}

            <Text className="text-xl font-heading-bold text-gray-800 mb-4 mt-4">
              Sessions disponibles
            </Text>
            {(presentialFormation.sessions || []).map((session) => {
              const remaining =
                session.availableSpots - (session.reservedSpots || 0);
              const isOwned = !!session.owned;
              const isFull = remaining <= 0;
              const isClosed = session.status !== "open";

              return (
                <View
                  key={session.id}
                  className={`border rounded-2xl p-4 mb-3 ${
                    isOwned
                      ? "bg-emerald-50 border-emerald-200"
                      : isFull || isClosed
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-100"
                  }`}
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-base font-heading-bold text-gray-800">
                        {formatDate(session.startDate)} -{" "}
                        {formatDate(session.endDate)}
                      </Text>
                      <Text className="text-sm font-sans text-gray-600 mt-0.5">
                        {session.location}
                      </Text>
                    </View>
                    {isOwned && (
                      <View className="bg-emerald-200 px-2 py-1 rounded-full">
                        <Text className="text-emerald-800 text-xs font-sans-bold">
                          Inscrit
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs font-sans text-gray-500">
                    {isClosed
                      ? `Statut: ${session.status}`
                      : `${remaining} place${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""} sur ${session.availableSpots}`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Enroll CTA */}
      {!owned && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 14) }}
        >
          <TouchableOpacity
            className="bg-primary py-4 rounded-2xl items-center"
            onPress={handleStartFormation}
            disabled={enrolling}
            style={{ opacity: enrolling ? 0.7 : 1 }}
          >
            {enrolling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-sans-bold text-base">
                {isOnline
                  ? "Commencer la formation"
                  : "S'inscrire à cette session"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
