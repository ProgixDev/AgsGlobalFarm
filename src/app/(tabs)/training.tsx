import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTrainingStore } from "@/stores/trainingStore";

export default function TrainingScreen() {
  const router = useRouter();
  const courses = useTrainingStore((state) => state.courses);
  const enrolledCourses = useTrainingStore((state) => state.enrolledCourses);
  const courseProgress = useTrainingStore((state) => state.courseProgress);

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

  const isEnrolled = (courseId: string) => enrolledCourses.includes(courseId);

  const getProgressPercentage = (courseId: string) => {
    return courseProgress[courseId]?.progressPercentage || 0;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-600 pt-12 pb-8 px-6">
        <View className="flex-row items-center mb-4">
          <View className="bg-white/20 p-3 rounded-full mr-4">
            <Ionicons name="school" size={32} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-3xl font-bold">Formation</Text>
            <Text className="text-purple-100 text-base mt-1">
              Développez vos compétences agricoles
            </Text>
          </View>
          {enrolledCourses.length > 0 && (
            <TouchableOpacity
              className="bg-white/20 p-3 rounded-full"
              onPress={() => router.push("/training/dashboard")}
            >
              <Ionicons name="stats-chart" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row justify-between mt-4">
          <View className="bg-white/20 rounded-xl px-4 py-3 flex-1 mr-2">
            <Text className="text-white/80 text-xs">Cours disponibles</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {courses.length}
            </Text>
          </View>
          <View className="bg-white/20 rounded-xl px-4 py-3 flex-1 ml-2">
            <Text className="text-white/80 text-xs">Mes formations</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {enrolledCourses.length}
            </Text>
          </View>
        </View>
      </View>

      {/* My Courses Section */}
      {enrolledCourses.length > 0 && (
        <View className="px-6 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800">
              Mes Formations
            </Text>
            <TouchableOpacity>
              <Text className="text-purple-600 font-semibold">Tout voir</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {enrolledCourses.map((courseId) => {
              const course = courses.find((c) => c.id === courseId);
              if (!course) return null;

              const progress = getProgressPercentage(courseId);

              return (
                <TouchableOpacity
                  key={course.id}
                  className="bg-white rounded-xl mr-4 shadow-sm"
                  style={{ width: 280 }}
                  onPress={() => router.push(`/training/${course.id}`)}
                >
                  <Image
                    source={{ uri: course.thumbnailUrl }}
                    className="w-full h-32 rounded-t-xl"
                    resizeMode="cover"
                  />
                  <View className="p-4">
                    <Text
                      className="text-base font-bold text-gray-800 mb-2"
                      numberOfLines={2}
                    >
                      {course.title}
                    </Text>

                    {/* Progress Bar */}
                    <View className="bg-gray-200 h-2 rounded-full mb-2">
                      <View
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                    <Text className="text-xs text-gray-600">
                      {progress}% complété
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* All Courses Section */}
      <View className="px-6 mt-4 pb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          {enrolledCourses.length > 0 ? "Tous les Cours" : "Cours Disponibles"}
        </Text>

        {courses.map((course) => {
          const enrolled = isEnrolled(course.id);
          const progress = getProgressPercentage(course.id);

          return (
            <TouchableOpacity
              key={course.id}
              className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
              onPress={() => router.push(`/training/${course.id}`)}
            >
              <View className="flex-row">
                <Image
                  source={{ uri: course.thumbnailUrl }}
                  className="w-28 h-full"
                  resizeMode="cover"
                />
                <View className="flex-1 p-4">
                  <View className="flex-row items-start justify-between mb-2">
                    <Text
                      className="text-base font-bold text-gray-800 flex-1 mr-2"
                      numberOfLines={2}
                    >
                      {course.title}
                    </Text>
                    {enrolled && (
                      <View className="bg-purple-100 px-2 py-1 rounded-full">
                        <Text className="text-purple-700 text-xs font-semibold">
                          Inscrit
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    className="text-xs text-gray-600 mb-3"
                    numberOfLines={2}
                  >
                    {course.description}
                  </Text>

                  <View className="flex-row items-center flex-wrap gap-2">
                    <View
                      className={`${getDifficultyBgColor(course.difficulty)} px-2 py-1 rounded-full`}
                    >
                      <Text
                        className={`${getDifficultyColor(course.difficulty)} text-xs font-semibold capitalize`}
                      >
                        {course.difficulty}
                      </Text>
                    </View>

                    <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                      <Ionicons name="time-outline" size={12} color="#6b7280" />
                      <Text className="text-gray-600 text-xs ml-1">
                        {course.duration}h
                      </Text>
                    </View>

                    <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                      <Ionicons name="book-outline" size={12} color="#6b7280" />
                      <Text className="text-gray-600 text-xs ml-1">
                        {course.modules.reduce(
                          (sum, m) => sum + m.lessons.length,
                          0,
                        )}{" "}
                        leçons
                      </Text>
                    </View>

                    {course.requiresCertification && (
                      <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full">
                        <Ionicons
                          name="ribbon-outline"
                          size={12}
                          color="#d97706"
                        />
                        <Text className="text-yellow-700 text-xs ml-1">
                          Certification
                        </Text>
                      </View>
                    )}
                  </View>

                  {enrolled && progress > 0 && (
                    <View className="mt-3">
                      <View className="bg-gray-200 h-1.5 rounded-full">
                        <View
                          className="bg-purple-600 h-1.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {courses.length === 0 && (
        <View className="flex-1 justify-center items-center px-6 py-20">
          <Ionicons name="school-outline" size={64} color="#9ca3af" />
          <Text className="text-xl font-bold text-gray-400 mt-4">
            Aucun cours disponible
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
