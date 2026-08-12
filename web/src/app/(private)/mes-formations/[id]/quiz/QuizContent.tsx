"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Award,
  RotateCcw,
  Mail,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { submitQuiz, resendCertificate } from "@/lib/db";
import type { QuizSection } from "@/types";

interface QuizContentProps {
  formationId: string;
  sections: QuizSection[];
  userEmail: string;
  alreadyPassed: boolean;
  previousScore?: { score: number; total: number };
  remainingAttempts: number;
  attemptsToday: number;
}

export default function QuizContent({
  formationId,
  sections,
  userEmail,
  alreadyPassed,
  previousScore,
  remainingAttempts,
}: QuizContentProps) {
  const allQuestions = sections.flatMap((section) =>
    section.questions.map((q) => ({ ...q, sectionId: section.id })),
  );

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
    certificateSent: boolean;
    answers: { sectionId: number; questionId: number; correct: boolean }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const passingThreshold = 0.7;
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  const answeredInSection = currentSection.questions.filter(
    (q) => selectedAnswers[q.id] !== undefined,
  ).length;
  const allAnsweredInSection =
    answeredInSection === currentSection.questions.length;

  const totalAnswered = allQuestions.filter(
    (q) => selectedAnswers[q.id] !== undefined,
  ).length;
  const allAnswered = totalAnswered === allQuestions.length;

  const globalQuestionStart = sections
    .slice(0, currentSectionIndex)
    .reduce((sum, s) => sum + s.questions.length, 0);

  const handleSelectAnswer = (questionId: number, answerId: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleNext = () => {
    if (!isLastSection) setCurrentSectionIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (!isFirstSection) setCurrentSectionIndex((i) => i - 1);
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    startTransition(async () => {
      setError(null);
      const answers = allQuestions.map((q) => ({
        questionId: q.id,
        selectedAnswer: selectedAnswers[q.id],
      }));
      const res = await submitQuiz(formationId, answers);
      if (res.success && res.data) {
        setResult(res.data);
        setSubmitted(true);
      } else {
        setError(res.error || "Erreur lors de la soumission du quiz.");
      }
    });
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
    setError(null);
    setCurrentSectionIndex(0);
  };

  const handleResendCertificate = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setError(null);
    try {
      const res = await resendCertificate(formationId);
      if (!res.success) throw new Error(res.error || "Erreur lors de l'envoi");
      setResendSuccess(true);
    } catch {
      setError("Erreur lors de l'envoi du certificat.");
    } finally {
      setIsResending(false);
    }
  };

  // ── Already passed view ──────────────────────────────────────────────────
  if (alreadyPassed && !submitted) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl border border-green-200 bg-linear-to-br from-green-50 to-emerald-50 p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Award className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Vous avez déjà réussi ce quiz !
          </h2>
          {previousScore && (
            <p className="mb-1 text-gray-600">
              Score :{" "}
              <span className="font-semibold text-green-700">
                {previousScore.score}/{previousScore.total}
              </span>{" "}
              ({Math.round((previousScore.score / previousScore.total) * 100)}%)
            </p>
          )}
          <p className="mb-8 text-sm text-gray-500">
            Votre certificat a été envoyé à <strong>{userEmail}</strong>.
          </p>
          {resendSuccess && (
            <p className="mb-4 rounded-lg bg-green-100 px-4 py-2 text-sm text-green-700">
              ✅ Le certificat a été renvoyé avec succès !
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={handleResendCertificate}
            disabled={isResending}
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700 disabled:opacity-50"
          >
            {isResending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isResending ? "Envoi en cours…" : "Renvoyer le certificat"}
          </button>
        </div>
      </div>
    );
  }

  // ── Result view ──────────────────────────────────────────────────────────
  if (submitted && result) {
    const percentage = Math.round((result.score / result.total) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score card */}
        <div
          className={`rounded-2xl border p-8 text-center shadow-sm ${
            result.passed
              ? "border-green-200 bg-linear-to-br from-green-50 to-emerald-50"
              : "border-red-200 bg-linear-to-br from-red-50 to-orange-50"
          }`}
        >
          <div
            className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${
              result.passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {result.passed ? (
              <Award className="h-10 w-10 text-green-600" />
            ) : (
              <XCircle className="h-10 w-10 text-red-500" />
            )}
          </div>

          {result.passed ? (
            <>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Félicitations ! 🎉
              </h2>
              <p className="mb-1 text-gray-700">
                Score :{" "}
                <span className="font-bold text-green-700">
                  {result.score}/{result.total}
                </span>{" "}
                <span className="text-green-600">({percentage}%)</span>
              </p>
              {result.certificateSent ? (
                <p className="mt-4 text-sm text-green-700">
                  ✅ Votre certificat a été envoyé à{" "}
                  <strong>{userEmail}</strong>
                </p>
              ) : (
                <div className="mt-4">
                  <p className="mb-3 text-sm text-orange-600">
                    L&apos;envoi du certificat a échoué.
                  </p>
                  <button
                    onClick={handleResendCertificate}
                    disabled={isResending}
                    className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {isResending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {isResending ? "Envoi en cours…" : "Renvoyer le certificat"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Quiz non réussi
              </h2>
              <p className="mb-1 text-gray-700">
                Score :{" "}
                <span className="font-bold text-red-600">
                  {result.score}/{result.total}
                </span>{" "}
                ({percentage}%)
              </p>
              <p className="mb-6 text-sm text-gray-500">
                Minimum requis : {Math.round(passingThreshold * 100)}%. Révisez
                le contenu et réessayez.
              </p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-gray-900"
              >
                <RotateCcw className="h-4 w-4" />
                Réessayer
              </button>
            </>
          )}
        </div>

        {/* Answers review */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Revue des réponses
          </h3>
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id}>
                <div className="mb-3 rounded-lg border-l-4 border-gray-400 bg-gray-50 px-4 py-2">
                  <p className="font-semibold text-gray-700">{section.title}</p>
                </div>
                <div className="space-y-3">
                  {section.questions.map((question) => {
                    const feedback = result.answers.find(
                      (a) => a.questionId === question.id,
                    );
                    const selected = selectedAnswers[question.id];
                    const isCorrect = feedback?.correct ?? false;

                    return (
                      <div
                        key={question.id}
                        className={`rounded-xl border p-4 ${
                          isCorrect
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                          ) : (
                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {question.question}
                            </p>
                            {question.image && (
                              <div className="mt-2 max-w-md">
                                <Image
                                  src={question.image}
                                  alt="Question illustration"
                                  width={500}
                                  height={400}
                                  className="w-full rounded-lg border border-gray-200"
                                />
                              </div>
                            )}
                            <div className="mt-2 space-y-1">
                              {question.options.map((option) => {
                                const optionId =
                                  typeof option === "string"
                                    ? option
                                    : option.id;
                                const optionText =
                                  typeof option === "string"
                                    ? option
                                    : option.text;
                                const isSelectedOption = optionId === selected;

                                return (
                                  <p
                                    key={optionId}
                                    className={`text-sm ${
                                      isSelectedOption && isCorrect
                                        ? "font-semibold text-green-700"
                                        : isSelectedOption && !isCorrect
                                          ? "font-semibold text-red-600"
                                          : "text-gray-500"
                                    }`}
                                  >
                                    {isSelectedOption && isCorrect && "✓ "}
                                    {isSelectedOption && !isCorrect && "✗ "}
                                    {optionText}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz form view ───────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {/* Attempts banner */}
      {remainingAttempts <= 1 && (
        <div
          className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            remainingAttempts === 0
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-orange-200 bg-orange-50 text-orange-700"
          }`}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {remainingAttempts === 0
            ? "Vous avez utilisé toutes vos tentatives aujourd'hui. Revenez demain."
            : "Il vous reste 1 tentative aujourd'hui."}
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Overall progress bar */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
          <span>
            {totalAnswered}/{allQuestions.length} questions répondues
          </span>
          <span>
            {Math.round((totalAnswered / allQuestions.length) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-green-600 transition-all duration-500"
            style={{
              width: `${(totalAnswered / allQuestions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Section tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {sections.map((section, index) => {
          const sectionAnswered = section.questions.filter(
            (q) => selectedAnswers[q.id] !== undefined,
          ).length;
          const sectionComplete = sectionAnswered === section.questions.length;
          const isCurrent = index === currentSectionIndex;

          return (
            <button
              key={section.id}
              onClick={() => setCurrentSectionIndex(index)}
              className={`relative shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                isCurrent
                  ? "bg-green-600 text-white shadow"
                  : sectionComplete
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {sectionComplete && !isCurrent && <span className="mr-1">✓</span>}
              Section {index + 1}
            </button>
          );
        })}
      </div>

      {/* Section card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Section header */}
        <div className="rounded-t-2xl border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Section {currentSectionIndex + 1} sur {sections.length}
              </p>
              <h3 className="mt-0.5 text-lg font-bold text-gray-900">
                {currentSection.title}
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                allAnsweredInSection
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {answeredInSection}/{currentSection.questions.length}
            </span>
          </div>
        </div>

        {/* Questions */}
        <div className="divide-y divide-gray-100">
          {currentSection.questions.map((question, qIndex) => {
            const globalIndex = globalQuestionStart + qIndex;
            const isAnswered = selectedAnswers[question.id] !== undefined;

            return (
              <div key={question.id} className="px-6 py-6">
                <div className="mb-4 flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isAnswered
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {globalIndex + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {question.question}
                      {question.points && (
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          ({question.points} pt{question.points > 1 ? "s" : ""})
                        </span>
                      )}
                    </p>
                    {question.image && (
                      <div className="mt-3 max-w-lg">
                        <Image
                          src={question.image}
                          alt="Question illustration"
                          width={800}
                          height={600}
                          className="w-full rounded-xl border border-gray-200"
                        />
                      </div>
                    )}
                    <div className="mt-4 space-y-2.5">
                      {question.options.map((option) => {
                        const optionId =
                          typeof option === "string" ? option : option.id;
                        const optionText =
                          typeof option === "string" ? option : option.text;
                        const isSelected =
                          selectedAnswers[question.id] === optionId;

                        return (
                          <button
                            key={optionId}
                            onClick={() =>
                              handleSelectAnswer(question.id, optionId)
                            }
                            className={`w-full rounded-xl border-2 p-3.5 text-left transition-all ${
                              isSelected
                                ? "border-green-500 bg-green-50 text-green-900"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                  isSelected
                                    ? "border-green-500 bg-green-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <div className="h-2 w-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="text-sm">{optionText}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section navigation footer */}
        <div className="flex items-center justify-between rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            onClick={handlePrev}
            disabled={isFirstSection}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>

          {isLastSection ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isPending || remainingAttempts === 0}
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Vérification…
                </>
              ) : (
                "Soumettre le quiz"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-700"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Attempts counter (subtle) */}
      <p className="mt-4 text-center text-xs text-gray-400">
        {remainingAttempts}/3 tentatives restantes aujourd&apos;hui
      </p>
    </div>
  );
}
