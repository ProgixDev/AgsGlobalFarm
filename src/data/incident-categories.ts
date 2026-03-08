import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export interface IncidentCategoryConfig {
  id: IncidentCategory;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  description: string;
}

export const incidentCategories: IncidentCategoryConfig[] = [
  {
    id: "crop_disease",
    label: "Maladie des cultures",
    icon: "bug",
    color: "#ef4444",
    description:
      "Maladies fongiques, bactériennes ou virales affectant les cultures",
  },
  {
    id: "pests",
    label: "Parasites & Ravageurs",
    icon: "warning",
    color: "#f97316",
    description:
      "Insectes nuisibles, rongeurs et autres ravageurs des cultures",
  },
  {
    id: "fire",
    label: "Incendie",
    icon: "flame",
    color: "#dc2626",
    description: "Feux de brousse ou incendies affectant les zones agricoles",
  },
  {
    id: "flood",
    label: "Inondation",
    icon: "water",
    color: "#3b82f6",
    description: "Inondations et montée des eaux dans les zones cultivées",
  },
  {
    id: "drought",
    label: "Sécheresse",
    icon: "sunny",
    color: "#eab308",
    description: "Périodes de sécheresse prolongée affectant les récoltes",
  },
  {
    id: "locusts",
    label: "Invasion acridienne",
    icon: "cellular",
    color: "#a855f7",
    description: "Essaims de criquets et sauteriaux dévastant les cultures",
  },
  {
    id: "storm",
    label: "Tempête / Vent violent",
    icon: "thunderstorm",
    color: "#6366f1",
    description:
      "Tempêtes, vents violents et phénomènes météorologiques extrêmes",
  },
  {
    id: "other",
    label: "Autre",
    icon: "alert-circle",
    color: "#6b7280",
    description: "Autres incidents agricoles non classifiés",
  },
];

export function getCategoryConfig(
  id: IncidentCategory,
): IncidentCategoryConfig {
  return (
    incidentCategories.find((c) => c.id === id) ??
    incidentCategories[incidentCategories.length - 1]
  );
}

export function getCategoryColor(id: IncidentCategory): string {
  return getCategoryConfig(id).color;
}

export function getCategoryIcon(
  id: IncidentCategory,
): ComponentProps<typeof Ionicons>["name"] {
  return getCategoryConfig(id).icon;
}

export function getCategoryLabel(id: IncidentCategory): string {
  return getCategoryConfig(id).label;
}
