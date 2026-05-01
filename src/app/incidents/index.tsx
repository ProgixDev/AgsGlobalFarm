import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/animated";
import { fetchMyIncidents, type IncidentDTO } from "@/lib/api/incidents";
import { useMapStore } from "@/stores/mapStore";
import {
  getCategoryConfig,
} from "@/data/incident-categories";
import IncidentCategoryIcon from "@/components/map/IncidentCategoryIcon";
import { colors } from "@/theme/colors";
import { haptic } from "@/utils/haptics";

function formatDate(input: string): string {
  return new Date(input).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Grave",
};

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: colors.success,
  medium: colors.warning,
  high: colors.danger,
};

export default function MyIncidentsScreen() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<IncidentDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolveIncident = useMapStore((s) => s.resolveIncident);
  const deleteIncident = useMapStore((s) => s.deleteIncident);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyIncidents();
      setIncidents(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = (id: string) => {
    Alert.alert(
      "Marquer comme résolu",
      "Confirmer que cet incident n'est plus actif ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            haptic.success();
            await resolveIncident(id);
            await load();
          },
        },
      ],
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Supprimer cet incident",
      "Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            haptic.warning();
            await deleteIncident(id);
            await load();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
        <AnimatedPressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color={colors.muted} />
        </AnimatedPressable>
        <Text className="ml-3 text-lg font-heading-bold text-gray-900">
          Mes signalements
        </Text>
      </View>

      {loading && !incidents && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && !loading && (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="cloud-offline-outline"
            size={48}
            color={colors.mutedLight}
          />
          <Text className="text-base font-heading-bold text-gray-700 mt-3">
            Impossible de charger
          </Text>
          <Text className="text-sm font-sans text-gray-500 mt-1 text-center">
            {error}
          </Text>
          <AnimatedPressable
            className="mt-4 px-5 py-2.5 rounded-full bg-primary"
            onPress={load}
          >
            <Text className="text-sm font-sans-semibold text-white">
              Réessayer
            </Text>
          </AnimatedPressable>
        </View>
      )}

      {!loading && !error && incidents && incidents.length === 0 && (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="warning-outline"
            size={64}
            color={colors.mutedLight}
          />
          <Text className="text-lg font-heading-bold text-gray-700 mt-3">
            Aucun signalement
          </Text>
          <Text className="text-sm font-sans text-gray-500 mt-1 text-center">
            Vos signalements d&apos;incidents apparaîtront ici.
          </Text>
        </View>
      )}

      {incidents && incidents.length > 0 && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {incidents.map((incident) => {
            const cat = getCategoryConfig(incident.category);
            const isResolved = incident.status === "resolved";
            return (
              <View
                key={incident._id}
                className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IncidentCategoryIcon
                      icon={cat.icon}
                      iconSet={cat.iconSet}
                      size={16}
                      color={colors.white}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-sans-semibold text-gray-500">
                      {cat.label}
                    </Text>
                    <Text className="text-xs font-sans text-gray-400">
                      {formatDate(incident.createdAt)}
                    </Text>
                  </View>
                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      isResolved ? "bg-gray-100" : "bg-emerald-100"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-sans-bold uppercase ${
                        isResolved ? "text-gray-600" : "text-emerald-700"
                      }`}
                    >
                      {isResolved ? "Résolu" : "Actif"}
                    </Text>
                  </View>
                </View>

                <Text className="text-base font-heading-bold text-gray-900 mb-1">
                  {incident.title}
                </Text>
                <Text
                  className="text-sm font-sans text-gray-600 mb-2"
                  numberOfLines={3}
                >
                  {incident.description}
                </Text>

                <View className="flex-row items-center gap-2 mb-3">
                  <View
                    className="px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: SEVERITY_COLORS[incident.severity],
                    }}
                  >
                    <Text className="text-[10px] font-sans-bold uppercase text-white">
                      {SEVERITY_LABELS[incident.severity]}
                    </Text>
                  </View>
                  {incident.region && (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color={colors.muted}
                      />
                      <Text className="text-xs font-sans text-gray-500 ml-0.5">
                        {incident.region}
                      </Text>
                    </View>
                  )}
                </View>

                {incident.images.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-3"
                  >
                    {incident.images.map((url, idx) => (
                      <Image
                        key={`${url}-${idx}`}
                        source={{ uri: url }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          marginRight: 8,
                        }}
                      />
                    ))}
                  </ScrollView>
                )}

                <View className="flex-row gap-2">
                  {!isResolved && (
                    <AnimatedPressable
                      onPress={() => handleResolve(incident._id)}
                      className="flex-1 rounded-xl py-2 items-center bg-emerald-50 border border-emerald-200"
                    >
                      <Text className="text-xs font-sans-semibold text-emerald-700">
                        Marquer résolu
                      </Text>
                    </AnimatedPressable>
                  )}
                  <AnimatedPressable
                    onPress={() => handleDelete(incident._id)}
                    className="flex-1 rounded-xl py-2 items-center bg-red-50 border border-red-200"
                  >
                    <Text className="text-xs font-sans-semibold text-red-700">
                      Supprimer
                    </Text>
                  </AnimatedPressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
