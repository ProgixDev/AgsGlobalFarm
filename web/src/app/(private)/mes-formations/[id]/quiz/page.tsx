import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getFormationQuiz,
  getQuizResult,
  getQuizAttemptsToday,
} from "@/lib/db";
import { redirect } from "next/navigation";
import BackButton from "../BackButton";
import QuizContent from "./QuizContent";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/login");
  const userEmail = (session.user as { email: string }).email;

  const { id: formationId } = await params;

  // Fetch quiz (includes ownership and completion checks)
  const quizSections = await getFormationQuiz(formationId);

  if (!quizSections || quizSections.length === 0) {
    redirect("/mes-formations");
  }

  // Check if user already passed
  const existingResult = await getQuizResult(formationId);

  // Get attempts today
  const attemptsToday = await getQuizAttemptsToday(formationId);
  const maxAttempts = 3;
  const remainingAttempts = maxAttempts - attemptsToday;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quiz de Formation
        </h1>
        <p className="text-gray-600">
          Répondez aux questions suivantes pour obtenir votre certificat de
          formation. Vous devez obtenir au moins 70% de bonnes réponses.
        </p>
      </div>

      <QuizContent
        formationId={formationId}
        sections={quizSections}
        userEmail={userEmail}
        alreadyPassed={!!existingResult?.passed}
        previousScore={
          existingResult
            ? {
                score: existingResult.score,
                total: existingResult.totalQuestions,
              }
            : undefined
        }
        remainingAttempts={remainingAttempts}
        attemptsToday={attemptsToday}
      />
    </div>
  );
}
