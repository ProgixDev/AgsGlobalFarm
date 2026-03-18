import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTrainingStore } from "@/stores/trainingStore";

export default function CourseDetailScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const getCourseById = useTrainingStore((state) => state.getCourseById);
  const enrollInCourse = useTrainingStore((state) => state.enrollInCourse);
  const enrolledCourses = useTrainingStore((state) => state.enrolledCourses);
  const courseProgress = useTrainingStore((state) => state.courseProgress);
  const lessonProgress = useTrainingStore((state) => state.lessonProgress);

  const course = getCourseById(courseId);
  const isEnrolled = enrolledCourses.includes(courseId);
  const progress = courseProgress[courseId];

  if (!course) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
        <Text className="text-xl font-bold text-gray-400 mt-4">
          Cours introuvable
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-xl mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "débutant":
        return "text-green-600";
      case "intermédiaire":
        return "text-orange-600";
      case "avancé":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getDifficultyBgColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "débutant":
        return "bg-green-100";
      case "intermédiaire":
        return "bg-orange-100";
      case "avancé":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    const key = `${courseId}-${lessonId}`;
    return lessonProgress[key]?.completed || false;
  };

  const handleEnroll = () => {
    enrollInCourse(courseId);
  };

  const handleLessonPress = (lessonId: string) => {
    if (!isEnrolled) {
      handleEnroll();
    }
    router.push(`/training/${courseId}/${lessonId}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header Image */}
        <View className="relative">
          <Image
            source={{ uri: course.thumbnailUrl }}
            className="w-full h-56"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute top-12 left-4 bg-black/50 rounded-full p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {isEnrolled && progress && (
            <View className="absolute bottom-0 left-0 right-0 bg-black/70 px-6 py-3">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white text-sm">Progression</Text>
                <Text className="text-white text-sm font-bold">
                  {progress.progressPercentage}%
                </Text>
              </View>
              <View className="bg-white/30 h-2 rounded-full">
                <View
                  className="bg-white h-2 rounded-full"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Course Info */}
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-800 mb-3">
            {course.title}
          </Text>

          <View className="flex-row items-center flex-wrap gap-2 mb-4">
            <View
              className={`${getDifficultyBgColor(course.difficulty)} px-3 py-1 rounded-full`}
            >
              <Text
                className={`${getDifficultyColor(course.difficulty)} text-sm font-semibold capitalize`}
              >
                {course.difficulty}
              </Text>
            </View>

            <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1">
                {course.duration} heures
              </Text>
            </View>

            <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
              <Ionicons name="book-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1">
                {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)}{" "}
                leçons
              </Text>
            </View>

            {course.requiresCertification && (
              <View className="flex-row items-center bg-yellow-100 px-3 py-1 rounded-full">
                <Ionicons name="ribbon-outline" size={16} color="#d97706" />
                <Text className="text-yellow-700 text-sm ml-1">
                  Certification
                </Text>
              </View>
            )}
          </View>

          <Text className="text-base text-gray-600 mb-4 leading-6">
            {course.description}
          </Text>

          {course.instructorName && (
            <View className="flex-row items-center bg-primary/5 rounded-xl p-3 mb-4">
              <View className="bg-primary/20 rounded-full p-2 mr-3">
                <Ionicons name="person" size={20} color="#16a34a" />
              </View>
              <View>
                <Text className="text-xs text-gray-600">Formateur</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {course.instructorName}
                </Text>
              </View>
            </View>
          )}

          {course.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-6">
              {course.tags.map((tag) => (
                <View key={tag} className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-gray-600 text-xs">#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Certification Criteria */}
          {course.requiresCertification && course.certificationCriteria && (
            <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-center mb-3">
                <Ionicons name="ribbon" size={24} color="#d97706" />
                <Text className="text-base font-bold text-gray-800 ml-2">
                  Critères de Certification
                </Text>
              </View>
              <View className="space-y-2">
                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  <Text className="text-sm text-gray-700 ml-2 flex-1">
                    Compléter {course.certificationCriteria.requiredLessons}{" "}
                    leçons
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  <Text className="text-sm text-gray-700 ml-2 flex-1">
                    Obtenir un score minimum de{" "}
                    {course.certificationCriteria.minimumScore}% aux quiz
                  </Text>
                </View>
                {course.certificationCriteria.onSiteTrainingRequired && (
                  <View className="flex-row items-start">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#16a34a"
                    />
                    <Text className="text-sm text-gray-700 ml-2 flex-1">
                      Participer à la formation présentielle à Keur Ndiaye Lo
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Course Modules */}
        <View className="px-6 pb-24">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Contenu du Cours
          </Text>

          {course.modules.map((module, moduleIndex) => {
            const completedLessons = module.lessons.filter((lesson) =>
              isLessonCompleted(lesson.id),
            ).length;
            const totalLessons = module.lessons.length;
            const moduleProgress = Math.round(
              (completedLessons / totalLessons) * 100,
            );

            return (
              <View key={module.id} className="mb-6">
                <View className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Module Header */}
                  <View className="bg-primary/5 p-4 border-b border-primary/10">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-xs text-primary font-semibold mb-1">
                          Module {moduleIndex + 1}
                        </Text>
                        <Text className="text-base font-bold text-gray-800">
                          {module.title}
                        </Text>
                        <Text className="text-sm text-gray-600 mt-1">
                          {module.description}
                        </Text>
                      </View>
                      {isEnrolled && (
                        <View className="ml-3">
                          <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center">
                            <Text className="text-primary font-bold text-xs">
                              {moduleProgress}%
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-gray-500 mt-2">
                      {totalLessons} leçon{totalLessons > 1 ? "s" : ""}
                    </Text>
                  </View>

                  {/* Lessons */}
                  <View>
                    {module.lessons.map((lesson, lessonIndex) => {
                      const completed = isLessonCompleted(lesson.id);

                      return (
                        <TouchableOpacity
                          key={lesson.id}
                          className={`p-4 flex-row items-center ${
                            lessonIndex < module.lessons.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          }`}
                          onPress={() => handleLessonPress(lesson.id)}
                        >
                          <View
                            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                              completed ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            {completed ? (
                              <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color="#16a34a"
                              />
                            ) : (
                              <Ionicons
                                name="play-circle-outline"
                                size={24}
                                color="#6b7280"
                              />
                            )}
                          </View>

                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-800 mb-1">
                              {lesson.title}
                            </Text>
                            <View className="flex-row items-center">
                              <Ionicons
                                name="time-outline"
                                size={12}
                                color="#9ca3af"
                              />
                              <Text className="text-xs text-gray-500 ml-1">
                                {lesson.duration} min
                              </Text>
                              {lesson.quiz && (
                                <>
                                  <Text className="text-gray-300 mx-2">•</Text>
                                  <Ionicons
                                    name="help-circle-outline"
                                    size={12}
                                    color="#9ca3af"
                                  />
                                  <Text className="text-xs text-gray-500 ml-1">
                                    Quiz
                                  </Text>
                                </>
                              )}
                            </View>
                          </View>

                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#9ca3af"
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {!isEnrolled && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <TouchableOpacity
            className="bg-primary py-4 rounded-xl items-center shadow-lg"
            onPress={handleEnroll}
          >
            <Text className="text-white font-bold text-base">
              S&apos;inscrire au Cours
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
