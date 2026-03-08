import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTrainingStore } from "@/stores/trainingStore";

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
      <View className="bg-purple-600 pt-12 pb-8 px-6">
        <TouchableOpacity
          className="flex-row items-center mb-4"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-white text-base ml-2">Retour</Text>
        </TouchableOpacity>
        <View className="flex-row items-center">
          <View className="bg-white/20 p-3 rounded-full mr-4">
            <Ionicons name="person" size={32} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">
              Mon Tableau de Bord
            </Text>
            <Text className="text-purple-100 text-sm mt-1">
              Vue d&apos;ensemble de votre progression
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Overview */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Statistiques
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="bg-white rounded-xl p-4 shadow-sm flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-purple-100 p-2 rounded-lg">
                <Ionicons name="book" size={24} color="#7c3aed" />
              </View>
              <Text className="text-3xl font-bold text-purple-600">
                {enrolledCourses.length}
              </Text>
            </View>
            <Text className="text-sm text-gray-600">Cours Inscrits</Text>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-green-100 p-2 rounded-lg">
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              </View>
              <Text className="text-3xl font-bold text-green-600">
                {totalLessonsCompleted}
              </Text>
            </View>
            <Text className="text-sm text-gray-600">Leçons Complétées</Text>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-blue-100 p-2 rounded-lg">
                <Ionicons name="time" size={24} color="#2563eb" />
              </View>
              <Text className="text-3xl font-bold text-blue-600">
                {Math.round(totalHoursLearned)}h
              </Text>
            </View>
            <Text className="text-sm text-gray-600">Heures d&apos;Étude</Text>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-yellow-100 p-2 rounded-lg">
                <Ionicons name="ribbon" size={24} color="#d97706" />
              </View>
              <Text className="text-3xl font-bold text-yellow-600">
                {certificates.length}
              </Text>
            </View>
            <Text className="text-sm text-gray-600">Certificats</Text>
          </View>
        </View>

        {/* Average Progress */}
        <View className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <Text className="text-base font-bold text-gray-800 mb-3">
            Progression Moyenne
          </Text>
          <View className="flex-row items-center">
            <View className="flex-1 mr-4">
              <View className="bg-gray-200 h-3 rounded-full">
                <View
                  className="bg-purple-600 h-3 rounded-full"
                  style={{ width: `${averageProgress}%` }}
                />
              </View>
            </View>
            <Text className="text-2xl font-bold text-purple-600">
              {Math.round(averageProgress)}%
            </Text>
          </View>
        </View>

        {/* Quiz Performance */}
        {getAverageQuizScore() > 0 && (
          <View className="bg-white rounded-xl p-5 shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-gray-800">
                Performance aux Quiz
              </Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-700 font-bold">
                  {getAverageQuizScore()}%
                </Text>
              </View>
            </View>
            <Text className="text-sm text-gray-600">
              Score moyen sur tous les quiz complétés
            </Text>
          </View>
        )}
      </View>

      {/* Enrolled Courses Progress */}
      {enrolledCourses.length > 0 && (
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Mes Cours en Cours
          </Text>

          {enrolledCourses.map((courseId) => {
            const course = courses.find((c) => c.id === courseId);
            const progress = courseProgress[courseId];
            if (!course || !progress) return null;

            return (
              <TouchableOpacity
                key={course.id}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                onPress={() => router.push(`/training/${course.id}`)}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-bold text-gray-800 mb-1">
                      {course.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {progress.completedLessons} / {progress.totalLessons}{" "}
                      leçons
                    </Text>
                  </View>
                  <View className="bg-purple-100 px-3 py-1 rounded-full">
                    <Text className="text-purple-700 font-bold text-sm">
                      {progress.progressPercentage}%
                    </Text>
                  </View>
                </View>
                <View className="bg-gray-200 h-2 rounded-full">
                  <View
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Mes Certificats
          </Text>

          {certificates.map((cert) => {
            const course = courses.find((c) => c.id === cert.courseId);
            if (!course) return null;

            return (
              <View
                key={cert.id}
                className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 mb-3"
              >
                <View className="flex-row items-start">
                  <View className="bg-yellow-200 p-3 rounded-full mr-4">
                    <Ionicons name="ribbon" size={32} color="#d97706" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-800 mb-1">
                      {course.title}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                      Délivré le{" "}
                      {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="key-outline" size={14} color="#6b7280" />
                      <Text className="text-xs text-gray-500 ml-1">
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
      <View className="px-6 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Actions Rapides
        </Text>

        <View className="space-y-3">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow-sm flex-row items-center"
            onPress={() => router.push("/training")}
          >
            <View className="bg-purple-100 p-3 rounded-full mr-4">
              <Ionicons name="search" size={24} color="#7c3aed" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800">
                Explorer les Cours
              </Text>
              <Text className="text-sm text-gray-600">
                Découvrir de nouveaux cours
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          {bookmarks.length > 0 && (
            <TouchableOpacity className="bg-white rounded-xl p-4 shadow-sm flex-row items-center">
              <View className="bg-blue-100 p-3 rounded-full mr-4">
                <Ionicons name="bookmark" size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  Mes Favoris
                </Text>
                <Text className="text-sm text-gray-600">
                  {bookmarks.length} éléments sauvegardés
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </TouchableOpacity>
          )}

          {notes.length > 0 && (
            <TouchableOpacity className="bg-white rounded-xl p-4 shadow-sm flex-row items-center">
              <View className="bg-green-100 p-3 rounded-full mr-4">
                <Ionicons name="document-text" size={24} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  Mes Notes
                </Text>
                <Text className="text-sm text-gray-600">
                  {notes.length} notes enregistrées
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Empty State */}
      {enrolledCourses.length === 0 && (
        <View className="px-6 py-12">
          <View className="bg-white rounded-xl p-8 items-center shadow-sm">
            <View className="bg-gray-100 p-4 rounded-full mb-4">
              <Ionicons name="school-outline" size={48} color="#9ca3af" />
            </View>
            <Text className="text-lg font-bold text-gray-800 mb-2 text-center">
              Commencez Votre Parcours
            </Text>
            <Text className="text-sm text-gray-600 mb-6 text-center">
              Inscrivez-vous à un cours pour commencer à apprendre
            </Text>
            <TouchableOpacity
              className="bg-purple-600 px-6 py-3 rounded-lg"
              onPress={() => router.push("/training")}
            >
              <Text className="text-white font-semibold">
                Explorer les Cours
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
