import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { useTrainingStore } from "@/stores/trainingStore";
import { colors } from "@/theme/colors";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".webm", ".MOV"];

function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSIONS.some((ext) => url.toLowerCase().endsWith(ext.toLowerCase()));
}

export default function LessonViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { courseId: formationId, lessonId: lessonKey } = useLocalSearchParams<{
    courseId: string;
    lessonId: string;
  }>();

  const getFormationById = useTrainingStore((state) => state.getFormationById);
  const loadOnlineById = useTrainingStore((state) => state.loadOnlineById);
  const loadProgress = useTrainingStore((state) => state.loadProgress);
  const progressByFormationId = useTrainingStore(
    (state) => state.progressByFormationId,
  );
  const markLessonComplete = useTrainingStore(
    (state) => state.markLessonComplete,
  );

  const [submitting, setSubmitting] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    if (!formationId) return;
    const f = getFormationById(formationId);
    if (!f || (f.type === "online" && !(f as OnlineFormation).sections)) {
      setBootstrapping(true);
      (async () => {
        await loadOnlineById(formationId);
        await loadProgress(formationId);
        setBootstrapping(false);
      })();
    } else {
      loadProgress(formationId);
    }
  }, [formationId, getFormationById, loadOnlineById, loadProgress]);

  const formation = getFormationById(formationId);
  const completedLessons = progressByFormationId[formationId] || [];
  const isCompleted = completedLessons.includes(lessonKey);

  const [sectionIdStr, lessonIdStr] = (lessonKey || "").split("-");
  const sectionIdNum = Number(sectionIdStr);
  const lessonIdNum = Number(lessonIdStr);

  const onlineFormation =
    formation?.type === "online" ? (formation as OnlineFormation) : null;
  const section = onlineFormation?.sections?.find(
    (s) => s.id === sectionIdNum,
  );
  const lesson = section?.lessons.find((l) => l.id === lessonIdNum);

  const videoUrl =
    lesson?.content && isVideoUrl(lesson.content) ? lesson.content : null;
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
  });

  const handleComplete = async () => {
    if (!formationId || !lessonKey) return;
    setSubmitting(true);
    try {
      await markLessonComplete(formationId, lessonKey);
      Alert.alert(
        "Leçon complétée",
        "Vous avez terminé cette leçon avec succès.",
        [{ text: "Continuer", onPress: () => router.back() }],
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de sauvegarde";
      Alert.alert("Erreur", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (bootstrapping) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-sm font-sans text-gray-500 mt-3">
          Chargement de la leçon...
        </Text>
      </View>
    );
  }

  if (!formation || !lesson || !section) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.mutedLight}
        />
        <Text className="text-xl font-heading-bold text-gray-400 mt-4">
          Leçon introuvable
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-2xl mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-sans-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View
        className="bg-white border-b border-gray-100 px-5 pb-4"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity
          className="flex-row items-center mb-3"
          onPress={() => router.back()}
        >
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
            <Ionicons name="arrow-back" size={18} color={colors.primary} />
          </View>
          <Text className="text-primary text-sm font-sans-semibold">
            Retour à la formation
          </Text>
        </TouchableOpacity>
        <Text className="text-xs font-sans-semibold uppercase tracking-wider text-gray-500 mb-1">
          {section.title}
        </Text>
        <Text className="text-gray-900 text-xl font-heading-bold">
          {lesson.title}
        </Text>
        <Text className="text-gray-500 text-sm font-sans mt-1">
          {formation.title}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 py-5">
          <View className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {videoUrl ? (
              <VideoView
                player={player}
                style={{ width: "100%", aspectRatio: 16 / 9 }}
                allowsFullscreen
                allowsPictureInPicture
              />
            ) : lesson.content ? (
              <View className="p-5">
                <Text className="text-base font-sans text-gray-700 leading-7">
                  {lesson.content}
                </Text>
              </View>
            ) : (
              <View className="p-5">
                <Text className="text-sm font-sans text-gray-500 italic">
                  Aucun contenu disponible pour cette leçon.
                </Text>
              </View>
            )}

            {isCompleted && (
              <View className="mt-4 flex-row items-center bg-green-50 border border-green-200 rounded-xl p-3">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text className="text-green-700 font-sans-semibold ml-2">
                  Leçon complétée
                </Text>
              </View>
            )}
          </View>
        </View>

        {!isCompleted && (
          <View className="px-5 pb-4">
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center ${
                submitting ? "bg-primary/60" : "bg-primary"
              }`}
              disabled={submitting}
              onPress={handleComplete}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text className="text-white font-sans-bold text-base">
                  Marquer comme complétée
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
