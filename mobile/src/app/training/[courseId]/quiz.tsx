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
import { useTrainingStore } from "@/stores/trainingStore";
import { colors } from "@/theme/colors";

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { courseId: formationId } = useLocalSearchParams<{ courseId: string }>();

  const loadQuiz = useTrainingStore((state) => state.loadQuiz);
  const submitQuiz = useTrainingStore((state) => state.submitQuiz);
  const loadAttempts = useTrainingStore((state) => state.loadQuizAttempts);
  const quizByFormationId = useTrainingStore(
    (state) => state.quizByFormationId,
  );
  const attemptsByFormationId = useTrainingStore(
    (state) => state.attemptsByFormationId,
  );

  const quiz = quizByFormationId[formationId];
  const attempts = attemptsByFormationId[formationId];

  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  useEffect(() => {
    if (!formationId) return;
    setBootstrapping(true);
    (async () => {
      const q = await loadQuiz(formationId);
      if (!q) {
        setError(
          "Quiz indisponible. Vérifiez que vous avez complété toutes les leçons.",
        );
      }
      try {
        await loadAttempts(formationId);
      } catch {}
      setBootstrapping(false);
    })();
  }, [formationId, loadQuiz, loadAttempts]);

  const allQuestions =
    quiz?.flatMap((section) =>
      section.questions.map((q) => ({ ...q, sectionTitle: section.title })),
    ) || [];

  const totalQuestions = allQuestions.length;
  const allAnswered =
    totalQuestions > 0 && Object.keys(answers).length === totalQuestions;

  const handleSelect = (questionId: number, optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!allAnswered || submitting || submitted) return;
    setSubmitting(true);
    try {
      const formatted: QuizAnswerInput[] = Object.entries(answers).map(
        ([qid, ans]) => ({ questionId: Number(qid), selectedAnswer: ans }),
      );
      const res = await submitQuiz(formationId, formatted);
      setResult(res);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la soumission";
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
          Chargement du quiz...
        </Text>
      </View>
    );
  }

  if (error || !quiz) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.mutedLight}
        />
        <Text className="text-base font-heading-bold text-gray-700 mt-4 text-center">
          {error || "Quiz indisponible"}
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

  const correctCount = result?.answers.filter((a) => a.correct).length ?? 0;

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
            Retour
          </Text>
        </TouchableOpacity>
        <Text className="text-xs font-sans-semibold uppercase tracking-wider text-gray-500 mb-1">
          Quiz
        </Text>
        <Text className="text-gray-900 text-xl font-heading-bold">
          Évaluation finale
        </Text>
        {attempts && !submitted && (
          <Text className="text-xs font-sans text-gray-500 mt-1">
            {attempts.remaining} tentative(s) restante(s) aujourd&apos;hui
          </Text>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {submitted && result && (
          <View className="px-5 pt-5">
            <View
              className={`rounded-2xl p-6 ${
                result.passed
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <View className="items-center">
                <Ionicons
                  name={result.passed ? "checkmark-circle" : "close-circle"}
                  size={48}
                  color={result.passed ? colors.primary : colors.dangerDark}
                />
                <Text className="text-2xl font-heading-bold text-gray-800 mt-3">
                  {result.score}/{result.total}
                </Text>
                <Text className="text-base font-sans text-gray-600 mt-2 text-center">
                  {result.passed
                    ? result.certificateSent
                      ? "Quiz réussi ! Le certificat a été envoyé par email."
                      : "Quiz réussi ! L'envoi du certificat est en cours."
                    : "Score insuffisant. Vous pouvez réessayer."}
                </Text>
              </View>
            </View>
          </View>
        )}

        {quiz.map((section) => (
          <View key={section.id} className="px-5 pt-5">
            <Text className="text-base font-heading-bold text-gray-800 mb-3">
              {section.title}
            </Text>
            {section.questions.map((question, qIndex) => {
              const selected = answers[question.id];
              const graded = result?.answers.find(
                (a) => a.questionId === question.id,
              );

              return (
                <View
                  key={question.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
                >
                  <Text className="text-base font-sans-semibold text-gray-800 mb-3">
                    {qIndex + 1}. {question.question}
                  </Text>
                  {question.options.map((option) => {
                    const isSelected = selected === option.id;
                    const showCorrect =
                      submitted && graded?.correct && isSelected;
                    const showWrong =
                      submitted && !graded?.correct && isSelected;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        className={`border rounded-xl p-3.5 mb-2 ${
                          showCorrect
                            ? "bg-green-50 border-green-500"
                            : showWrong
                              ? "bg-red-50 border-red-500"
                              : isSelected
                                ? "bg-primary/5 border-primary"
                                : "bg-white border-gray-200"
                        }`}
                        onPress={() => handleSelect(question.id, option.id)}
                        disabled={submitted}
                      >
                        <View className="flex-row items-center">
                          <View
                            className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                              showCorrect
                                ? "border-green-500 bg-green-500"
                                : showWrong
                                  ? "border-red-500 bg-red-500"
                                  : isSelected
                                    ? "border-primary bg-primary"
                                    : "border-gray-300"
                            }`}
                          >
                            {(isSelected || showCorrect) && (
                              <Ionicons
                                name={showWrong ? "close" : "checkmark"}
                                size={16}
                                color={colors.white}
                              />
                            )}
                          </View>
                          <Text
                            className={`flex-1 text-sm ${
                              showCorrect
                                ? "text-green-700 font-sans-semibold"
                                : showWrong
                                  ? "text-red-700 font-sans-semibold"
                                  : isSelected
                                    ? "text-primary font-sans-semibold"
                                    : "text-gray-700 font-sans"
                            }`}
                          >
                            {option.text}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        ))}

        <View className="px-5 pt-4 pb-2">
          {!submitted ? (
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center ${
                allAnswered && !submitting ? "bg-primary" : "bg-gray-300"
              }`}
              disabled={!allAnswered || submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text className="text-white font-sans-bold text-base">
                  Soumettre le quiz
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-primary py-4 rounded-2xl items-center"
              onPress={() => router.back()}
            >
              <Text className="text-white font-sans-bold text-base">
                Retour à la formation
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
