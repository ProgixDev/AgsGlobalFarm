import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trainingCourses } from "@/data/training-courses";

interface TrainingStore {
  courses: Course[];
  enrolledCourses: string[];
  courseProgress: Record<string, CourseProgress>;
  lessonProgress: Record<string, LessonProgress>;
  bookmarks: Bookmark[];
  notes: Note[];
  certificates: Certificate[];

  enrollInCourse: (courseId: string) => void;
  updateLessonProgress: (
    lessonId: string,
    courseId: string,
    progress: Partial<LessonProgress>,
  ) => void;
  completeLesson: (lessonId: string, courseId: string) => void;
  submitQuizAttempt: (attempt: QuizAttempt) => void;
  addBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
  removeBookmark: (bookmarkId: string) => void;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  downloadLesson: (lessonId: string, courseId: string) => Promise<void>;
  getCourseById: (courseId: string) => Course | undefined;
  getLessonById: (courseId: string, lessonId: string) => Lesson | undefined;
  generateCertificate: (courseId: string) => void;
}

const generateVerificationCode = (): string => {
  return `AGS-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
};

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set, get) => ({
      courses: trainingCourses,
      enrolledCourses: [],
      courseProgress: {},
      lessonProgress: {},
      bookmarks: [],
      notes: [],
      certificates: [],

      enrollInCourse: (courseId: string) => {
        const state = get();
        if (state.enrolledCourses.includes(courseId)) return;

        const course = state.courses.find((c) => c.id === courseId);
        if (!course) return;

        const totalLessons = course.modules.reduce(
          (sum, module) => sum + module.lessons.length,
          0,
        );

        const newEnrolled = [...state.enrolledCourses, courseId];
        const newProgress: CourseProgress = {
          courseId,
          enrolledAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          completedLessons: 0,
          totalLessons,
          progressPercentage: 0,
          quizScores: [],
          certificateEarned: false,
        };

        set({
          enrolledCourses: newEnrolled,
          courseProgress: { ...state.courseProgress, [courseId]: newProgress },
        });
      },

      updateLessonProgress: (
        lessonId: string,
        courseId: string,
        progress: Partial<LessonProgress>,
      ) => {
        const state = get();
        const key = `${courseId}-${lessonId}`;
        const existing = state.lessonProgress[key] || {
          lessonId,
          courseId,
          completed: false,
          timeSpent: 0,
        };

        const updated = { ...existing, ...progress };
        const newLessonProgress = { ...state.lessonProgress, [key]: updated };

        // Update course progress
        const updatedCourseProgress = { ...state.courseProgress };
        if (updatedCourseProgress[courseId]) {
          updatedCourseProgress[courseId] = {
            ...updatedCourseProgress[courseId],
            lastAccessedAt: new Date().toISOString(),
          };
        }

        set({
          lessonProgress: newLessonProgress,
          courseProgress: updatedCourseProgress,
        });
      },

      completeLesson: (lessonId: string, courseId: string) => {
        const state = get();
        const key = `${courseId}-${lessonId}`;
        const existing = state.lessonProgress[key] || {
          lessonId,
          courseId,
          completed: false,
          timeSpent: 0,
        };

        if (existing.completed) return;

        const completed: LessonProgress = {
          ...existing,
          completed: true,
          completedAt: new Date().toISOString(),
        };

        const newLessonProgress = { ...state.lessonProgress, [key]: completed };

        // Update course progress
        let newCourseProgress = { ...state.courseProgress };
        if (newCourseProgress[courseId]) {
          const completedCount = Object.values(newLessonProgress).filter(
            (lp) => lp.courseId === courseId && lp.completed,
          ).length;

          const totalLessons = newCourseProgress[courseId].totalLessons;
          const progressPercentage = Math.round(
            (completedCount / totalLessons) * 100,
          );

          newCourseProgress[courseId] = {
            ...newCourseProgress[courseId],
            completedLessons: completedCount,
            progressPercentage,
            lastAccessedAt: new Date().toISOString(),
          };
        }

        set({
          lessonProgress: newLessonProgress,
          courseProgress: newCourseProgress,
        });
      },

      submitQuizAttempt: (attempt: QuizAttempt) => {
        const state = get();
        const { courseId } = attempt;
        if (!state.courseProgress[courseId]) return;

        const updatedProgress = {
          ...state.courseProgress[courseId],
          quizScores: [...state.courseProgress[courseId].quizScores, attempt],
          lastAccessedAt: new Date().toISOString(),
        };

        const newCourseProgress = {
          ...state.courseProgress,
          [courseId]: updatedProgress,
        };
        set({ courseProgress: newCourseProgress });

        // Check if eligible for certificate
        const course = state.courses.find((c) => c.id === courseId);
        if (course?.requiresCertification && course.certificationCriteria) {
          const { minimumScore, requiredLessons } =
            course.certificationCriteria;
          const completedLessons = updatedProgress.completedLessons;
          const avgScore =
            updatedProgress.quizScores.reduce((sum, q) => sum + q.score, 0) /
            updatedProgress.quizScores.length;

          if (completedLessons >= requiredLessons && avgScore >= minimumScore) {
            get().generateCertificate(courseId);
          }
        }
      },

      generateCertificate: (courseId: string) => {
        const state = get();
        const course = state.courses.find((c) => c.id === courseId);
        if (!course || state.courseProgress[courseId]?.certificateEarned)
          return;

        const certificate: Certificate = {
          id: `cert-${courseId}-${Date.now()}`,
          courseId,
          userId: "current-user",
          userName: "Utilisateur",
          issuedAt: new Date().toISOString(),
          verificationCode: generateVerificationCode(),
          onSiteTrainingCompleted: false,
        };

        const newCertificates = [...state.certificates, certificate];

        // Update course progress
        const updatedProgress = {
          ...state.courseProgress[courseId],
          certificateEarned: true,
          certificateId: certificate.id,
        };
        const newCourseProgress = {
          ...state.courseProgress,
          [courseId]: updatedProgress,
        };

        set({
          certificates: newCertificates,
          courseProgress: newCourseProgress,
        });
      },

      addBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => {
        const newBookmark: Bookmark = {
          ...bookmark,
          id: `bookmark-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          bookmarks: [...state.bookmarks, newBookmark],
        }));
      },

      removeBookmark: (bookmarkId: string) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
        }));
      },

      addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
        const newNote: Note = {
          ...note,
          id: `note-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          notes: [...state.notes, newNote],
        }));
      },

      updateNote: (noteId: string, content: string) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId
              ? { ...n, content, updatedAt: new Date().toISOString() }
              : n,
          ),
        }));
      },

      deleteNote: (noteId: string) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== noteId),
        }));
      },

      downloadLesson: async (lessonId: string, courseId: string) => {
        console.log(`Downloading lesson ${lessonId} from course ${courseId}`);
      },

      getCourseById: (courseId: string) => {
        return get().courses.find((c) => c.id === courseId);
      },

      getLessonById: (courseId: string, lessonId: string) => {
        const course = get().getCourseById(courseId);
        if (!course) return undefined;

        for (const module of course.modules) {
          const lesson = module.lessons.find((l) => l.id === lessonId);
          if (lesson) return lesson;
        }
        return undefined;
      },
    }),
    {
      name: "@ags_training_storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        enrolledCourses: state.enrolledCourses,
        courseProgress: state.courseProgress,
        lessonProgress: state.lessonProgress,
        bookmarks: state.bookmarks,
        notes: state.notes,
        certificates: state.certificates,
      }),
    },
  ),
);
