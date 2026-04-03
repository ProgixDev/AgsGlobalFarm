import React from "react";
import { View, Text, ScrollView, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTrainingStore } from "@/stores/trainingStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { TAB_BAR_HEIGHT } from "@/components/ui/FloatingTabBar";

const CARD_WIDTH = Dimensions.get("window").width * 0.72;

export default function TrainingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const getLessonsCount = (course: Course) => {
    return course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
    >
      <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-sans-semibold uppercase tracking-wider text-gray-500">
            Formation
          </Text>
          {enrolledCourses.length > 0 && (
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
                Cours disponibles
              </Text>
              <Text className="text-2xl font-heading-bold text-primary mt-1">
                {courses.length}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-3">
              <Text className="text-[11px] font-sans-semibold uppercase tracking-wide text-emerald-700">
                Mes formations
              </Text>
              <Text className="text-2xl font-heading-bold text-emerald-700 mt-1">
                {enrolledCourses.length}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {enrolledCourses.length > 0 && (
        <FadeInView className="px-5 mt-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider">
              Mes formations
            </Text>
            <AnimatedPressable hapticType="selection" className="px-2 py-1">
              <Text className="text-primary font-sans-semibold">Tout voir</Text>
            </AnimatedPressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            {enrolledCourses.map((courseId) => {
              const course = courses.find((c) => c.id === courseId);
              if (!course) return null;

              const progress = getProgressPercentage(courseId);

              return (
                <AnimatedPressable
                  key={course.id}
                  className="bg-white border border-gray-100 rounded-3xl mr-3 overflow-hidden"
                  style={{ width: CARD_WIDTH }}
                  onPress={() => router.push(`/training/${course.id}`)}
                >
                  <Image
                    source={{ uri: course.thumbnailUrl }}
                    className="w-full h-32 rounded-t-2xl"
                    resizeMode="cover"
                  />
                  <View className="p-4">
                    <Text
                      className="text-base font-heading-bold text-gray-900 mb-3"
                      numberOfLines={2}
                    >
                      {course.title}
                    </Text>

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
                    <Text className="text-xs font-sans text-muted-foreground">
                      {progress}% complété
                    </Text>
                  </View>
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </FadeInView>
      )}

      <FadeInView className="px-5 mt-5 pb-8" delay={100}>
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {enrolledCourses.length > 0 ? "Tous les cours" : "Cours disponibles"}
        </Text>

        {courses.map((course) => {
          const enrolled = isEnrolled(course.id);
          const progress = getProgressPercentage(course.id);

          return (
            <AnimatedPressable
              key={course.id}
              className="bg-white rounded-3xl border border-gray-100 mb-3 p-3"
              onPress={() => router.push(`/training/${course.id}`)}
            >
              <View className="flex-row items-start">
                <Image
                  source={{ uri: course.thumbnailUrl }}
                  className="w-24 h-24 rounded-2xl"
                  resizeMode="cover"
                />
                <View className="flex-1 pl-3">
                  <View className="flex-row items-start justify-between mb-1.5">
                    <Text
                      className="text-base font-heading-bold text-gray-900 flex-1 mr-2"
                      numberOfLines={2}
                    >
                      {course.title}
                    </Text>
                    {enrolled && (
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
                    {course.description}
                  </Text>

                  <View className="flex-row items-center flex-wrap gap-1.5">
                    <View
                      className={`${getDifficultyBgColor(course.difficulty)} border border-black/5 px-2.5 py-1 rounded-full`}
                    >
                      <Text
                        className={`${getDifficultyColor(course.difficulty)} text-xs font-sans-semibold capitalize`}
                      >
                        {course.difficulty}
                      </Text>
                    </View>

                    <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color={colors.muted}
                      />
                      <Text className="text-muted-foreground text-xs font-sans ml-1">
                        {course.duration}h
                      </Text>
                    </View>

                    <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                      <Ionicons
                        name="book-outline"
                        size={12}
                        color={colors.muted}
                      />
                      <Text className="text-muted-foreground text-xs font-sans ml-1">
                        {getLessonsCount(course)} leçons
                      </Text>
                    </View>

                    {course.requiresCertification && (
                      <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full border border-yellow-200">
                        <Ionicons
                          name="ribbon-outline"
                          size={12}
                          color={colors.warningDark}
                        />
                        <Text className="text-yellow-700 text-xs font-sans ml-1">
                          Certification
                        </Text>
                      </View>
                    )}
                  </View>

                  {enrolled && progress > 0 && (
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
      </FadeInView>

      {courses.length === 0 && (
        <View className="items-center px-6 py-16">
          <Ionicons name="school-outline" size={64} color={colors.mutedLight} />
          <Text className="text-lg font-heading-bold text-gray-400 mt-4">
            Aucun cours disponible
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
