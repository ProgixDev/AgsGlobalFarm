import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useMapStore } from "@/stores/mapStore";
import { useUserStore } from "@/stores/userStore";
import {
  incidentCategories,
  getCategoryConfig,
} from "@/data/incident-categories";
import { findRegionAtPoint } from "@/utils/geo";
import SwipeableBottomSheet from "@/components/ui/SwipeableBottomSheet";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IncidentBrowserProps {
  selectedIncident: IncidentReport | null;
  onSelectIncident: (incident: IncidentReport | null) => void;
  onCameraMove?: (coordinates: [number, number]) => void;
  onDismiss?: () => void;
  visible?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_WIDTH = SCREEN_WIDTH - 40;
const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH * 0.56); // 16:9 aspect ratio

const SEVERITY_CONFIG: Record<
  IncidentSeverity,
  { label: string; color: string; bg: string }
> = {
  low: { label: "Faible", color: colors.success, bg: colors.successLight },
  medium: { label: "Moyen", color: colors.warning, bg: colors.warningLight },
  high: { label: "Grave", color: colors.danger, bg: colors.dangerLight },
};

function getTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMin < 60) {
    return `Il y a ${Math.max(1, diffMin)} minute${diffMin > 1 ? "s" : ""}`;
  }
  if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  }
  if (diffDays < 30) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  }
  return `Il y a ${diffMonths} mois`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatCoord(val: number, pos: string, neg: string): string {
  const abs = Math.abs(val).toFixed(4);
  return `${abs}°${val >= 0 ? pos : neg}`;
}

// ── Main component ────────────────────────────────────────────────────────────

export function IncidentBrowser({
  selectedIncident,
  onSelectIncident,
  onCameraMove,
  onDismiss,
  visible = true,
}: IncidentBrowserProps) {
  const [activeFilter, setActiveFilter] = useState<IncidentCategory | "all">(
    "all",
  );

  const getActiveIncidents = useMapStore((s) => s.getActiveIncidents);
  const resolveIncident = useMapStore((s) => s.resolveIncident);
  const currentUser = useUserStore((s) => s.currentUser);
  const activeIncidents = getActiveIncidents();

  // Count incidents per category
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<IncidentCategory, number>> = {};
    for (const incident of activeIncidents) {
      counts[incident.category] = (counts[incident.category] ?? 0) + 1;
    }
    return counts;
  }, [activeIncidents]);

  // Categories that have at least 1 incident
  const activeCategories = useMemo(
    () => incidentCategories.filter((cat) => (categoryCounts[cat.id] ?? 0) > 0),
    [categoryCounts],
  );

  // Filtered list
  const filteredIncidents = useMemo(
    () =>
      activeFilter === "all"
        ? activeIncidents
        : activeIncidents.filter((i) => i.category === activeFilter),
    [activeIncidents, activeFilter],
  );

  const handleSelectIncident = useCallback(
    (incident: IncidentReport) => {
      onSelectIncident(incident);
      onCameraMove?.([
        incident.coordinates.longitude,
        incident.coordinates.latitude,
      ]);
    },
    [onSelectIncident, onCameraMove],
  );

  const handleResolve = useCallback(
    (id: string) => {
      resolveIncident(id);
      onSelectIncident(null);
    },
    [resolveIncident, onSelectIncident],
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  // Show detail OR list — never both at once (prevents overlapping sheet bugs)
  if (selectedIncident) {
    return (
      <IncidentDetail
        incident={selectedIncident}
        onClose={() => onSelectIncident(null)}
        onResolve={handleResolve}
        isReporter={currentUser?.id === selectedIncident.reporterId}
      />
    );
  }

  return (
    <SwipeableBottomSheet
      visible={visible}
      onDismiss={onDismiss ?? (() => {})}
      expandedHeight={0.6}
      minimizedHeight={90}
      showBackdrop={false}
      minimizedContent={
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.warningLight }}
          >
            <Ionicons name="warning" size={20} color={colors.warning} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-heading-bold text-gray-800">
              Incidents
            </Text>
            <Text className="text-xs font-sans text-muted-foreground">
              {activeIncidents.length} incident
              {activeIncidents.length !== 1 ? "s" : ""} actif
              {activeIncidents.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Ionicons name="chevron-up" size={20} color={colors.muted} />
        </View>
      }
    >
      {/* Header card */}
      <View className="px-4 pt-1">
        <View
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: colors.warning }}
        >
          <View className="px-4 pt-3 pb-2">
            <Text className="text-white text-lg font-heading-bold">
              Incidents signalés
            </Text>
            <Text className="text-white/60 text-xs font-sans mt-0.5">
              Surveillez les incidents agricoles de votre zone
            </Text>
          </View>

          {/* Quick stats row */}
          <View className="flex-row px-3 pb-3 gap-2">
            <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1.5">
              <Ionicons name="warning" size={13} color={colors.white} />
              <Text className="text-white text-sm font-sans-bold ml-1.5">
                {activeIncidents.length}
              </Text>
              <Text className="text-white/70 text-xs font-sans ml-1">
                actif{activeIncidents.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1.5">
              <Ionicons name="grid" size={13} color={colors.white} />
              <Text className="text-white text-sm font-sans-bold ml-1.5">
                {activeCategories.length}
              </Text>
              <Text className="text-white/70 text-xs font-sans ml-1">
                catégorie{activeCategories.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Filter section */}
      <View className="mx-5 mt-3">
        <View className="flex-row items-center mb-2">
          <View
            className="w-7 h-7 rounded-lg items-center justify-center mr-2"
            style={{ backgroundColor: colors.warningLight }}
          >
            <Ionicons name="filter" size={14} color={colors.warning} />
          </View>
          <Text className="text-sm font-heading-semibold text-gray-800">
            Filtrer
          </Text>
          <View className="ml-2 bg-gray-100 rounded-full px-2 py-0.5">
            <Text className="text-xs font-sans-medium text-muted-foreground">
              {filteredIncidents.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 pb-2"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {/* "Tous" chip */}
        <FilterChip
          label="Tous"
          icon="list"
          count={activeIncidents.length}
          color={colors.primary}
          active={activeFilter === "all"}
          onPress={() => setActiveFilter("all")}
        />
        {activeCategories.map((cat) => (
          <FilterChip
            key={cat.id}
            label={cat.label}
            icon={cat.icon}
            count={categoryCounts[cat.id] ?? 0}
            color={cat.color}
            active={activeFilter === cat.id}
            onPress={() => setActiveFilter(cat.id)}
          />
        ))}
      </ScrollView>

      {/* Incident list */}
      {filteredIncidents.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-8">
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={colors.mutedLight}
          />
          <Text className="text-gray-400 text-sm mt-2 font-sans-medium">
            Aucun incident signalé
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredIncidents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <IncidentCard
              incident={item}
              onPress={() => handleSelectIncident(item)}
            />
          )}
        />
      )}
    </SwipeableBottomSheet>
  );
}

// ── Filter Chip ───────────────────────────────────────────────────────────────

function FilterChip({
  label,
  icon,
  count,
  color,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  count: number;
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? color : colors.borderLight,
        },
      ]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={14}
        color={active ? colors.white : colors.muted}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          marginLeft: 4,
          color: active ? colors.white : colors.muted,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View
        style={{
          marginLeft: 6,
          borderRadius: 9,
          paddingHorizontal: 6,
          minWidth: 18,
          alignItems: "center",
          backgroundColor: active ? "rgba(255,255,255,0.3)" : colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: active ? colors.white : colors.muted,
          }}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Incident Card ─────────────────────────────────────────────────────────────

function IncidentCard({
  incident,
  onPress,
}: {
  incident: IncidentReport;
  onPress: () => void;
}) {
  const catConfig = getCategoryConfig(incident.category);
  const severity = SEVERITY_CONFIG[incident.severity];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl border border-gray-100 mb-2 px-4 py-3 flex-row items-center"
      activeOpacity={0.7}
    >
      {/* Left: category icon */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: catConfig.color }}
      >
        <Ionicons name={catConfig.icon} size={16} color={colors.white} />
      </View>

      {/* Center: text */}
      <View className="flex-1 mr-3">
        <Text
          className="font-sans-semibold text-gray-800 text-sm"
          numberOfLines={1}
        >
          {incident.title}
        </Text>
        <Text
          className="text-xs font-sans text-gray-500 mt-0.5"
          numberOfLines={1}
        >
          {findRegionAtPoint(
            incident.coordinates.longitude,
            incident.coordinates.latitude,
          )?.properties.name ?? "Position signalée"}
        </Text>
        <Text className="text-xs font-sans text-gray-400 mt-0.5">
          {getTimeAgo(incident.createdAt)}
        </Text>
      </View>

      {/* Right: severity + thumbnail */}
      <View className="items-end">
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: severity.bg }}
        >
          <Text
            className="text-[10px] font-sans-bold"
            style={{ color: severity.color }}
          >
            {severity.label}
          </Text>
        </View>
        {incident.images.length > 0 && (
          <Image
            source={{ uri: incident.images[0] }}
            className="w-10 h-10 rounded-lg mt-1.5"
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Incident Detail Modal ─────────────────────────────────────────────────────

function IncidentDetail({
  incident,
  onClose,
  onResolve,
  isReporter,
}: {
  incident: IncidentReport;
  onClose: () => void;
  onResolve: (id: string) => void;
  isReporter: boolean;
}) {
  const catConfig = getCategoryConfig(incident.category);
  const severity = SEVERITY_CONFIG[incident.severity];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const regionName =
    findRegionAtPoint(
      incident.coordinates.longitude,
      incident.coordinates.latitude,
    )?.properties.name ?? null;

  const handleScroll = useCallback(
    (e: any) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / IMAGE_WIDTH);
      if (
        index !== activeImageIndex &&
        index >= 0 &&
        index < incident.images.length
      ) {
        setActiveImageIndex(index);
      }
    },
    [activeImageIndex, incident.images.length],
  );

  return (
    <SwipeableBottomSheet
      visible={true}
      onDismiss={onClose}
      expandedHeight={0.92}
      minimizedHeight={90}
      minimizedContent={
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: catConfig.color + "20" }}
          >
            <Ionicons name={catConfig.icon} size={20} color={catConfig.color} />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-heading-bold text-gray-800"
              numberOfLines={1}
            >
              {incident.title}
            </Text>
            <Text className="text-xs font-sans text-muted-foreground">
              {catConfig.label}
            </Text>
          </View>
          <Ionicons name="chevron-up" size={20} color={colors.muted} />
        </View>
      }
    >
      {/* Header card */}
      <View className="px-4 pt-1">
        <View
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: catConfig.color }}
        >
          <View className="px-4 pt-4 pb-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name={catConfig.icon}
                    size={24}
                    color={colors.white}
                  />
                  <Text className="text-white/80 text-sm ml-2 font-sans-medium">
                    {catConfig.label}
                  </Text>
                </View>
                <Text className="text-white text-xl font-heading-bold">
                  {incident.title}
                </Text>
              </View>
              <AnimatedPressable
                onPress={() => {
                  haptic.light();
                  onClose();
                }}
                className="w-10 h-10 rounded-full bg-white/15 items-center justify-center"
              >
                <Ionicons name="close" size={20} color={colors.white} />
              </AnimatedPressable>
            </View>
          </View>

          {/* Quick stats row */}
          <View className="flex-row px-3 pb-3 gap-2">
            <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1.5">
              <Ionicons name="shield" size={13} color={colors.white} />
              <Text className="text-white text-sm font-sans-bold ml-1.5">
                {severity.label}
              </Text>
            </View>
            <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1.5">
              <Ionicons
                name={
                  incident.status === "active"
                    ? "radio-button-on"
                    : "checkmark-circle"
                }
                size={13}
                color={colors.white}
              />
              <Text className="text-white text-sm font-sans-bold ml-1.5">
                {incident.status === "active" ? "Actif" : "Résolu"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Image carousel */}
        {incident.images.length > 0 && (
          <View className="mb-5">
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={IMAGE_WIDTH}
            >
              {incident.images.map((uri, index) => (
                <Image
                  key={`img-${index}`}
                  source={{ uri }}
                  style={{
                    width: IMAGE_WIDTH,
                    height: IMAGE_HEIGHT,
                    borderRadius: 12,
                  }}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
            {/* Dots indicator */}
            {incident.images.length > 1 && (
              <View className="flex-row justify-center mt-2">
                {incident.images.map((_, index) => (
                  <View
                    key={`dot-${index}`}
                    className="w-2 h-2 rounded-full mx-1"
                    style={{
                      backgroundColor:
                        index === activeImageIndex
                          ? catConfig.color
                          : colors.mutedLighter,
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Description */}
        <DetailSection
          title="Description"
          icon="document-text"
          tint={catConfig.color}
        >
          <Text className="text-gray-700 leading-relaxed text-sm font-sans">
            {incident.description}
          </Text>
        </DetailSection>

        {/* Details */}
        <DetailSection
          title="Détails"
          icon="information-circle"
          tint={catConfig.color}
        >
          <DetailRow
            label="Catégorie"
            value={
              <View className="flex-row items-center">
                <Ionicons
                  name={catConfig.icon}
                  size={14}
                  color={catConfig.color}
                />
                <Text
                  className="text-sm font-sans-medium ml-1"
                  style={{ color: catConfig.color }}
                >
                  {catConfig.label}
                </Text>
              </View>
            }
          />
          <DetailRow
            label="Gravité"
            value={
              <View
                className="rounded-full px-2.5 py-0.5"
                style={{ backgroundColor: severity.bg }}
              >
                <Text
                  className="text-xs font-sans-bold"
                  style={{ color: severity.color }}
                >
                  {severity.label}
                </Text>
              </View>
            }
          />
          <DetailRow
            label="Statut"
            value={
              <View
                className="rounded-full px-2.5 py-0.5"
                style={{
                  backgroundColor:
                    incident.status === "active"
                      ? colors.successLight
                      : colors.borderLight,
                }}
              >
                <Text
                  className="text-xs font-sans-bold"
                  style={{
                    color:
                      incident.status === "active"
                        ? colors.primaryDark
                        : colors.muted,
                  }}
                >
                  {incident.status === "active" ? "Actif" : "Résolu"}
                </Text>
              </View>
            }
          />
          <DetailRow
            label="Signalé par"
            value={
              <Text className="text-sm text-gray-800 font-sans-medium">
                {incident.reporterName}
              </Text>
            }
          />
          <DetailRow
            label="Date"
            value={
              <Text className="text-sm text-gray-800 font-sans-medium">
                {formatDate(incident.createdAt)}
              </Text>
            }
            isLast
          />

          {/* Location card */}
          <View
            className="rounded-xl p-3.5 flex-row items-center mt-3"
            style={{ backgroundColor: `${catConfig.color}15` }}
          >
            <View
              className="rounded-full p-2 mr-3"
              style={{ backgroundColor: `${catConfig.color}25` }}
            >
              <Ionicons name="location" size={18} color={catConfig.color} />
            </View>
            <View className="flex-1">
              <Text
                className="font-sans-semibold text-sm"
                style={{ color: catConfig.color }}
              >
                {regionName ? `Région de ${regionName}` : "Position signalée"}
              </Text>
              <Text
                className="text-xs font-sans mt-0.5"
                style={{ color: catConfig.color, opacity: 0.6 }}
              >
                {formatCoord(incident.coordinates.latitude, "N", "S")},{" "}
                {formatCoord(incident.coordinates.longitude, "E", "W")}
              </Text>
            </View>
          </View>
        </DetailSection>

        {/* Action buttons */}
        <View className="mb-8 mt-2">
          {isReporter && incident.status === "active" && (
            <AnimatedPressable
              onPress={() => {
                haptic.medium();
                onResolve(incident.id);
              }}
              className="bg-emerald-500 rounded-xl py-4 items-center mb-3"
            >
              <Text className="text-white font-sans-bold text-base">
                Marquer comme résolu
              </Text>
            </AnimatedPressable>
          )}
          <AnimatedPressable
            onPress={() => {
              haptic.light();
              onClose();
            }}
            className="bg-gray-200 rounded-xl py-4 items-center"
          >
            <Text className="text-gray-600 font-sans-semibold text-base">
              Fermer
            </Text>
          </AnimatedPressable>
        </View>

        <View className="h-4" />
      </ScrollView>
    </SwipeableBottomSheet>
  );
}

// ── Detail sub-components ─────────────────────────────────────────────────────

function DetailSection({
  title,
  icon,
  tint,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tint?: string;
  children: React.ReactNode;
}) {
  const sectionColor = tint ?? colors.primary;
  return (
    <View className="mb-5">
      <View className="flex-row items-center mb-2">
        <View
          className="w-7 h-7 rounded-lg items-center justify-center mr-2"
          style={{ backgroundColor: sectionColor + "20" }}
        >
          <Ionicons name={icon} size={14} color={sectionColor} />
        </View>
        <Text className="text-sm font-heading-semibold text-gray-800">
          {title}
        </Text>
      </View>
      <View className="bg-white rounded-2xl p-4 border border-gray-100">
        {children}
      </View>
    </View>
  );
}

function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-2.5 ${
        !isLast ? "border-b border-gray-50" : ""
      }`}
    >
      <Text className="text-sm font-sans text-gray-500">{label}</Text>
      <View>{value}</View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
});
