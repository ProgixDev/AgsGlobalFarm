import {
  getPublicOnlineFormations,
  getPublicPresentialFormations,
} from "@/lib/db";
import FormationClientPage from "./FormationClientPage";

const categories = ["Tout"];

const benefits = [
  {
    icon: "GraduationCap",
    title: "Formateurs Experts",
    description:
      "Apprenez auprès de professionnels expérimentés dans le domaine agricole.",
  },
  {
    icon: "Award",
    title: "Attestation de fin de formation",
    description: "Obtenez une attestation qui renforce votre crédibilité.",
  },
  {
    icon: "Users",
    title: "Apprentissage Pratique",
    description:
      "Des ateliers pratiques sur le terrain pour une expérience concrète et applicable.",
  },
  {
    icon: "Target",
    title: "Suivi Personnalisé",
    description:
      "Accompagnement individuel pour garantir votre réussite et progression.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Inscription",
    description:
      "Choisissez votre formation et remplissez le formulaire d'inscription en ligne.",
  },
  {
    number: "02",
    title: "Validation",
    description:
      "Notre équipe valide votre inscription et vous contacte pour confirmer les détails.",
  },
  {
    number: "03",
    title: "Formation",
    description:
      "Participez aux sessions théoriques et pratiques avec nos formateurs experts.",
  },
  {
    number: "04",
    title: "Certification",
    description: "Recevez votre attestation à la fin de la formation.",
  },
];

export default async function FormationPage() {
  // Fetch formations from MongoDB and convert to plain objects
  const [onlineFormations, presentielFormations] = await Promise.all([
    getPublicOnlineFormations(),
    getPublicPresentialFormations(),
  ]);

  const serializedOnline = JSON.parse(JSON.stringify(onlineFormations));
  const serializedPresential = JSON.parse(JSON.stringify(presentielFormations));

  return (
    <FormationClientPage
      onlineFormations={serializedOnline}
      presentielFormations={serializedPresential}
      categories={categories}
      benefits={benefits}
      processSteps={processSteps}
    />
  );
}
