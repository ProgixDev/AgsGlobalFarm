"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type {
  OnlineFormation,
  PresentialFormation,
  FormationSession,
} from "@/types";

interface EventsSectionProps {
  presentielFormations: PresentialFormation[];
  onlineFormations: OnlineFormation[];
}

export default function EventsSection({
  presentielFormations,
  onlineFormations,
}: EventsSectionProps) {
  const router = useRouter();

  // Process presentiel formations - filter only formations with open/ongoing sessions
  const presentielItems = presentielFormations
    .map((formation) => {
      const availableSessions = formation.sessions.filter(
        (session) => session.status === "open" || session.status === "ongoing",
      );

      if (availableSessions.length === 0) return null;

      return {
        formation: { ...formation, type: "presentiel" as const },
        sessions: availableSessions,
      };
    })
    .filter(Boolean) as {
    formation: PresentialFormation;
    sessions: FormationSession[];
  }[];

  // Convert online formations to carousel items (they don't have sessions)
  const onlineItems = onlineFormations.map((formation) => ({
    formation: { ...formation, type: "online" as const },
    sessions: [] as FormationSession[],
  }));

  // Combine all items for carousel
  const allSessions = [...presentielItems, ...onlineItems];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || allSessions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSessions.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, allSessions.length]);

  const handleReservePlace = (formationId: string, sessionId?: number) => {
    const params = new URLSearchParams({
      modal: "reserve",
      id: formationId,
    });

    // Include sessionId for presentiel formations
    if (sessionId) {
      params.append("sessionId", sessionId.toString());
    }

    router.push(`/formation?${params.toString()}`);
  };

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(
      (prev) => (prev - 1 + allSessions.length) % allSessions.length,
    );
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % allSessions.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = start.toLocaleDateString("fr-FR", { month: "short" });
    return { day: `${startDay}-${endDay}`, month };
  };

  if (allSessions.length === 0) {
    return null;
  }

  const currentSession = allSessions[currentIndex];

  return (
    <section className="w-full py-8 sm:py-12 md:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6 sm:mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-xs sm:text-sm md:text-base mb-4 sm:mb-5 md:mb-6"
            style={{
              backgroundColor: "var(--color-secondary-brand, #f59e0b)20",
              color: "var(--color-secondary-brand, #f59e0b)",
            }}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            Prochains Événements
          </div>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
            style={{ color: "var(--color-brand, #16a34a)" }}
          >
            Ne manquez rien
          </h2>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="relative h-112 sm:h-125 md:h-140 lg:h-150 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={currentSession.formation.image}
                  alt={currentSession.formation.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end text-white">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 flex-wrap">
                    <div
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-md"
                      style={{
                        backgroundColor:
                          currentSession.formation.type === "online"
                            ? "var(--color-brand, #16a34a)"
                            : "var(--color-secondary-brand, #f59e0b)",
                      }}
                    >
                      {currentSession.formation.type === "online"
                        ? "FORMATION EN LIGNE"
                        : "FORMATION PRÉSENTIEL"}
                    </div>
                    {currentSession.sessions.length > 0 && (
                      <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-white/20 backdrop-blur-sm">
                        {currentSession.sessions.length} session
                        {currentSession.sessions.length > 1 ? "s" : ""}{" "}
                        disponible
                        {currentSession.sessions.length > 1 ? "s" : ""}
                      </div>
                    )}
                    {currentSession.formation.type === "online" && (
                      <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-white/20 backdrop-blur-sm">
                        DISPONIBLE MAINTENANT
                      </div>
                    )}
                    <div
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-md"
                      style={{
                        backgroundColor:
                          "var(--color-secondary-brand, #f59e0b)20",
                        color: "var(--color-secondary-brand, #f59e0b)",
                      }}
                    >
                      {currentSession.formation.level.toUpperCase()}
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">
                    {currentSession.formation.title}
                  </h3>
                  <p className="text-white/90 mb-4 sm:mb-5 md:mb-6 text-[11px] sm:text-xs md:text-sm leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3">
                    {currentSession.formation.description}
                  </p>

                  {currentSession.sessions.length > 0 ? (
                    <div className="mb-4 sm:mb-5 md:mb-6 space-y-3">
                      <div className="text-[11px] sm:text-xs font-semibold text-white/90 mb-2">
                        Sessions disponibles:
                      </div>
                      <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {currentSession.sessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3"
                          >
                            <div className="flex flex-wrap gap-2 sm:gap-3 flex-1">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="text-[11px] sm:text-xs font-semibold">
                                  {
                                    formatDateRange(
                                      session.startDate,
                                      session.endDate,
                                    ).day
                                  }{" "}
                                  {
                                    formatDateRange(
                                      session.startDate,
                                      session.endDate,
                                    ).month
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="text-[11px] sm:text-xs">
                                  {session.location}
                                </span>
                              </div>
                              <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                                {session.availableSpots} places
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleReservePlace(
                                  currentSession.formation._id!,
                                  session.id,
                                )
                              }
                              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold text-white whitespace-nowrap"
                              style={{
                                backgroundColor: "var(--color-brand, #16a34a)",
                              }}
                            >
                              Réserver
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-[11px] sm:text-xs">
                          Accès 3 mois
                        </span>
                      </div>
                    </div>
                  )}

                  {currentSession.formation.type === "online" && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleReservePlace(currentSession.formation._id!)
                        }
                        className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-xs sm:text-sm text-white shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: "var(--color-brand, #16a34a)",
                        }}
                      >
                        Acheter maintenant
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.button>

                      <span className="text-white/80 text-xs sm:text-sm font-semibold">
                        {currentSession.formation.price.toLocaleString("fr-FR")}{" "}
                        FCFA
                      </span>
                    </div>
                  )}
                  {currentSession.sessions.length > 0 && (
                    <div className="text-white/80 text-xs sm:text-sm font-semibold">
                      {currentSession.formation.price.toLocaleString("fr-FR")}{" "}
                      FCFA
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {allSessions.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all flex items-center justify-center text-white group"
                  aria-label="Previous formation"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all flex items-center justify-center text-white group"
                  aria-label="Next formation"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}
          </div>

          {/* Carousel Dots */}
          {allSessions.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 sm:mt-5 md:mt-6">
              {allSessions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-6 sm:w-8 bg-(--color-brand,#16a34a)"
                      : "w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to formation ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
