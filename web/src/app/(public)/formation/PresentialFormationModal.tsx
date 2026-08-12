"use client";

import {
  Clock,
  MapPin,
  Users,
  Award,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import type { PresentialFormation } from "@/types";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PresentialFormationModalProps {
  program: PresentialFormation;
  isOpen: boolean;
  selectedSessionId: number | null;
  onSessionSelect: (sessionId: number) => void;
  onClose: () => void;
  onEnroll: (program: PresentialFormation) => void;
}

export default function PresentialFormationModal({
  program,
  isOpen,
  selectedSessionId,
  onSessionSelect,
  onClose,
  onEnroll,
}: PresentialFormationModalProps) {
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

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const openSessions = program.sessions.filter((s) => s.status === "open");
  const hasOpenSessions = openSessions.length > 0;

  const handleEnroll = () => {
    if (!hasOpenSessions) {
      return;
    }
    if (openSessions.length > 1 && !selectedSessionId) {
      alert("Veuillez sélectionner une session.");
      return;
    }
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
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
              PRÉSENTIEL
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
              {program.level}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
              {program.category}
            </span>
          </div>

          {/* Program Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-linear-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-100 mb-6">
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-blue-200">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Sessions
              </p>
              <p className="font-bold text-gray-900 text-base leading-tight">
                {openSessions.length} session
                {openSessions.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-blue-200">
              <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Lieu
              </p>
              <p className="font-bold text-gray-900 text-base leading-tight">
                {program.address}
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-blue-200">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Durée
              </p>
              <p className="font-bold text-gray-900 text-base">
                {program.durationDays} jours
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-blue-200">
              <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Accès
              </p>
              <p className="font-bold text-blue-600 text-base">Gratuit</p>
            </div>
          </div>

          {/* Sessions Selection */}
          {hasOpenSessions && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Sélectionnez une session
              </h3>
              <div className="space-y-3">
                {openSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSessionSelect(session.id)}
                    disabled={session.owned}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      session.owned
                        ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-75"
                        : selectedSessionId === session.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            Du {formatDate(session.startDate)} au{" "}
                            {formatDate(session.endDate)}
                          </span>
                          {session.owned && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                              Inscrit
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {session.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-700">
                            {session.availableSpots} places
                          </span>
                        </div>
                        {selectedSessionId === session.id && !session.owned && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Program Structure */}
          {program.program && program.program.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">
                  Programme de la formation
                </h3>
                <button
                  onClick={() => setIsProgramExpanded(!isProgramExpanded)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  {isProgramExpanded ? (
                    <>
                      Masquer <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Voir détails <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-gray-600 mb-3 text-sm">
                Formation intensive de {program.durationDays} jours avec un
                programme complet.
              </p>

              <AnimatePresence>
                {isProgramExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {program.program.map((day) => (
                      <div
                        key={day.name}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <div className="bg-blue-50 p-3 border-b border-blue-100">
                          <h4 className="font-bold text-gray-900 text-sm">
                            {day.name}
                          </h4>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {day.timeFrames.map((timeFrame, idx) => (
                            <div
                              key={idx}
                              className="p-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="shrink-0 text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                  {timeFrame.from} - {timeFrame.to}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {timeFrame.name}
                                  </p>
                                  {timeFrame.description && (
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      {timeFrame.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              Fermer
            </button>
            {hasOpenSessions ? (
              <button
                onClick={handleEnroll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                Réserver ma place
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
              >
                Aucune Session Ouverte
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
