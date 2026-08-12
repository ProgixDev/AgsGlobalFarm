import React, { useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import { PointAnnotation } from "@rnmapbox/maps";
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryIconSet,
} from "@/data/incident-categories";
import IncidentCategoryIcon from "@/components/map/IncidentCategoryIcon";
import { colors } from "@/theme/colors";

interface MarkerDatum {
  incident: IncidentReport;
  size: number;
  iconSize: number;
  color: string;
  icon: ReturnType<typeof getCategoryIcon>;
  iconSet: ReturnType<typeof getCategoryIconSet>;
}

interface IncidentMarkerProps {
  data: MarkerDatum;
  isSelected: boolean;
  onPress: (incident: IncidentReport) => void;
}

function IncidentMarker({ data, isSelected, onPress }: IncidentMarkerProps) {
  const ref = useRef<PointAnnotation>(null);
  const { incident, size, iconSize, color, icon, iconSet } = data;

  useEffect(() => {
    const id = setTimeout(() => {
      // Re-snapshot the annotation so MaterialCommunityIcons / Ionicons glyphs
      // render correctly even if the icon font loads after the initial mount.
      // Without this, the marker captures a blank glyph (solid color dot).
      ref.current?.refresh?.();
    }, 100);
    return () => clearTimeout(id);
  }, [icon, iconSet, isSelected]);

  return (
    <PointAnnotation
      ref={ref}
      key={`${incident.id}-${iconSet}-${icon}`}
      id={`incident-marker-${incident.id}-${iconSet}`}
      coordinate={[incident.coordinates.longitude, incident.coordinates.latitude]}
      onSelected={() => onPress(incident)}
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
          borderColor: isSelected ? colors.white : "rgba(255,255,255,0.5)",
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3,
          elevation: 5,
        }}
      >
        <IncidentCategoryIcon
          icon={icon}
          iconSet={iconSet}
          size={iconSize}
          color={colors.white}
        />
      </View>
    </PointAnnotation>
  );
}

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
  const markerData: MarkerDatum[] = useMemo(
    () =>
      incidents.map((incident) => ({
        incident,
        size: SEVERITY_SIZE[incident.severity],
        iconSize: SEVERITY_ICON_SIZE[incident.severity],
        color: getCategoryColor(incident.category),
        icon: getCategoryIcon(incident.category),
        iconSet: getCategoryIconSet(incident.category),
      })),
    [incidents],
  );

  return (
    <>
      {markerData.map((data) => (
        <IncidentMarker
          key={data.incident.id}
          data={data}
          isSelected={selectedIncidentId === data.incident.id}
          onPress={onMarkerPress}
        />
      ))}
    </>
  );
}
