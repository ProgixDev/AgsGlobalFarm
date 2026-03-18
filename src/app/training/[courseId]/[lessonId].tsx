import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTrainingStore } from "@/stores/trainingStore";

export default function LessonViewerScreen() {
  const router = useRouter();
  const { courseId, lessonId } = useLocalSearchParams<{
    courseId: string;
    lessonId: string;
  }>();
  const getCourseById = useTrainingStore((state) => state.getCourseById);
  const getLessonById = useTrainingStore((state) => state.getLessonById);
  const completeLesson = useTrainingStore((state) => state.completeLesson);
  const lessonProgress = useTrainingStore((state) => state.lessonProgress);
  const submitQuizAttempt = useTrainingStore(
    (state) => state.submitQuizAttempt,
  );

  const course = getCourseById(courseId);
  const lesson = getLessonById(courseId, lessonId);
  const progressKey = `${courseId}-${lessonId}`;
  const isCompleted = lessonProgress[progressKey]?.completed || false;

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<
    Record<string, string | number>
  >({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    // Track time spent
    return () => {
      // Could update lesson progress with time spent
    };
  }, []);

  if (!course || !lesson) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
        <Text className="text-xl font-bold text-gray-400 mt-4">
          Leçon introuvable
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-lg mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCompleteLesson = () => {
    if (lesson.quiz && !quizSubmitted) {
      setShowQuiz(true);
    } else {
      completeLesson(lessonId, courseId);
      Alert.alert(
        "Leçon complétée !",
        "Vous avez terminé cette leçon avec succès.",
        [
          {
            text: "Continuer",
            onPress: () => router.back(),
          },
        ],
      );
    }
  };

  const handleQuizAnswer = (questionId: string, answer: string | number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = () => {
    if (!lesson.quiz) return;

    let correctCount = 0;
    lesson.quiz.questions.forEach((question) => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round(
      (correctCount / lesson.quiz.questions.length) * 100,
    );
    setQuizScore(score);
    setQuizSubmitted(true);

    const attempt: QuizAttempt = {
      quizId: lesson.quiz.id,
      lessonId: lesson.id,
      courseId,
      score,
      totalQuestions: lesson.quiz.questions.length,
      answers: quizAnswers,
      attemptedAt: new Date().toISOString(),
      passed: score >= lesson.quiz.passingScore,
    };

    submitQuizAttempt(attempt);

    if (attempt.passed) {
      completeLesson(lessonId, courseId);
    }
  };

  const renderContent = (content: MediaContent, index: number) => {
    switch (content.type) {
      case "video":
        return (
          <View
            key={index}
            className="bg-black rounded-xl overflow-hidden mb-6"
          >
            <View className="aspect-video bg-gray-800 items-center justify-center">
              <Ionicons name="play-circle" size={64} color="white" />
              <Text className="text-white text-sm mt-2">
                Vidéo - {Math.floor((content.duration || 0) / 60)} min
              </Text>
            </View>
          </View>
        );

      case "text":
        return (
          <View key={index} className="mb-6">
            <Text className="text-base text-gray-700 leading-7">
              {content.text}
            </Text>
          </View>
        );

      case "image":
        return (
          <View key={index} className="mb-6 rounded-xl overflow-hidden">
            <Image
              source={{ uri: content.url }}
              className="w-full h-64"
              resizeMode="cover"
            />
          </View>
        );

      case "pdf":
        return (
          <TouchableOpacity
            key={index}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex-row items-center"
          >
            <Ionicons name="document-text" size={32} color="#dc2626" />
            <View className="ml-4 flex-1">
              <Text className="text-base font-semibold text-gray-800">
                Document PDF
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                Appuyez pour ouvrir
              </Text>
            </View>
            <Ionicons name="download-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const renderQuiz = () => {
    if (!lesson.quiz) return null;

    return (
      <View className="px-6 pb-8">
        <View className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="help-circle" size={24} color="#16a34a" />
            <Text className="text-lg font-bold text-gray-800 ml-2">
              {lesson.quiz.title}
            </Text>
          </View>
          <Text className="text-sm text-gray-600">
            Score minimum requis : {lesson.quiz.passingScore}%
          </Text>
        </View>

        {lesson.quiz.questions.map((question, qIndex) => (
          <View
            key={question.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm"
          >
            <Text className="text-base font-semibold text-gray-800 mb-4">
              {qIndex + 1}. {question.question}
            </Text>

            {question.options?.map((option, optIndex) => {
              const isSelected = quizAnswers[question.id] === optIndex;
              const isCorrect = question.correctAnswer === optIndex;
              const showCorrect = quizSubmitted && isCorrect;
              const showWrong = quizSubmitted && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={optIndex}
                  className={`border rounded-lg p-3 mb-2 ${
                    showCorrect
                      ? "bg-green-50 border-green-500"
                      : showWrong
                        ? "bg-red-50 border-red-500"
                        : isSelected
                          ? "bg-primary/5 border-primary"
                          : "bg-white border-gray-200"
                  }`}
                  onPress={() =>
                    !quizSubmitted && handleQuizAnswer(question.id, optIndex)
                  }
                  disabled={quizSubmitted}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                        showCorrect
                          ? "border-green-500 bg-green-500"
                          : showWrong
                            ? "border-red-500 bg-red-500"
                            : isSelected
                              ? "border-primary bg-primary/50"
                              : "border-gray-300"
                      }`}
                    >
                      {(isSelected || showCorrect) && (
                        <Ionicons
                          name={
                            showCorrect
                              ? "checkmark"
                              : showWrong
                                ? "close"
                                : "checkmark"
                          }
                          size={16}
                          color="white"
                        />
                      )}
                    </View>
                    <Text
                      className={`flex-1 text-sm ${
                        showCorrect
                          ? "text-green-700 font-semibold"
                          : showWrong
                            ? "text-red-700 font-semibold"
                            : isSelected
                              ? "text-primary font-semibold"
                              : "text-gray-700"
                      }`}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {quizSubmitted && question.explanation && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#2563eb"
                  />
                  <Text className="text-sm text-blue-700 ml-2 flex-1">
                    {question.explanation}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {quizSubmitted && (
          <View
            className={`rounded-xl p-6 mb-4 ${
              quizScore >= lesson.quiz.passingScore
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <View className="items-center">
              <Ionicons
                name={
                  quizScore >= lesson.quiz.passingScore
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={48}
                color={
                  quizScore >= lesson.quiz.passingScore ? "#16a34a" : "#dc2626"
                }
              />
              <Text className="text-2xl font-bold text-gray-800 mt-3">
                Score : {quizScore}%
              </Text>
              <Text className="text-base text-gray-600 mt-2 text-center">
                {quizScore >= lesson.quiz.passingScore
                  ? "Félicitations ! Vous avez réussi le quiz."
                  : "Vous n'avez pas atteint le score minimum. Révisez la leçon et réessayez."}
              </Text>
            </View>
          </View>
        )}

        {!quizSubmitted ? (
          <TouchableOpacity
            className={`py-4 rounded-xl items-center ${
              Object.keys(quizAnswers).length === lesson.quiz.questions.length
                ? "bg-primary"
                : "bg-gray-300"
            }`}
            onPress={handleSubmitQuiz}
            disabled={
              Object.keys(quizAnswers).length !== lesson.quiz.questions.length
            }
          >
            <Text className="text-white font-bold text-base">
              Soumettre le Quiz
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="space-y-3">
            {quizScore >= lesson.quiz.passingScore ? (
              <TouchableOpacity
                className="bg-primary py-4 rounded-xl items-center"
                onPress={() => router.back()}
              >
                <Text className="text-white font-bold text-base">
                  Continuer
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  className="bg-primary py-4 rounded-xl items-center"
                  onPress={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                    setQuizScore(0);
                  }}
                >
                  <Text className="text-white font-bold text-base">
                    Réessayer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-200 py-4 rounded-xl items-center"
                  onPress={() => setShowQuiz(false)}
                >
                  <Text className="text-gray-700 font-bold text-base">
                    Revoir la Leçon
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-6">
        <TouchableOpacity
          className="flex-row items-center mb-4"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-white text-base ml-2">Retour au cours</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">{lesson.title}</Text>
        <Text className="text-white/70 text-sm mt-1">{course.title}</Text>
      </View>

      <ScrollView className="flex-1">
        {!showQuiz ? (
          <>
            {/* Lesson Description */}
            <View className="px-6 py-6">
              <View className="flex-row items-center mb-4">
                <View className="bg-primary/10 rounded-full p-2 mr-3">
                  <Ionicons name="book" size={20} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800 font-semibold">
                    {lesson.description}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={14} color="#9ca3af" />
                    <Text className="text-sm text-gray-500 ml-1">
                      {lesson.duration} minutes
                    </Text>
                  </View>
                </View>
                {isCompleted && (
                  <View className="bg-green-100 rounded-full p-2">
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#16a34a"
                    />
                  </View>
                )}
              </View>
            </View>

            {/* Lesson Content */}
            <View className="px-6">
              {lesson.content.map((content, index) =>
                renderContent(content, index),
              )}
            </View>

            {/* Complete Lesson Button */}
            <View className="px-6 pb-8">
              {!isCompleted && (
                <TouchableOpacity
                  className="bg-primary py-4 rounded-xl items-center shadow-lg"
                  onPress={handleCompleteLesson}
                >
                  <Text className="text-white font-bold text-base">
                    {lesson.quiz ? "Passer au Quiz" : "Marquer comme Complété"}
                  </Text>
                </TouchableOpacity>
              )}
              {isCompleted && (
                <View className="bg-green-50 border border-green-200 rounded-xl p-4 items-center">
                  <Ionicons name="checkmark-circle" size={32} color="#16a34a" />
                  <Text className="text-green-700 font-semibold text-base mt-2">
                    Leçon complétée
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          renderQuiz()
        )}
      </ScrollView>
    </View>
  );
}
