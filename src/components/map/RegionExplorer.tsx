import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RegionAgriInfo } from "@/data/senegal-regions";
import SwipeableBottomSheet from "@/components/ui/SwipeableBottomSheet";
import { colors } from "@/theme/colors";

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
}

// ── Main component ────────────────────────────────────────────────────────────

export function RegionExplorer({
  selectedRegion,
  visible,
  onClose,
}: RegionExplorerProps) {
  if (!selectedRegion) return null;

  return (
    <SwipeableBottomSheet
      visible={visible}
      onDismiss={onClose}
      expandedHeight={0.85}
      minimizedHeight={90}
      expandTrigger={selectedRegion.id}
      minimizedContent={
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: selectedRegion.color + "20" }}
          >
            <Ionicons name="map" size={20} color={selectedRegion.color} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-800">
              {selectedRegion.name}
            </Text>
            <Text className="text-xs text-muted-foreground">
              Capitale : {selectedRegion.capital}
            </Text>
          </View>
          <Ionicons name="chevron-up" size={20} color={colors.mutedLight} />
        </View>
      }
    >
      {/* Coloured header */}
      <View
        className="px-5 pt-2 pb-5"
        style={{ backgroundColor: selectedRegion.color }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-white text-2xl font-bold">
              {selectedRegion.name}
            </Text>
            <Text className="text-white/80 text-sm mt-0.5">
              Capitale : {selectedRegion.capital}
            </Text>
          </View>
        </View>
        {selectedRegion.population && (
          <View className="flex-row items-center mt-3 bg-white/20 rounded-xl px-3 py-1.5 self-start">
            <Ionicons name="people" size={14} color="white" />
            <Text className="text-white text-sm ml-1.5 font-medium">
              {selectedRegion.population.toLocaleString("fr-FR")} hab.
            </Text>
          </View>
        )}
      </View>

      <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
        {selectedRegion.agriInfo && (
          <>
            {/* Climate */}
            <InfoSection
              icon="partly-sunny"
              title="Climat & Pluviométrie"
              color={selectedRegion.color}
            >
              <InfoRow label="Climat" value={selectedRegion.agriInfo.climate} />
              <InfoRow
                label="Pluviométrie"
                value={selectedRegion.agriInfo.rainfall}
              />
            </InfoSection>

            {/* Soil */}
            <InfoSection
              icon="layers"
              title="Types de Sols"
              color={selectedRegion.color}
            >
              <View className="flex-row flex-wrap gap-2 mb-2">
                {selectedRegion.agriInfo.soilInfo.mainSoilTypes.map((soil) => (
                  <View
                    key={soil}
                    className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1"
                  >
                    <Text className="text-amber-800 text-sm font-medium">
                      {soil}
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="text-muted-foreground text-sm leading-5 mt-1">
                {selectedRegion.agriInfo.soilInfo.soilDescription}
              </Text>
              <View className="flex-row gap-3 mt-3">
                <View className="flex-1 bg-gray-50 rounded-xl p-3">
                  <Text className="text-xs text-muted-foreground mb-0.5">
                    pH
                  </Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {selectedRegion.agriInfo.soilInfo.pH}
                  </Text>
                </View>
                <View className="flex-1 bg-gray-50 rounded-xl p-3">
                  <Text className="text-xs text-muted-foreground mb-0.5">
                    Drainage
                  </Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {selectedRegion.agriInfo.soilInfo.drainage}
                  </Text>
                </View>
              </View>
            </InfoSection>

            {/* Crops */}
            <InfoSection
              icon="leaf"
              title="Cultures principales"
              color={selectedRegion.color}
            >
              {selectedRegion.agriInfo.mainCrops.map((crop) => (
                <View key={crop} className="flex-row items-start mb-1">
                  <Text className="text-green-500 mr-2 mt-0.5">•</Text>
                  <Text className="text-gray-700 text-sm flex-1">{crop}</Text>
                </View>
              ))}
            </InfoSection>

            {/* Livestock */}
            <InfoSection
              icon="paw"
              title="Élevage & Activités"
              color={selectedRegion.color}
            >
              {selectedRegion.agriInfo.mainLivestock.map((item) => (
                <View key={item} className="flex-row items-start mb-1">
                  <Text className="text-blue-500 mr-2 mt-0.5">•</Text>
                  <Text className="text-gray-700 text-sm flex-1">{item}</Text>
                </View>
              ))}
            </InfoSection>

            {/* Notes */}
            <InfoSection
              icon="information-circle"
              title="Notes agricoles"
              color={selectedRegion.color}
            >
              <Text className="text-muted-foreground text-sm leading-5">
                {selectedRegion.agriInfo.agriculturalNotes}
              </Text>
            </InfoSection>
          </>
        )}

        {/* Departments */}
        {selectedRegion.departments.length > 0 && (
          <InfoSection
            icon="location"
            title="Départements"
            color={selectedRegion.color}
          >
            <View className="flex-row flex-wrap gap-2">
              {selectedRegion.departments.map((dept) => (
                <View key={dept} className="bg-gray-100 rounded-lg px-3 py-1">
                  <Text className="text-gray-700 text-sm">{dept}</Text>
                </View>
              ))}
            </View>
          </InfoSection>
        )}

        <View className="h-8" />
      </ScrollView>
    </SwipeableBottomSheet>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function InfoSection({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={15} color={color} />
        <Text className="text-xs font-bold text-gray-800 ml-1.5 uppercase tracking-wide">
          {title}
        </Text>
      </View>
      <View className="bg-white rounded-2xl p-3 border border-gray-100">
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-0.5">
      <Text className="text-muted-foreground text-sm">{label}</Text>
      <Text className="text-gray-800 text-sm font-medium text-right flex-1 ml-4">
        {value}
      </Text>
    </View>
  );
}
