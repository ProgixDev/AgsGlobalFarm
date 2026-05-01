import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type {
  IncidentIconName,
  IncidentIconSet,
} from "@/data/incident-categories";

interface Props {
  icon: IncidentIconName;
  iconSet: IncidentIconSet;
  size: number;
  color: string;
}

export default function IncidentCategoryIcon({
  icon,
  iconSet,
  size,
  color,
}: Props) {
  if (iconSet === "material-community") {
    return (
      <MaterialCommunityIcons
        name={icon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
        size={size}
        color={color}
      />
    );
  }
  return (
    <Ionicons
      name={icon as React.ComponentProps<typeof Ionicons>["name"]}
      size={size}
      color={color}
    />
  );
}
