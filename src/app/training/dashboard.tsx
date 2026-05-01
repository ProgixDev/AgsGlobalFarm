import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTrainingStore } from "@/stores/trainingStore";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { colors } from "@/theme/colors";

function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function StudentDashboardScreen() {
  const router = useRouter();
  const ownedOnline = useTrainingStore((state) => state.ownedOnline);
  const ownedPresential = useTrainingStore((state) => state.ownedPresential);
  const loadOwned = useTrainingStore((state) => state.loadOwned);
  const progressByFormationId = useTrainingStore(
    (state) => state.progressByFormationId,
  );
  const loadProgress = useTrainingStore((state) => state.loadProgress);
  const getProgressPercentage = useTrainingStore(
    (state) => state.getProgressPercentage,
  );
  const quizResultByFormationId = useTrainingStore(
    (state) => state.quizResultByFormationId,
  );
  const loadQuizResult = useTrainingStore((state) => state.loadQuizResult);
  const resendCertificate = useTrainingStore((state) => state.resendCertificate);

  const [resending, setResending] = useState<string | null>(null);

  useEffect(() => {
    loadOwned();
  }, [loadOwned]);

  useEffect(() => {
    ownedOnline.forEach((f) => {
      loadProgress(f._id);
      loadQuizResult(f._id);
    });
  }, [ownedOnline, loadProgress, loadQuizResult]);

  const totalLessonsCompleted = ownedOnline.reduce(
    (sum, f) => sum + (progressByFormationId[f._id]?.length || 0),
    0,
  );

  const certificatesCount = Object.values(quizResultByFormationId).filter(
    (r) => r?.passed,
  ).length;

  const averageProgress =
    ownedOnline.length > 0
      ? ownedOnline.reduce((sum, f) => sum + getProgressPercentage(f._id), 0) /
        ownedOnline.length
      : 0;

  const handleResend = async (formationId: string) => {
    setResending(formationId);
    try {
      await resendCertificate(formationId);
      Alert.alert(
        "Certificat envoyé",
        "Le certificat a été renvoyé à votre adresse email.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'envoi";
      Alert.alert("Erreur", message);
    } finally {
      setResending(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Mon tableau de bord"
        subtitle="Vue d'ensemble de votre progression"
        showBack
      />

      <FadeInView className="px-5 mt-6">
        <Text className="text-xs font-sans-semibold uppercase tracking-wider text-gray-500 mb-2">
          Vue globale
        </Text>
        <Text className="text-lg font-heading-bold text-gray-800 mb-4">
          Statistiques
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="bg-white border border-gray-100 rounded-3xl p-4 flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-primary/10 p-2 rounded-lg">
                <Ionicons name="book" size={24} color={colors.primary} />
              </View>
              <Text className="text-3xl font-heading-bold text-primary">
                {ownedOnline.length + ownedPresential.length}
              </Text>
            </View>
            <Text className="text-sm font-sans text-muted-foreground">
              Formations
            </Text>
          </View>

          <View className="bg-white border border-gray-100 rounded-3xl p-4 flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-green-100 p-2 rounded-lg">
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text className="text-3xl font-heading-bold text-green-600">
                {totalLessonsCompleted}
              </Text>
            </View>
            <Text className="text-sm font-sans text-muted-foreground">
              Leçons complétées
            </Text>
          </View>

          <View className="bg-white border border-gray-100 rounded-3xl p-4 flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-yellow-100 p-2 rounded-lg">
                <Ionicons name="ribbon" size={24} color={colors.warningDark} />
              </View>
              <Text className="text-3xl font-heading-bold text-yellow-600">
                {certificatesCount}
              </Text>
            </View>
            <Text className="text-sm font-sans text-muted-foreground">
              Certificats
            </Text>
          </View>

          <View className="bg-white border border-gray-100 rounded-3xl p-4 flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-blue-100 p-2 rounded-lg">
                <Ionicons name="analytics" size={24} color={colors.infoDark} />
              </View>
              <Text className="text-3xl font-heading-bold text-blue-600">
                {Math.round(averageProgress)}%
              </Text>
            </View>
            <Text className="text-sm font-sans text-muted-foreground">
              Progression moyenne
            </Text>
          </View>
        </View>
      </FadeInView>

      {ownedOnline.length > 0 && (
        <FadeInView className="px-5 mb-6" delay={100}>
          <Text className="text-lg font-heading-bold text-gray-800 mb-4">
            Mes formations
          </Text>

          {ownedOnline.map((f) => {
            const completed = progressByFormationId[f._id]?.length || 0;
            const total = f.stats?.totalLessons || 0;
            const pct = getProgressPercentage(f._id);
            const quizResult = quizResultByFormationId[f._id];

            return (
              <View
                key={f._id}
                className="bg-white border border-gray-100 rounded-3xl p-4 mb-3"
              >
                <AnimatedPressable
                  onPress={() => router.push(`/training/${f._id}` as any)}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="text-base font-heading-bold text-gray-800 mb-1">
                        {f.title}
                      </Text>
                      <Text className="text-sm font-sans text-muted-foreground">
                        {completed} / {total} leçons
                      </Text>
                      {f.accessExpiresAt && (
                        <Text className="text-xs font-sans text-orange-600 mt-1">
                          Accès jusqu&apos;au {formatDate(f.accessExpiresAt)}
                        </Text>
                      )}
                    </View>
                    <View className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                      <Text className="text-primary font-sans-bold text-sm">
                        {pct}%
                      </Text>
                    </View>
                  </View>
                  <View className="bg-gray-200 h-2 rounded-full">
                    <View
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                </AnimatedPressable>

                {quizResult?.passed && (
                  <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="ribbon"
                        size={18}
                        color={colors.warningDark}
                      />
                      <Text className="text-sm font-sans-semibold text-gray-700 ml-1.5">
                        Certificat obtenu
                      </Text>
                    </View>
                    <AnimatedPressable
                      className="bg-primary/10 px-3 py-1.5 rounded-full"
                      disabled={resending === f._id}
                      onPress={() => handleResend(f._id)}
                    >
                      <Text className="text-primary text-xs font-sans-semibold">
                        {resending === f._id ? "Envoi..." : "Renvoyer"}
                      </Text>
                    </AnimatedPressable>
                  </View>
                )}
              </View>
            );
          })}
        </FadeInView>
      )}

      {ownedPresential.length > 0 && (
        <FadeInView className="px-5 mb-6" delay={150}>
          <Text className="text-lg font-heading-bold text-gray-800 mb-4">
            {ownedOnline.length > 0 ? "Autres formations" : "Mes formations"}
          </Text>

          {ownedPresential.map((f) => (
            <AnimatedPressable
              key={f._id}
              className="bg-white border border-gray-100 rounded-3xl p-4 mb-3"
              onPress={() => router.push(`/training/${f._id}` as any)}
            >
              <Text className="text-base font-heading-bold text-gray-800 mb-1">
                {f.title}
              </Text>
              <Text className="text-sm font-sans text-muted-foreground">
                {f.durationDays} jours · {f.address}
              </Text>
            </AnimatedPressable>
          ))}
        </FadeInView>
      )}

      <View className="px-5 mb-6">
        <AnimatedPressable
          className="bg-white border border-gray-100 rounded-3xl p-4 flex-row items-center"
          onPress={() => router.push("/training")}
        >
          <View className="bg-primary/10 p-3 rounded-full mr-4">
            <Ionicons name="search" size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-sans-semibold text-gray-800">
              Explorer les formations
            </Text>
            <Text className="text-sm font-sans text-muted-foreground">
              Découvrir de nouvelles formations
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.mutedLight}
          />
        </AnimatedPressable>
      </View>

      {ownedOnline.length === 0 && ownedPresential.length === 0 && (
        <View className="px-5 py-12">
          <View className="bg-white border border-gray-100 rounded-3xl p-8 items-center">
            <View className="bg-gray-100 p-4 rounded-full mb-4">
              <Ionicons
                name="school-outline"
                size={48}
                color={colors.mutedLight}
              />
            </View>
            <Text className="text-lg font-heading-bold text-gray-800 mb-2 text-center">
              Commencez votre parcours
            </Text>
            <Text className="text-sm font-sans text-muted-foreground mb-6 text-center">
              Acquérez une formation pour commencer à apprendre
            </Text>
            <AnimatedPressable
              className="bg-primary px-6 py-3 rounded-2xl"
              onPress={() => router.push("/training")}
            >
              <Text className="text-white font-sans-semibold">
                Explorer les formations
              </Text>
            </AnimatedPressable>
          </View>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
