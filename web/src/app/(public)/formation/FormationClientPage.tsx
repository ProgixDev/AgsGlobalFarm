"use client";

import { useState, useLayoutEffect, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Users,
  Clock,
  Award,
  BookOpen,
  Target,
  Phone,
  ArrowRight,
  Leaf,
  MapPin,
  Calendar,
  X,
  Play,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { OnlineFormation, PresentialFormation } from "@/types";
import OnlineFormationModal from "./OnlineFormationModal";
import PresentialFormationModal from "./PresentialFormationModal";

const iconMap = {
  GraduationCap,
  Users,
  Clock,
  Award,
  BookOpen,
  Target,
  Phone,
  ArrowRight,
  Leaf,
  MapPin,
  Calendar,
  X,
  Play,
  CheckCircle,
};

type Benefit = {
  icon: string;
  title: string;
  description: string;
};

type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

interface FormationClientPageProps {
  onlineFormations: (OnlineFormation & { owned?: boolean })[];
  presentielFormations: PresentialFormation[];
  categories: string[];
  benefits: Benefit[];
  processSteps: ProcessStep[];
}

export default function FormationClientPage({
  onlineFormations,
  presentielFormations,
  categories,
  benefits,
  processSteps,
}: FormationClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [onlineModalProgram, setOnlineModalProgram] =
    useState<OnlineFormation | null>(null);
  const [presentialModalProgram, setPresentialModalProgram] =
    useState<PresentialFormation | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );
  const [backgroundColor, setBackgroundColor] = useState("#faf9f6");

  // Get the actual background color from the body element
  useLayoutEffect(() => {
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBackgroundColor(bodyBg);
  }, []);

  // Handle URL parameters for automatic modal opening
  useEffect(() => {
    const modal = searchParams.get("modal");
    const formationId = searchParams.get("id");
    const sessionId = searchParams.get("sessionId");

    if (modal === "reserve" && formationId) {
      const onlineFormation = onlineFormations.find(
        (f) => f._id === formationId,
      );
      const presentialFormation = presentielFormations.find(
        (f) => f._id === formationId,
      );

      if (onlineFormation) {
        //eslint-disable-next-line
        setOnlineModalProgram(onlineFormation);
      } else if (presentialFormation) {
        setPresentialModalProgram(presentialFormation);

        // Handle session selection for presentiel formations
        if (sessionId) {
          const session = presentialFormation.sessions.find(
            (s) => s.id === parseInt(sessionId),
          );
          if (session && session.status === "open") {
            setSelectedSessionId(session.id);
          } else {
            // Auto-select first open session if sessionId is invalid
            const openSessions = presentialFormation.sessions.filter(
              (s) => s.status === "open",
            );
            if (openSessions && openSessions.length === 1) {
              setSelectedSessionId(openSessions[0].id);
            }
          }
        } else {
          // Auto-select first open session if no sessionId provided
          const openSessions = presentialFormation.sessions.filter(
            (s) => s.status === "open",
          );
          if (openSessions && openSessions.length === 1) {
            setSelectedSessionId(openSessions[0].id);
          }
        }

        // Clean up URL parameters after opening modal
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("modal");
        newUrl.searchParams.delete("id");
        newUrl.searchParams.delete("sessionId");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, [searchParams, onlineFormations, presentielFormations]);

  const handleEnroll = async (
    program: OnlineFormation | PresentialFormation,
  ) => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (
      program.type === "online" &&
      (program as OnlineFormation & { owned?: boolean }).owned
    ) {
      router.push("/mes-formations");
      return;
    }
    let targetSessionId: number | undefined;
    if (program.type === "presentiel") {
      const openSessions = (program as PresentialFormation).sessions.filter(
        (session) => session.status === "open",
      );
      if (!openSessions || openSessions.length === 0) {
        alert("Aucune session ouverte pour cette formation.");
        return;
      }
      if (openSessions.length > 1 && !selectedSessionId) {
        alert("Veuillez sélectionner une session.");
        return;
      }
      targetSessionId = selectedSessionId ?? openSessions[0].id;
    }

    try {
      const res = await fetch("/api/formations/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formationId: program._id,
          sessionId: targetSessionId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Erreur lors de l'inscription");
        return;
      }
      router.push("/mes-formations");
      router.refresh();
    } catch (err) {
      console.error("Enrollment failed", err);
      alert("Erreur lors de l'inscription");
    }
  };

  const openOnlineModal = (program: OnlineFormation) => {
    setOnlineModalProgram(program);
  };

  const openPresentialModal = (program: PresentialFormation) => {
    setPresentialModalProgram(program);
    // Auto-select first open session if only one available
    const openSessions = program.sessions.filter((s) => s.status === "open");
    if (openSessions && openSessions.length === 1) {
      setSelectedSessionId(openSessions[0].id);
    } else {
      setSelectedSessionId(null);
    }
  };

  const closeOnlineModal = () => {
    setOnlineModalProgram(null);
  };

  const closePresentialModal = () => {
    setPresentialModalProgram(null);
    setSelectedSessionId(null);
  };

  // Filter programs separately
  const filteredOnlineFormations = onlineFormations.filter((program) => {
    if (activeCategory === "Tout") return true;
    if (activeCategory === "Présentiel") return false;
    if (activeCategory === "En ligne") return true;
    return program.category === activeCategory;
  });

  const filteredPresentialFormations = presentielFormations.filter(
    (program) => {
      if (activeCategory === "Tout") return true;
      if (activeCategory === "Présentiel") return true;
      if (activeCategory === "En ligne") return false;
      return program.category === activeCategory;
    },
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-32 overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-brand) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="inline-block py-2 px-4 rounded text-white text-sm font-medium mb-4 border"
                style={{
                  backgroundColor: "var(--color-secondary-brand)",
                  borderColor: "var(--color-secondary-brand)",
                }}
              >
                Investissez dans votre avenir
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Formations Agricoles
              </h1>
              <p className="text-white/90 text-lg mb-10 max-w-3xl mx-auto">
                Développez vos compétences avec nos formations pratiques animées
                par des experts. Trouvez la formation qui vous convient.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  style={{
                    backgroundColor: "var(--color-cta)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-cta-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-cta)";
                  }}
                  onClick={() => {
                    document
                      .getElementById("programs-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Voir les Formations
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-base font-semibold"
                  onClick={() => router.push("/contact")}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Nous Contacter
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Wave Bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-[calc(100%+1.3px)] h-15"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill={backgroundColor}
            ></path>
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 relative">
        {/* Gradient overlay at the top to blend */}
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none -mt-1"
          style={{
            background: `linear-gradient(to bottom, ${backgroundColor}, transparent)`,
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir Nos Formations ?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Des formations de qualité conçues pour répondre aux besoins réels
              des agriculteurs et entrepreneurs agricoles.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent =
                iconMap[benefit.icon as keyof typeof iconMap] || GraduationCap;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all group"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: "var(--color-brand)" }}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs-section" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos Programmes de Formation
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Découvrez nos formations complètes adaptées à tous les niveaux, du
              débutant à l&apos;expert.
            </p>
          </motion.div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      isActive
                        ? "bg-orange-500 text-white shadow-lg scale-105"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}

          {/* Online Formations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredOnlineFormations.map((program, index) => {
              const Icon = iconMap[program.icon as keyof typeof iconMap];
              return (
                <motion.div
                  key={program._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col"
                  onClick={() => openOnlineModal(program)}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={program.image}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Gratuit
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      {Icon && <Icon className="w-5 h-5 text-green-600" />}
                      <span className="text-green-600 text-sm font-semibold">
                        {program.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {program.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{program.duration || "3 mois"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>{program.level}</span>
                      </div>
                      {program.stats && (
                        <>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span>{program.stats.totalSections} sections</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Play className="w-4 h-4" />
                            <span>{program.stats.totalLessons} leçons</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 shrink-0 border-green-600 text-green-600 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          openOnlineModal(program);
                        }}
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 shrink-0 ${
                          program.owned
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white`}
                        disabled={program.owned}
                        onClick={(e) => {
                          e.stopPropagation();
                          openOnlineModal(program);
                        }}
                      >
                        {program.owned ? "Déjà inscrit" : "S'inscrire"}
                        {program.owned ? null : (
                          <ArrowRight className="w-4 h-4 ml-1" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filteredPresentialFormations.map((program, index) => {
              const Icon = iconMap[program.icon as keyof typeof iconMap];
              return (
                <motion.div
                  key={program._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col"
                  onClick={() => openPresentialModal(program)}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={program.image}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Gratuit
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      {Icon && <Icon className="w-5 h-5 text-blue-600" />}
                      <span className="text-blue-600 text-sm font-semibold">
                        {program.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {program.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{program.durationDays} jours</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>{program.level}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{program.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {
                            program.sessions.filter((s) => s.status === "open")
                              .length
                          }{" "}
                          session(s)
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 shrink-0 border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPresentialModal(program);
                        }}
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 shrink-0 ${
                          program.owned
                            ? "bg-gray-400 cursor-not-allowed"
                            : !program.sessions.some(
                                  (session) => session.status === "open",
                                )
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                        disabled={
                          program.owned ||
                          !program.sessions.some(
                            (session) => session.status === "open",
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          openPresentialModal(program);
                        }}
                      >
                        {program.owned
                          ? "Déjà inscrit"
                          : !program.sessions.some(
                                (session) => session.status === "open",
                              )
                            ? "Fermé"
                            : "S'inscrire"}
                        {program.owned ||
                        !program.sessions.some(
                          (session) => session.status === "open",
                        ) ? null : (
                          <ArrowRight className="w-4 h-4 ml-1" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Presential Formations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8"></div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment Ça Marche ?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Un processus simple et transparent pour démarrer votre parcours de
              formation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white"
                    style={{ backgroundColor: "var(--color-brand)" }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>

                {/* Connector Arrow */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[65%] w-[80%] h-0.5 bg-gray-200">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Online Formation Modal */}
      {onlineModalProgram && (
        <OnlineFormationModal
          program={onlineModalProgram}
          isOpen={true}
          onClose={closeOnlineModal}
          onEnroll={handleEnroll}
        />
      )}

      {/* Presential Formation Modal */}
      {presentialModalProgram && (
        <PresentialFormationModal
          program={presentialModalProgram}
          isOpen={true}
          selectedSessionId={selectedSessionId}
          onSessionSelect={setSelectedSessionId}
          onClose={closePresentialModal}
          onEnroll={handleEnroll}
        />
      )}
    </div>
  );
}
