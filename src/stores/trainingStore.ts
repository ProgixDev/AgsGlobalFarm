import { create } from "zustand";
import {
  fetchOnlineFormations,
  fetchPresentialFormations,
  fetchOwnedFormations,
  fetchOnlineFormationById,
  fetchPresentialFormationById,
  fetchProgress,
  updateProgressApi,
  fetchQuiz,
  submitQuizApi,
  fetchQuizResult,
  fetchQuizAttempts,
  resendCertificate as resendCertificateApi,
  enrollFormation as enrollFormationApi,
} from "@/lib/api/training";

type Status = "idle" | "loading" | "ready" | "error";

interface TrainingStore {
  online: OnlineFormation[];
  presential: PresentialFormation[];
  ownedOnline: OnlineFormation[];
  ownedPresential: PresentialFormation[];
  formationsStatus: Status;
  formationsError: string | null;

  detailById: Record<string, OnlineFormation | PresentialFormation>;
  progressByFormationId: Record<string, string[]>;
  quizByFormationId: Record<string, FormationQuizSection[]>;
  quizResultByFormationId: Record<string, QuizResult | null>;
  attemptsByFormationId: Record<string, QuizAttemptsInfo>;

  loadFormations: () => Promise<void>;
  loadOwned: () => Promise<void>;
  loadOnlineById: (id: string) => Promise<OnlineFormation | null>;
  loadPresentialById: (id: string) => Promise<PresentialFormation | null>;

  loadProgress: (formationId: string) => Promise<string[]>;
  markLessonComplete: (
    formationId: string,
    lessonKey: string,
  ) => Promise<void>;
  unmarkLessonComplete: (
    formationId: string,
    lessonKey: string,
  ) => Promise<void>;

  enrollFormation: (
    formationId: string,
    sessionId?: number,
  ) => Promise<void>;

  loadQuiz: (formationId: string) => Promise<FormationQuizSection[] | null>;
  submitQuiz: (
    formationId: string,
    answers: QuizAnswerInput[],
  ) => Promise<QuizSubmitResult>;
  loadQuizResult: (formationId: string) => Promise<QuizResult | null>;
  loadQuizAttempts: (formationId: string) => Promise<QuizAttemptsInfo>;
  resendCertificate: (formationId: string) => Promise<void>;

  getFormationById: (
    id: string,
  ) => OnlineFormation | PresentialFormation | undefined;
  isOnline: (
    f: OnlineFormation | PresentialFormation,
  ) => f is OnlineFormation;
  getProgressPercentage: (formationId: string) => number;
}

function isOnlineFormation(
  f: OnlineFormation | PresentialFormation,
): f is OnlineFormation {
  return f.type === "online";
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  online: [],
  presential: [],
  ownedOnline: [],
  ownedPresential: [],
  formationsStatus: "idle",
  formationsError: null,
  detailById: {},
  progressByFormationId: {},
  quizByFormationId: {},
  quizResultByFormationId: {},
  attemptsByFormationId: {},

  loadFormations: async () => {
    set({ formationsStatus: "loading", formationsError: null });
    try {
      const [online, presential] = await Promise.all([
        fetchOnlineFormations(),
        fetchPresentialFormations(),
      ]);
      set({
        online: online.map((f) => ({ ...f, type: "online" as const })),
        presential: presential.map((f) => ({ ...f, type: "presentiel" as const })),
        formationsStatus: "ready",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement";
      set({ formationsStatus: "error", formationsError: message });
    }
  },

  loadOwned: async () => {
    try {
      const { online, presential } = await fetchOwnedFormations();
      set({
        ownedOnline: online.map((f) => ({ ...f, type: "online" as const })),
        ownedPresential: presential.map((f) => ({ ...f, type: "presentiel" as const })),
      });
    } catch (err) {
      console.warn("Failed to load owned formations", err);
    }
  },

  loadOnlineById: async (id: string) => {
    try {
      const formation = await fetchOnlineFormationById(id);
      const withType = { ...formation, type: "online" as const };
      set((state) => ({
        detailById: { ...state.detailById, [id]: withType },
      }));
      return withType;
    } catch (err) {
      console.warn("Failed to load online formation", err);
      return null;
    }
  },

  loadPresentialById: async (id: string) => {
    try {
      const formation = await fetchPresentialFormationById(id);
      const withType = { ...formation, type: "presentiel" as const };
      set((state) => ({
        detailById: { ...state.detailById, [id]: withType },
      }));
      return withType;
    } catch (err) {
      console.warn("Failed to load presential formation", err);
      return null;
    }
  },

  loadProgress: async (formationId: string) => {
    try {
      const completedLessons = await fetchProgress(formationId);
      set((state) => ({
        progressByFormationId: {
          ...state.progressByFormationId,
          [formationId]: completedLessons,
        },
      }));
      return completedLessons;
    } catch (err) {
      console.warn("Failed to load progress", err);
      return [];
    }
  },

  markLessonComplete: async (formationId: string, lessonKey: string) => {
    const current = get().progressByFormationId[formationId] || [];
    if (current.includes(lessonKey)) return;
    const next = [...current, lessonKey];
    set((state) => ({
      progressByFormationId: {
        ...state.progressByFormationId,
        [formationId]: next,
      },
    }));
    try {
      await updateProgressApi(formationId, next);
    } catch (err) {
      console.warn("Failed to update progress", err);
      set((state) => ({
        progressByFormationId: {
          ...state.progressByFormationId,
          [formationId]: current,
        },
      }));
      throw err;
    }
  },

  unmarkLessonComplete: async (formationId: string, lessonKey: string) => {
    const current = get().progressByFormationId[formationId] || [];
    if (!current.includes(lessonKey)) return;
    const next = current.filter((k) => k !== lessonKey);
    set((state) => ({
      progressByFormationId: {
        ...state.progressByFormationId,
        [formationId]: next,
      },
    }));
    try {
      await updateProgressApi(formationId, next);
    } catch (err) {
      console.warn("Failed to update progress", err);
      set((state) => ({
        progressByFormationId: {
          ...state.progressByFormationId,
          [formationId]: current,
        },
      }));
      throw err;
    }
  },

  enrollFormation: async (formationId: string, sessionId?: number) => {
    const result = await enrollFormationApi(formationId, sessionId);
    if (result.type === "online") {
      await get().loadOnlineById(formationId);
    } else {
      await get().loadPresentialById(formationId);
    }
    await get().loadOwned();
  },

  loadQuiz: async (formationId: string) => {
    try {
      const quiz = await fetchQuiz(formationId);
      set((state) => ({
        quizByFormationId: {
          ...state.quizByFormationId,
          [formationId]: quiz,
        },
      }));
      return quiz;
    } catch (err) {
      console.warn("Failed to load quiz", err);
      return null;
    }
  },

  submitQuiz: async (formationId: string, answers: QuizAnswerInput[]) => {
    const result = await submitQuizApi(formationId, answers);
    if (result.passed) {
      const passedResult: QuizResult = {
        formationId,
        score: result.score,
        totalQuestions: result.total,
        passed: true,
        certificateSent: result.certificateSent,
        attemptDate: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      set((state) => ({
        quizResultByFormationId: {
          ...state.quizResultByFormationId,
          [formationId]: passedResult,
        },
      }));
    }
    try {
      const attempts = await fetchQuizAttempts(formationId);
      set((state) => ({
        attemptsByFormationId: {
          ...state.attemptsByFormationId,
          [formationId]: attempts,
        },
      }));
    } catch {}
    return result;
  },

  loadQuizResult: async (formationId: string) => {
    try {
      const result = await fetchQuizResult(formationId);
      set((state) => ({
        quizResultByFormationId: {
          ...state.quizResultByFormationId,
          [formationId]: result,
        },
      }));
      return result;
    } catch (err) {
      console.warn("Failed to load quiz result", err);
      return null;
    }
  },

  loadQuizAttempts: async (formationId: string) => {
    const attempts = await fetchQuizAttempts(formationId);
    set((state) => ({
      attemptsByFormationId: {
        ...state.attemptsByFormationId,
        [formationId]: attempts,
      },
    }));
    return attempts;
  },

  resendCertificate: async (formationId: string) => {
    await resendCertificateApi(formationId);
  },

  getFormationById: (id: string) => {
    const state = get();
    if (state.detailById[id]) return state.detailById[id];
    const online = state.online.find((f) => f._id === id);
    if (online) return online;
    const presential = state.presential.find((f) => f._id === id);
    if (presential) return presential;
    const ownedOnline = state.ownedOnline.find((f) => f._id === id);
    if (ownedOnline) return ownedOnline;
    const ownedPresential = state.ownedPresential.find((f) => f._id === id);
    if (ownedPresential) return ownedPresential;
    return undefined;
  },

  isOnline: isOnlineFormation,

  getProgressPercentage: (formationId: string) => {
    const state = get();
    const formation = state.getFormationById(formationId);
    if (!formation || !isOnlineFormation(formation)) return 0;
    const total = formation.stats?.totalLessons || 0;
    if (total === 0) return 0;
    const completed =
      state.progressByFormationId[formationId]?.length || 0;
    return Math.min(100, Math.round((completed / total) * 100));
  },
}));
