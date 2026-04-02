import React, { useMemo } from "react";
import { View } from "react-native";
import { PointAnnotation } from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { getCategoryColor, getCategoryIcon } from "@/data/incident-categories";
import { colors } from "@/theme/colors";

interface IncidentMarkersProps {
  incidents: IncidentReport[];
  onMarkerPress: (incident: IncidentReport) => void;
  selectedIncidentId?: string;
}

const SEVERITY_SIZE: Record<IncidentSeverity, number> = {
  low: 28,
  medium: 32,
  high: 38,
};

const SEVERITY_ICON_SIZE: Record<IncidentSeverity, number> = {
  low: 14,
  medium: 16,
  high: 20,
};

export function IncidentMarkers({
  incidents,
  onMarkerPress,
  selectedIncidentId,
}: IncidentMarkersProps) {
  const markerData = useMemo(
    () =>
      incidents.map((incident) => ({
        incident,
        size: SEVERITY_SIZE[incident.severity],
        iconSize: SEVERITY_ICON_SIZE[incident.severity],
        color: getCategoryColor(incident.category),
        icon: getCategoryIcon(incident.category),
      })),
    [incidents],
  );

  return (
    <>
      {markerData.map(({ incident, size, iconSize, color, icon }) => {
        const isSelected = selectedIncidentId === incident.id;

        return (
          <PointAnnotation
            key={incident.id}
            id={`incident-marker-${incident.id}`}
            coordinate={[
              incident.coordinates.longitude,
              incident.coordinates.latitude,
            ]}
            onSelected={() => onMarkerPress(incident)}
          >
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: isSelected ? 3 : 1.5,
                borderColor: isSelected
                  ? colors.white
                  : "rgba(255,255,255,0.5)",
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <Ionicons name={icon} size={iconSize} color={colors.white} />
            </View>
          </PointAnnotation>
        );
      })}
    </>
  );
}
