"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Clock,
  BookOpen,
  Award,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  FormationSession,
  OnlineFormation,
  PresentialFormation,
} from "@/types";

// ─── Access Badge ────────────────────────────────────────────────────────────

function AccessBadge({ accessExpiresAt }: { accessExpiresAt?: Date }) {
  if (!accessExpiresAt) return null;

  const now = new Date();
  const expires = new Date(accessExpiresAt);
  const msLeft = expires.getTime() - now.getTime();

  if (msLeft <= 0) return null;

  const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor(
    (msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  let label: string;
  let colorClass: string;

  if (daysLeft >= 30) {
    const monthsLeft = Math.floor(daysLeft / 30);
    label = `Accès valide encore ${monthsLeft} mois`;
    colorClass = "bg-green-50 text-green-700 border-green-200";
  } else if (daysLeft >= 7) {
    label = `Accès valide encore ${daysLeft} jours`;
    colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
  } else if (daysLeft >= 1) {
    label = `Accès valide encore ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`;
    colorClass = "bg-orange-50 text-orange-700 border-orange-200";
  } else {
    label = `Accès valide encore ${hoursLeft}h`;
    colorClass = "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}
    >
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── Online Formation Detail Modal ───────────────────────────────────────────

function OnlineDetailModal({
  formation,
  onClose,
}: {
  formation: OnlineFormation;
  onClose: () => void;
}) {
  const [isProgramExpanded, setIsProgramExpanded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {formation.title}
              </h2>
              <p className="text-gray-600 mt-2">{formation.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-4 shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
            <Image
              src={formation.image}
              alt={formation.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
              EN LIGNE
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
              {formation.level}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
              {formation.category}
            </span>
            <AccessBadge accessExpiresAt={formation.accessExpiresAt} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 mb-6">
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-green-200">
              <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Accès
              </p>
              <p className="font-bold text-gray-900 text-base">3 mois</p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-green-200">
              <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Sections
              </p>
              <p className="font-bold text-gray-900 text-base">
                {formation.stats?.totalSections ??
                  formation.sections?.length ??
                  0}
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-green-200">
              <Play className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Leçons
              </p>
              <p className="font-bold text-gray-900 text-base">
                {formation.stats?.totalLessons ??
                  formation.sections?.reduce(
                    (acc, s) => acc + s.lessons.length,
                    0,
                  ) ??
                  0}
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-green-200">
              <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Niveau
              </p>
              <p className="font-bold text-gray-900 text-base leading-tight">
                {formation.level}
              </p>
            </div>
          </div>

          {/* Programme */}
          {formation.sections && formation.sections.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Contenu de la Formation
              </h3>
              <div className="space-y-3">
                {formation.sections.map((section) => (
                  <div key={section.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
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
                ))}
              </div>

              <button
                onClick={() => setIsProgramExpanded(!isProgramExpanded)}
                className="w-full mt-4 py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isProgramExpanded ? (
                  <>
                    Masquer les détails <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Voir le contenu détaillé <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>

              <AnimatePresence>
                {isProgramExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-3 overflow-hidden"
                  >
                    {formation.sections.map((section) => (
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
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              Fermer
            </button>
            <a
              href={`/mes-formations/${formation._id}`}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              Accéder au cours
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Presential Formation Detail Modal ───────────────────────────────────────

function PresentialDetailModal({
  formation,
  session,
  onClose,
}: {
  formation: PresentialFormation;
  session: FormationSession;
  onClose: () => void;
}) {
  const [isProgramExpanded, setIsProgramExpanded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const statusLabel =
    session.status === "done"
      ? "Terminée"
      : session.status === "ongoing"
        ? "En cours"
        : "À venir";

  const statusColor =
    session.status === "done"
      ? "bg-gray-100 text-gray-700"
      : session.status === "ongoing"
        ? "bg-blue-100 text-blue-700"
        : "bg-green-100 text-green-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {formation.title}
              </h2>
              <p className="text-gray-600 mt-2">{formation.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-4 shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
            <Image
              src={formation.image}
              alt={formation.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
              PRÉSENTIEL
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
              {formation.level}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
              {formation.category}
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-linear-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-100 mb-6">
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-blue-200">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Début
              </p>
              <p className="font-bold text-gray-900 text-sm leading-tight">
                {new Date(session.startDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-blue-200">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Fin
              </p>
              <p className="font-bold text-gray-900 text-sm leading-tight">
                {new Date(session.endDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-blue-200">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Durée
              </p>
              <p className="font-bold text-gray-900 text-base">
                {formation.durationDays} jours
              </p>
            </div>
            <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-blue-200">
              <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Lieu
              </p>
              <p className="font-bold text-gray-900 text-sm leading-tight">
                {session.location}
              </p>
            </div>
          </div>

          {/* Session Details */}
          <div className="mb-6 p-4 border-2 border-blue-200 rounded-xl bg-blue-50">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Votre Session
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Dates :</span>{" "}
                {formatDate(session.startDate)} → {formatDate(session.endDate)}
              </p>
              <p>
                <span className="font-semibold">Lieu :</span> {session.location}
              </p>
              {formation.address && (
                <p>
                  <span className="font-semibold">Adresse :</span>{" "}
                  {formation.address}
                </p>
              )}
            </div>
          </div>

          {/* Programme */}
          {formation.program && formation.program.length > 0 && (
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

              <AnimatePresence>
                {isProgramExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {formation.program.map((day) => (
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

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MesFormationsClientProps {
  onlineCourses: OnlineFormation[];
  previousFormations: {
    formation: PresentialFormation;
    session: FormationSession;
  }[];
  upcomingFormations: {
    formation: PresentialFormation;
    session: FormationSession;
  }[];
}

export default function MesFormationsClient({
  onlineCourses,
  previousFormations,
  upcomingFormations,
}: MesFormationsClientProps) {
  const [selectedOnline, setSelectedOnline] = useState<OnlineFormation | null>(
    null,
  );
  const [selectedPresential, setSelectedPresential] = useState<{
    formation: PresentialFormation;
    session: FormationSession;
  } | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Mes Formations</h1>

      {/* Online Courses */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Mes Cours</h2>
        {onlineCourses.length === 0 ? (
          <p className="text-gray-600">
            Vous n&apos;avez pas encore acheté de cours.
          </p>
        ) : (
          <div className="space-y-6">
            {onlineCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedOnline(course)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="mt-2">
                        <AccessBadge accessExpiresAt={course.accessExpiresAt} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Accès
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      3 mois
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Niveau
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {course.level}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Catégorie
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {course.category}
                    </p>
                  </div>
                </div>
                <a
                  href={`/mes-formations/${course._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Accéder au cours
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Presential */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Formations à Venir</h2>
        {upcomingFormations.length === 0 ? (
          <p className="text-gray-600">Aucune formation à venir.</p>
        ) : (
          <div className="space-y-6">
            {upcomingFormations.map(({ formation, session }) => (
              <PresentialCard
                key={`${formation._id}-${session.id}`}
                formation={formation}
                session={session}
                onClick={() => setSelectedPresential({ formation, session })}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Presential */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Historique des Formations
        </h2>
        {previousFormations.length === 0 ? (
          <p className="text-gray-600">Aucune formation terminée.</p>
        ) : (
          <div className="space-y-6">
            {previousFormations.map(({ formation, session }) => (
              <PresentialCard
                key={`${formation._id}-${session.id}`}
                formation={formation}
                session={session}
                onClick={() => setSelectedPresential({ formation, session })}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {selectedOnline && (
        <OnlineDetailModal
          formation={selectedOnline}
          onClose={() => setSelectedOnline(null)}
        />
      )}
      {selectedPresential && (
        <PresentialDetailModal
          formation={selectedPresential.formation}
          session={selectedPresential.session}
          onClose={() => setSelectedPresential(null)}
        />
      )}
    </div>
  );
}

// ─── Presential Card ──────────────────────────────────────────────────────────

function PresentialCard({
  formation,
  session,
  onClick,
}: {
  formation: PresentialFormation;
  session: FormationSession;
  onClick: () => void;
}) {
  const statusLabel =
    session.status === "done"
      ? "Terminée"
      : session.status === "ongoing"
        ? "En cours"
        : "Inscriptions ouvertes";

  const statusColor =
    session.status === "done"
      ? "bg-gray-100 text-gray-800"
      : session.status === "ongoing"
        ? "bg-blue-100 text-blue-800"
        : "bg-green-100 text-green-800";

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4 flex-1">
          <Image
            src={formation.image}
            alt={formation.title}
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-lg shrink-0"
          />
          <div>
            <h3 className="text-lg font-semibold">{formation.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {formation.description}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ml-4 ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Date de début
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(session.startDate).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Date de fin
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(session.endDate).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Lieu
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {session.location}
          </p>
        </div>
      </div>
    </div>
  );
}
