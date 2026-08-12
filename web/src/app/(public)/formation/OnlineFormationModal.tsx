"use client";

import {
  Clock,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import type { OnlineFormation } from "@/types";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface OnlineFormationModalProps {
  program: OnlineFormation;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (program: OnlineFormation) => void;
}

export default function OnlineFormationModal({
  program,
  isOpen,
  onClose,
  onEnroll,
}: OnlineFormationModalProps) {
  const [isProgramExpanded, setIsProgramExpanded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleEnroll = () => {
    onEnroll(program);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header with close button */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {program.title}
              </h2>
              <p className="text-gray-600 mt-2">{program.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Formation Image */}
          <div className="mb-6">
            <div className="relative w-full h-64 rounded-xl overflow-hidden">
              <Image
                src={program.image}
                alt={program.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Badge Section */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
              EN LIGNE
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
              {program.level}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
              {program.category}
            </span>
          </div>

          {/* Program Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 mb-6">
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-green-200">
              <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Durée
              </p>
              <p className="font-bold text-gray-900 text-base">
                {program.duration || "3 mois"}
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-green-200">
              <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Sections
              </p>
              <p className="font-bold text-gray-900 text-base">
                {program.stats?.totalSections || 0}
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-green-200">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Participants
              </p>
              <p className="font-bold text-gray-900 text-base">Illimité</p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-green-200">
              <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Accès
              </p>
              <p className="font-bold text-green-600 text-base">Gratuit</p>
            </div>
          </div>

          {/* Program Structure */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Structure de la Formation
            </h3>
            <p className="text-gray-600 mb-3 text-sm">
              Cette formation comprend {program.stats?.totalSections || 0}{" "}
              sections pour un total de {program.stats?.totalLessons || 0}{" "}
              leçons.
            </p>

            <div className="space-y-3">
              {program.sections?.map((section) => (
                <div key={section.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm mb-1">
                          {section.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {section.lessons.length} leçon
                          {section.lessons.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show Program Details Button */}
            {program.sections && program.sections.length > 0 && (
              <button
                onClick={() => setIsProgramExpanded(!isProgramExpanded)}
                className="w-full mt-4 py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isProgramExpanded ? (
                  <>
                    Masquer les détails
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Voir le contenu détaillé
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {/* Expanded Program Details */}
            <AnimatePresence>
              {isProgramExpanded && program.sections && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3 overflow-hidden"
                >
                  {program.sections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <div className="bg-gray-100 p-3 border-b border-gray-200">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {section.title}
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                          >
                            <Play className="w-4 h-4 text-green-600 shrink-0" />
                            <span className="text-sm text-gray-700">
                              {lesson.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              Fermer
            </button>
            {!program.owned && (
              <button
                onClick={handleEnroll}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                Commencer la formation
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {program.owned && (
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
              >
                Déjà inscrit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
