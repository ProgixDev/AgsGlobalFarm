import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RegionAgriInfo } from "@/data/senegal-regions";
import SwipeableBottomSheet from "@/components/ui/SwipeableBottomSheet";
import { colors } from "@/theme/colors";

const isFabricEnabled = Boolean(
  (globalThis as { nativeFabricUIManager?: unknown }).nativeFabricUIManager,
);

if (
  Platform.OS === "android" &&
  !isFabricEnabled &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SelectedRegion {
  id: string;
  name: string;
  capital: string;
  population?: number;
  agriInfo: RegionAgriInfo | null;
  departments: string[];
  color: string;
}

interface RegionExplorerProps {
  selectedRegion: SelectedRegion | null;
  visible: boolean;
  onClose: () => void;
  onRefocus?: () => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export function RegionExplorer({
  selectedRegion,
  visible,
  onClose,
  onRefocus,
}: RegionExplorerProps) {
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["climate", "crops"]),
  );

  const toggleSection = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  if (!selectedRegion) return null;

  const agri = selectedRegion.agriInfo;

  return (
    <SwipeableBottomSheet
      visible={visible}
      onDismiss={onClose}
      expandedHeight={0.85}
      minimizedHeight={90}
      initialState="minimized"
      expandTrigger={selectedRegion.id}
      showBackdrop={false}
      onStateChange={(state) => setSheetExpanded(state === "expanded")}
      minimizedContent={
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <Ionicons name="map" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-heading-bold text-gray-800">
              {selectedRegion.name}
            </Text>
            <Text className="text-xs font-sans text-muted-foreground">
              Capitale : {selectedRegion.capital}
            </Text>
          </View>
          <Ionicons
            name={sheetExpanded ? "chevron-down" : "chevron-up"}
            size={20}
            color={colors.muted}
          />
        </View>
      }
    >
      {/* Header card */}
      <View className="px-4 pt-1">
        <View
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: colors.primary }}
        >
          <View className="px-4 pt-4 pb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-white text-2xl font-heading-bold">
                  {selectedRegion.name}
                </Text>
                <Text className="text-white/60 text-sm font-sans mt-1">
                  Capitale : {selectedRegion.capital}
                </Text>
              </View>
              {onRefocus && (
                <TouchableOpacity
                  onPress={onRefocus}
                  activeOpacity={0.7}
                  className="w-10 h-10 rounded-full bg-white/15 items-center justify-center"
                >
                  <Ionicons
                    name="locate-outline"
                    size={20}
                    color={colors.white}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick stats row */}
          <View className="flex-row px-3 pb-3 gap-2">
            {selectedRegion.population && (
              <StatPill
                icon="people"
                value={`${(selectedRegion.population / 1_000_000).toFixed(1)}M`}
                label="hab."
              />
            )}
            {agri && (
              <>
                <StatPill
                  icon="leaf"
                  value={String(agri.mainCrops.length)}
                  label="cultures"
                />
                <StatPill
                  icon="water"
                  value={agri.rainfall.split("–")[0] || agri.rainfall}
                  label="mm/an"
                />
              </>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {agri && (
          <>
            {/* Climate & Rainfall */}
            <CollapsibleSection
              sectionKey="climate"
              icon="partly-sunny"
              title="Climat & Pluviométrie"
              expanded={expandedSections.has("climate")}
              onToggle={toggleSection}
            >
              <View className="flex-row gap-3">
                <DataCard
                  icon="thermometer-outline"
                  label="Climat"
                  value={agri.climate}
                  tint={colors.warning}
                />
                <DataCard
                  icon="rainy-outline"
                  label="Pluviométrie"
                  value={agri.rainfall}
                  tint={colors.info}
                />
              </View>
            </CollapsibleSection>

            {/* Soil */}
            <CollapsibleSection
              sectionKey="soil"
              icon="layers"
              title="Types de Sols"
              expanded={expandedSections.has("soil")}
              onToggle={toggleSection}
            >
              <View className="flex-row flex-wrap gap-2 mb-3">
                {agri.soilInfo.mainSoilTypes.map((soil) => (
                  <View
                    key={soil}
                    className="flex-row items-center bg-amber-50 rounded-full px-3 py-1.5"
                  >
                    <View className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                    <Text className="text-amber-800 text-sm font-sans-medium">
                      {soil}
                    </Text>
                  </View>
                ))}
              </View>

              <Text className="text-gray-600 text-sm font-sans leading-5 mb-3">
                {agri.soilInfo.soilDescription}
              </Text>

              <View className="flex-row gap-2">
                <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
                  <Text className="text-xs font-sans text-muted-foreground">
                    pH
                  </Text>
                  <Text className="text-lg font-heading-bold text-gray-800 mt-0.5">
                    {agri.soilInfo.pH}
                  </Text>
                </View>
                <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
                  <Text className="text-xs font-sans text-muted-foreground">
                    Drainage
                  </Text>
                  <Text className="text-sm font-heading-semibold text-gray-800 mt-1 text-center">
                    {agri.soilInfo.drainage}
                  </Text>
                </View>
              </View>
            </CollapsibleSection>

            {/* Crops */}
            <CollapsibleSection
              sectionKey="crops"
              icon="leaf"
              title="Cultures principales"
              count={agri.mainCrops.length}
              expanded={expandedSections.has("crops")}
              onToggle={toggleSection}
            >
              <View className="flex-row flex-wrap gap-2">
                {agri.mainCrops.map((crop) => (
                  <View
                    key={crop}
                    className="flex-row items-center bg-green-50 rounded-full px-3 py-1.5"
                  >
                    <Text className="text-primary text-xs mr-1.5">●</Text>
                    <Text className="text-green-800 text-sm font-sans-medium">
                      {crop}
                    </Text>
                  </View>
                ))}
              </View>
            </CollapsibleSection>

            {/* Livestock */}
            <CollapsibleSection
              sectionKey="livestock"
              icon="paw"
              title="Élevage & Activités"
              count={agri.mainLivestock.length}
              expanded={expandedSections.has("livestock")}
              onToggle={toggleSection}
            >
              <View className="flex-row flex-wrap gap-2">
                {agri.mainLivestock.map((item) => (
                  <View
                    key={item}
                    className="flex-row items-center bg-blue-50 rounded-full px-3 py-1.5"
                  >
                    <Text className="text-blue-500 text-xs mr-1.5">●</Text>
                    <Text className="text-blue-800 text-sm font-sans-medium">
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </CollapsibleSection>

            {/* Notes */}
            <CollapsibleSection
              sectionKey="notes"
              icon="document-text"
              title="Notes agricoles"
              expanded={expandedSections.has("notes")}
              onToggle={toggleSection}
            >
              <Text className="text-gray-600 text-sm font-sans leading-6">
                {agri.agriculturalNotes}
              </Text>
            </CollapsibleSection>
          </>
        )}

        {/* Departments */}
        {selectedRegion.departments.length > 0 && (
          <CollapsibleSection
            sectionKey="departments"
            icon="location"
            title="Départements"
            count={selectedRegion.departments.length}
            expanded={expandedSections.has("departments")}
            onToggle={toggleSection}
          >
            <View className="flex-row flex-wrap gap-2">
              {selectedRegion.departments.map((dept) => (
                <View
                  key={dept}
                  className="bg-gray-200 rounded-full px-3 py-1.5"
                >
                  <Text className="text-gray-800 text-base font-sans-semibold">
                    {dept}
                  </Text>
                </View>
              ))}
            </View>
          </CollapsibleSection>
        )}
      </ScrollView>
    </SwipeableBottomSheet>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  label: string;
}) {
  return (
    <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1.5">
      <Ionicons name={icon} size={13} color={colors.white} />
      <Text className="text-white text-sm font-sans-bold ml-1.5">{value}</Text>
      <Text className="text-white/70 text-xs font-sans ml-1">{label}</Text>
    </View>
  );
}

function DataCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-3 border border-gray-100">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: tint + "18" }}
      >
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text className="text-xs font-sans text-muted-foreground">{label}</Text>
      <Text className="text-sm font-heading-semibold text-gray-800 mt-0.5">
        {value}
      </Text>
    </View>
  );
}

function CollapsibleSection({
  sectionKey,
  icon,
  title,
  count,
  expanded,
  onToggle,
  children,
}: {
  sectionKey: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  count?: number;
  expanded: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <View className="mx-5 mt-4">
      <TouchableOpacity
        onPress={() => onToggle(sectionKey)}
        activeOpacity={0.6}
        className="flex-row items-center justify-between py-2"
      >
        <View className="flex-row items-center flex-1">
          <View
            className="w-7 h-7 rounded-lg items-center justify-center mr-2"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <Ionicons name={icon} size={14} color={colors.primary} />
          </View>
          <Text className="text-sm font-heading-semibold text-gray-800">
            {title}
          </Text>
          {count != null && (
            <View className="ml-2 bg-gray-100 rounded-full px-2 py-0.5">
              <Text className="text-xs font-sans-medium text-muted-foreground">
                {count}
              </Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.muted}
        />
      </TouchableOpacity>

      {expanded && <View className="pt-2 pb-1">{children}</View>}
    </View>
  );
}
