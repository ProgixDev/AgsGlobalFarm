import type { ComponentProps } from "react";
import type { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

export type IncidentIconSet = "ionicons" | "material-community";

export type IncidentIconName =
  | ComponentProps<typeof Ionicons>["name"]
  | ComponentProps<typeof MaterialCommunityIcons>["name"];

export interface IncidentCategoryConfig {
  id: IncidentCategory;
  label: string;
  icon: IncidentIconName;
  iconSet: IncidentIconSet;
  color: string;
  description: string;
}

export const incidentCategories: IncidentCategoryConfig[] = [
  {
    id: "crop_disease",
    label: "Maladie des cultures",
    icon: "virus-outline",
    iconSet: "material-community",
    color: colors.danger,
    description:
      "Maladies fongiques, bactériennes ou virales affectant les cultures",
  },
  {
    id: "pests",
    label: "Parasites & Ravageurs",
    icon: "bug",
    iconSet: "material-community",
    color: colors.warning,
    description:
      "Insectes nuisibles, rongeurs et autres ravageurs des cultures",
  },
  {
    id: "fire",
    label: "Incendie",
    icon: "flame",
    iconSet: "ionicons",
    color: colors.dangerDark,
    description: "Feux de brousse ou incendies affectant les zones agricoles",
  },
  {
    id: "flood",
    label: "Inondation",
    icon: "water",
    iconSet: "ionicons",
    color: colors.info,
    description: "Inondations et montée des eaux dans les zones cultivées",
  },
  {
    id: "drought",
    label: "Sécheresse",
    icon: "sunny",
    iconSet: "ionicons",
    color: colors.caution,
    description: "Périodes de sécheresse prolongée affectant les récoltes",
  },
  {
    id: "locusts",
    label: "Invasion acridienne",
    icon: "bee",
    iconSet: "material-community",
    color: colors.purple,
    description: "Essaims de criquets et sauteriaux dévastant les cultures",
  },
  {
    id: "storm",
    label: "Tempête / Vent violent",
    icon: "thunderstorm",
    iconSet: "ionicons",
    color: colors.indigo,
    description:
      "Tempêtes, vents violents et phénomènes météorologiques extrêmes",
  },
  {
    id: "other",
    label: "Autre",
    icon: "alert-circle",
    iconSet: "ionicons",
    color: colors.muted,
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

export function getCategoryIcon(id: IncidentCategory): IncidentIconName {
  return getCategoryConfig(id).icon;
}

export function getCategoryIconSet(id: IncidentCategory): IncidentIconSet {
  return getCategoryConfig(id).iconSet;
}

export function getCategoryLabel(id: IncidentCategory): string {
  return getCategoryConfig(id).label;
}
