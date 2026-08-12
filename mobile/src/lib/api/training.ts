import { apiFetch } from "@/lib/api/client";

export async function fetchOnlineFormations(): Promise<OnlineFormation[]> {
  const data = await apiFetch<{ formations: OnlineFormation[] }>(
    "/api/formations/online",
    { auth: true },
  );
  return data.formations;
}

export async function fetchPresentialFormations(): Promise<
  PresentialFormation[]
> {
  const data = await apiFetch<{ formations: PresentialFormation[] }>(
    "/api/formations/presential",
    { auth: true },
  );
  return data.formations;
}

export async function fetchOwnedFormations(): Promise<{
  online: OnlineFormation[];
  presential: PresentialFormation[];
}> {
  return apiFetch("/api/formations/owned", { auth: true });
}

export async function fetchOnlineFormationById(
  id: string,
): Promise<OnlineFormation> {
  const data = await apiFetch<{ formation: OnlineFormation }>(
    `/api/formations/online/${encodeURIComponent(id)}`,
    { auth: true },
  );
  return data.formation;
}

export async function fetchPresentialFormationById(
  id: string,
): Promise<PresentialFormation> {
  const data = await apiFetch<{ formation: PresentialFormation }>(
    `/api/formations/presential/${encodeURIComponent(id)}`,
    { auth: true },
  );
  return data.formation;
}

export async function fetchProgress(formationId: string): Promise<string[]> {
  const data = await apiFetch<{ completedLessons: string[] }>(
    `/api/formations/${encodeURIComponent(formationId)}/progress`,
    { auth: true },
  );
  return data.completedLessons || [];
}

export async function updateProgressApi(
  formationId: string,
  completedLessons: string[],
): Promise<string[]> {
  const data = await apiFetch<{ completedLessons: string[] }>(
    `/api/formations/${encodeURIComponent(formationId)}/progress`,
    {
      method: "PUT",
      body: { completedLessons },
      auth: true,
    },
  );
  return data.completedLessons || [];
}

export async function fetchQuiz(
  formationId: string,
): Promise<FormationQuizSection[]> {
  const data = await apiFetch<{ quiz: FormationQuizSection[] }>(
    `/api/formations/${encodeURIComponent(formationId)}/quiz`,
    { auth: true },
  );
  return data.quiz;
}

export async function submitQuizApi(
  formationId: string,
  answers: QuizAnswerInput[],
): Promise<QuizSubmitResult> {
  return apiFetch<QuizSubmitResult>(
    `/api/formations/${encodeURIComponent(formationId)}/quiz/submit`,
    {
      method: "POST",
      body: { answers },
      auth: true,
    },
  );
}

export async function fetchQuizResult(
  formationId: string,
): Promise<QuizResult | null> {
  const data = await apiFetch<{ result: QuizResult | null }>(
    `/api/formations/${encodeURIComponent(formationId)}/quiz/result`,
    { auth: true },
  );
  return data.result;
}

export async function fetchQuizAttempts(
  formationId: string,
): Promise<QuizAttemptsInfo> {
  return apiFetch<QuizAttemptsInfo>(
    `/api/formations/${encodeURIComponent(formationId)}/quiz/attempts`,
    { auth: true },
  );
}

export async function resendCertificate(formationId: string): Promise<void> {
  await apiFetch(
    `/api/formations/${encodeURIComponent(formationId)}/certificate/resend`,
    {
      method: "POST",
      auth: true,
    },
  );
}

export async function enrollFormation(
  formationId: string,
  sessionId?: number,
): Promise<{ ok: boolean; type: "online" | "presentiel"; sessionId?: number }> {
  return apiFetch(`/api/formations/enroll`, {
    method: "POST",
    body: { formationId, sessionId },
    auth: true,
  });
}
