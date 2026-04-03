import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTrainingStore } from "@/stores/trainingStore";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { colors } from "@/theme/colors";

export default function StudentDashboardScreen() {
  const router = useRouter();
  const courses = useTrainingStore((state) => state.courses);
  const enrolledCourses = useTrainingStore((state) => state.enrolledCourses);
  const courseProgress = useTrainingStore((state) => state.courseProgress);
  const certificates = useTrainingStore((state) => state.certificates);
  const bookmarks = useTrainingStore((state) => state.bookmarks);
  const notes = useTrainingStore((state) => state.notes);

  const totalLessonsCompleted = Object.values(courseProgress).reduce(
    (sum, progress) => sum + progress.completedLessons,
    0,
  );

  const totalHoursLearned = enrolledCourses.reduce((sum, courseId) => {
    const course = courses.find((c) => c.id === courseId);
    const progress = courseProgress[courseId];
    if (!course || !progress) return sum;
    return sum + (course.duration * progress.progressPercentage) / 100;
  }, 0);

  const averageProgress =
    enrolledCourses.length > 0
      ? enrolledCourses.reduce((sum, courseId) => {
          return sum + (courseProgress[courseId]?.progressPercentage || 0);
        }, 0) / enrolledCourses.length
      : 0;

  const getAverageQuizScore = () => {
    let totalScore = 0;
    let totalAttempts = 0;

    Object.values(courseProgress).forEach((progress) => {
      progress.quizScores.forEach((attempt) => {
        totalScore += attempt.score;
        totalAttempts++;
      });
    });

    return totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <ScreenHeader
        title="Mon tableau de bord"
        subtitle="Vue d'ensemble de votre progression"
        showBack
      />

      {/* Stats Overview */}
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
                {enrolledCourses.length}
              </Text>
            </View>
            <Text className="text-sm font-sans text-muted-foreground">
              Cours inscrits
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
              <View className="bg-blue-100 p-2 rounded-lg">
                <Ionicons name="time" size={24} color={colors.infoDark} />
              </View>
              <Text className="text-3xl font-heading-bold text-blue-600">
                {Math.round(totalHoursLearned)}h
              </Text>
            </View>
            <Text className="text-sm font-sans text-muted-foreground">
              Heures d&apos;étude
            </Text>
          </View>

          <View className="bg-white border border-gray-100 rounded-3xl p-4 flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-yellow-100 p-2 rounded-lg">
                <Ionicons name="ribbon" size={24} color={colors.warningDark} />
              </View>
              <Text className="text-3xl font-heading-bold text-yellow-600">
                {certificates.length}
              </Text>
            </View>
            <Text className="text-sm font-sans text-muted-foreground">
              Certificats
            </Text>
          </View>
        </View>

        {/* Average Progress */}
        <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-6">
          <Text className="text-base font-heading-bold text-gray-800 mb-3">
            Progression moyenne
          </Text>
          <View className="flex-row items-center">
            <View className="flex-1 mr-4">
              <View className="bg-gray-200 h-3 rounded-full">
                <View
                  className="bg-primary h-3 rounded-full"
                  style={{ width: `${averageProgress}%` }}
                />
              </View>
            </View>
            <Text className="text-2xl font-heading-bold text-primary">
              {Math.round(averageProgress)}%
            </Text>
          </View>
        </View>

        {/* Quiz Performance */}
        {getAverageQuizScore() > 0 && (
          <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-heading-bold text-gray-800">
                Performance aux quiz
              </Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-700 font-sans-bold">
                  {getAverageQuizScore()}%
                </Text>
              </View>
            </View>
            <Text className="text-sm font-sans text-muted-foreground">
              Score moyen sur tous les quiz complétés
            </Text>
          </View>
        )}
      </FadeInView>

      {/* Enrolled Courses Progress */}
      {enrolledCourses.length > 0 && (
        <FadeInView className="px-5 mb-6" delay={100}>
          <Text className="text-lg font-heading-bold text-gray-800 mb-4">
            Mes cours en cours
          </Text>

          {enrolledCourses.map((courseId) => {
            const course = courses.find((c) => c.id === courseId);
            const progress = courseProgress[courseId];
            if (!course || !progress) return null;

            return (
              <AnimatedPressable
                key={course.id}
                className="bg-white border border-gray-100 rounded-3xl p-4 mb-3"
                onPress={() => router.push(`/training/${course.id}`)}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-heading-bold text-gray-800 mb-1">
                      {course.title}
                    </Text>
                    <Text className="text-sm font-sans text-muted-foreground">
                      {progress.completedLessons} / {progress.totalLessons}{" "}
                      leçons
                    </Text>
                  </View>
                  <View className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                    <Text className="text-primary font-sans-bold text-sm">
                      {progress.progressPercentage}%
                    </Text>
                  </View>
                </View>
                <View className="bg-gray-200 h-2 rounded-full">
                  <View
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </View>
              </AnimatedPressable>
            );
          })}
        </FadeInView>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <View className="px-5 mb-6">
          <Text className="text-lg font-heading-bold text-gray-800 mb-4">
            Mes certificats
          </Text>

          {certificates.map((cert) => {
            const course = courses.find((c) => c.id === cert.courseId);
            if (!course) return null;

            return (
              <View
                key={cert.id}
                className="bg-yellow-50 border border-yellow-200 rounded-3xl p-4 mb-3"
              >
                <View className="flex-row items-start">
                  <View className="bg-yellow-200 p-3 rounded-full mr-4">
                    <Ionicons
                      name="ribbon"
                      size={32}
                      color={colors.warningDark}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-heading-bold text-gray-800 mb-1">
                      {course.title}
                    </Text>
                    <Text className="text-sm font-sans text-muted-foreground mb-2">
                      Délivré le{" "}
                      {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="key-outline"
                        size={14}
                        color={colors.muted}
                      />
                      <Text className="text-xs font-sans text-muted-foreground ml-1">
                        {cert.verificationCode}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Quick Actions */}
      <View className="px-5 mb-6">
        <Text className="text-lg font-heading-bold text-gray-800 mb-4">
          Actions rapides
        </Text>

        <View className="gap-3">
          <AnimatedPressable
            className="bg-white border border-gray-100 rounded-3xl p-4 flex-row items-center"
            onPress={() => router.push("/training")}
          >
            <View className="bg-primary/10 p-3 rounded-full mr-4">
              <Ionicons name="search" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-sans-semibold text-gray-800">
                Explorer les cours
              </Text>
              <Text className="text-sm font-sans text-muted-foreground">
                Découvrir de nouveaux cours
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.mutedLight}
            />
          </AnimatedPressable>

          {bookmarks.length > 0 && (
            <AnimatedPressable className="bg-white border border-gray-100 rounded-3xl p-4 flex-row items-center">
              <View className="bg-blue-100 p-3 rounded-full mr-4">
                <Ionicons name="bookmark" size={24} color={colors.infoDark} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-sans-semibold text-gray-800">
                  Mes favoris
                </Text>
                <Text className="text-sm font-sans text-muted-foreground">
                  {bookmarks.length} éléments sauvegardés
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.mutedLight}
              />
            </AnimatedPressable>
          )}

          {notes.length > 0 && (
            <AnimatedPressable className="bg-white border border-gray-100 rounded-3xl p-4 flex-row items-center">
              <View className="bg-green-100 p-3 rounded-full mr-4">
                <Ionicons
                  name="document-text"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-sans-semibold text-gray-800">
                  Mes notes
                </Text>
                <Text className="text-sm font-sans text-muted-foreground">
                  {notes.length} notes enregistrées
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.mutedLight}
              />
            </AnimatedPressable>
          )}
        </View>
      </View>

      {/* Empty State */}
      {enrolledCourses.length === 0 && (
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
              Inscrivez-vous à un cours pour commencer à apprendre
            </Text>
            <AnimatedPressable
              className="bg-primary px-6 py-3 rounded-2xl"
              onPress={() => router.push("/training")}
            >
              <Text className="text-white font-sans-semibold">
                Explorer les cours
              </Text>
            </AnimatedPressable>
          </View>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
