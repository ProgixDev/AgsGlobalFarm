"use client";

import { useState, useCallback, useTransition } from "react";
import {
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle,
  Lock,
  Award,
} from "lucide-react";
import ReactPlayer from "react-player";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import Link from "next/link";
import type { Section, Lesson, OnlineFormation } from "@/types";
import { updateProgress } from "@/lib/db";

interface FormationContentProps {
  formation: OnlineFormation;
  formationMongoId: string;
  initialProgress: string[];
}

export default function FormationContent({
  formation,
  formationMongoId,
  initialProgress,
}: FormationContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(),
  );
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    () => new Set(initialProgress),
  );
  const [selectedLesson, setSelectedLesson] = useState<{
    sectionId: number;
    lessonId: number;
    lesson: Lesson;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleSection = useCallback((sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const isSectionComplete = useCallback(
    (section: Section) => {
      return section.lessons.every((lesson: Lesson) =>
        completedLessons.has(`${section.id}-${lesson.id}`),
      );
    },
    [completedLessons],
  );

  const canAccessSection = useCallback(
    (sectionId: number) => {
      const sections = formation.sections;
      if (!sections) return false;
      const currentIndex = sections.findIndex((s) => s.id === sectionId);
      if (currentIndex === 0) return true;
      if (currentIndex === -1) return false;
      const prevSection = sections[currentIndex - 1];
      return isSectionComplete(prevSection);
    },
    [formation.sections, isSectionComplete],
  );

  const canAccessLesson = useCallback(
    (sectionId: number, lessonId: number) => {
      const sections = formation.sections;
      if (!sections) return false;

      const section = sections.find((s) => s.id === sectionId);
      if (!section) return false;

      const lessonIndex = section.lessons.findIndex((l) => l.id === lessonId);
      if (lessonIndex === -1) return false;

      // First lesson in section is accessible if section is accessible
      if (lessonIndex === 0) return canAccessSection(sectionId);

      // Check if all previous lessons in this section are completed
      for (let i = 0; i < lessonIndex; i++) {
        const prevLesson = section.lessons[i];
        if (!completedLessons.has(`${sectionId}-${prevLesson.id}`)) {
          return false;
        }
      }

      return true;
    },
    [formation.sections, completedLessons, canAccessSection],
  );

  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      startTransition(async () => {
        const newSet = new Set(completedLessons);
        if (newSet.has(lessonId)) {
          newSet.delete(lessonId);
        } else {
          newSet.add(lessonId);
        }

        // Update in database
        const result = await updateProgress(formationMongoId, [...newSet]);

        if (result.success) {
          setCompletedLessons(newSet);
        } else {
          console.error("Failed to update progress:", result.error);
          setError(result.error || "Failed to update progress");
        }
      });
    },
    [completedLessons, formationMongoId],
  );

  const totalLessons =
    formation.sections?.reduce(
      (acc, section) => acc + section.lessons.length,
      0,
    ) || 0;
  const completedCount = completedLessons.size;
  const progressPercentage =
    totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progression: {completedCount}/{totalLessons} leçons
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {formation.sections?.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-lg shadow-sm border"
          >
            <button
              onClick={() => {
                if (canAccessSection(section.id)) {
                  toggleSection(section.id);
                }
              }}
              disabled={!canAccessSection(section.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {!canAccessSection(section.id) && (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {section.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {section.lessons.length} leçons
                </span>
                {canAccessSection(section.id) &&
                  (expandedSections.has(section.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  ))}
              </div>
            </button>

            {expandedSections.has(section.id) && (
              <div className="px-6 pb-4">
                <div className="space-y-3">
                  {section.lessons.map((lesson) => {
                    const lessonAccessible = canAccessLesson(
                      section.id,
                      lesson.id,
                    );
                    const lessonCompleted = completedLessons.has(
                      `${section.id}-${lesson.id}`,
                    );

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-colors ${
                          lessonAccessible ? "hover:bg-gray-100" : "opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              markLessonComplete(`${section.id}-${lesson.id}`)
                            }
                            disabled={
                              !lessonAccessible || !lesson.content || isPending
                            }
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              lessonCompleted
                                ? "bg-green-600 border-green-600"
                                : "border-gray-300"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {lessonCompleted && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <div>
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              {!lessonAccessible && (
                                <Lock className="w-4 h-4 text-gray-400" />
                              )}
                              {lesson.title}
                            </h4>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedLesson({
                              sectionId: section.id,
                              lessonId: lesson.id,
                              lesson,
                            });
                            setError(null);
                            setModalOpen(true);
                          }}
                          disabled={!lessonAccessible || !lesson.content}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {lessonAccessible ? (
                            <>
                              <Play className="w-4 h-4" />
                              {lessonCompleted ? "Revoir" : "Regarder"}
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Verrouillé
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {selectedLesson && (
            <>
              <DialogTitle asChild>
                <h3 className="text-lg font-semibold mb-4">
                  {selectedLesson.lesson.title}
                </h3>
              </DialogTitle>
              {error ? (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : (
                selectedLesson.lesson.content && (
                  <ReactPlayer
                    src={selectedLesson.lesson.content}
                    controls
                    onReady={() => setError(null)}
                    onError={() =>
                      setError(
                        "Erreur lors du chargement de la vidéo. Vérifiez le lien.",
                      )
                    }
                    width="100%"
                    height="auto"
                  />
                )
              )}
              <div className="mt-4 flex gap-4">
                {!completedLessons.has(
                  `${selectedLesson.sectionId}-${selectedLesson.lessonId}`,
                ) && (
                  <button
                    onClick={() =>
                      markLessonComplete(
                        `${selectedLesson.sectionId}-${selectedLesson.lessonId}`,
                      )
                    }
                    disabled={isPending}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isPending ? "Enregistrement..." : "Marquer comme terminé"}
                  </button>
                )}
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedLesson(null);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Fermer
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz & Certificate Section */}
      {progressPercentage === 100 && (
        <div className="mt-8 bg-linear-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <div className="text-center">
            <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Félicitations !
            </h3>
            <p className="text-gray-600 mb-4">
              Vous avez terminé toutes les leçons. Passez le quiz pour obtenir
              votre certificat de formation.
            </p>
            <Link
              href={`/mes-formations/${formationMongoId}/quiz`}
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Passer le quiz
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
