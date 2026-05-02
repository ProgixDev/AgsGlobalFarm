import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedPressable from "@/components/animated/AnimatedPressable";
import Button from "@/components/ui/Button";
import { useItineraryStore } from "@/stores/itineraryStore";
import { TAB_BAR_HEIGHT } from "@/components/ui/FloatingTabBar";
import {
  calculateScaledItinerary,
  formatArea,
  formatDose,
  formatNumber,
  getScheduleLabel,
} from "@/utils/itinerary-calc";
import {
  generatePdf,
  openPdf,
  pdfFileExists,
  sharePdf,
} from "@/utils/itinerary-pdf";
import { colors } from "@/theme/colors";
import { haptic } from "@/utils/haptics";

function toSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ItineraryResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ entryId?: string }>();
  const entryId = toSingleParam(params.entryId);

  const entry = useItineraryStore((state) =>
    entryId ? state.getEntryById(entryId) : undefined,
  );
  const updateHistoryPdf = useItineraryStore((state) => state.updateHistoryPdf);

  const [isSharing, setSharing] = useState(false);
  const [isRegenerating, setRegenerating] = useState(false);

  const computation = useMemo(() => {
    if (!entry) return { error: "Entrée introuvable." } as const;
    try {
      const itinerary = calculateScaledItinerary({
        cropId: entry.cropId,
        areaM2: entry.areaM2,
      });
      return { itinerary } as const;
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de calculer cet itinéraire.",
      } as const;
    }
  }, [entry]);

  const itinerary = "itinerary" in computation ? computation.itinerary : null;
  const fileExists = pdfFileExists(entry?.pdfUri);

  const handleViewPdf = async () => {
    if (!entry || !entry.pdfUri || !itinerary) return;
    if (!fileExists) {
      Alert.alert(
        "PDF indisponible",
        "Le fichier n'est plus accessible. Régénérez l'itinéraire pour obtenir un nouveau PDF.",
      );
      return;
    }

    try {
      setSharing(true);
      await openPdf(entry.pdfUri, entry.cropName);
      haptic.success();
    } catch (error) {
      console.error("[itinerary] share failed", error);
      Alert.alert(
        "Partage impossible",
        error instanceof Error
          ? error.message
          : "Le PDF n'a pas pu être ouvert.",
      );
    } finally {
      setSharing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!entry || !itinerary) return;

    try {
      setRegenerating(true);
      const pdf = await generatePdf(itinerary);
      updateHistoryPdf(entry.id, pdf.uri, pdf.savedToDownloads);
      haptic.success();
      Alert.alert(
        "PDF régénéré",
        "Le PDF a été régénéré. Touchez « Voir le PDF » pour le partager ou l'enregistrer.",
      );
    } catch (error) {
      console.error("[itinerary] regenerate failed", error);
      Alert.alert(
        "Régénération impossible",
        error instanceof Error
          ? error.message
          : "Le PDF n'a pas pu être régénéré.",
      );
    } finally {
      setRegenerating(false);
    }
  };

  if (!entry || !itinerary) {
    const message =
      "error" in computation ? computation.error : "Itinéraire introuvable.";
    return (
      <View
        className="flex-1 bg-[#f6f4eb] items-center justify-center px-6"
        style={{ paddingTop: insets.top }}
      >
        <View className="bg-white rounded-3xl border border-[#e7e3d4] p-6 w-full">
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color={colors.warningDark}
          />
          <Text className="text-xl font-heading-bold text-gray-900 mt-3">
            Résultat indisponible
          </Text>
          <Text className="text-sm font-sans text-gray-600 mt-2">
            {message}
          </Text>
          <Button
            title="Retour au générateur"
            onPress={() =>
              router.replace("/itineraire/generator" as Href)
            }
            className="mt-5"
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#f6f4eb]"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 32,
      }}
    >
      <View className="px-5">
        <View className="flex-row items-center mb-4">
          <AnimatedPressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-white border border-[#e7e3d4] items-center justify-center"
            hapticType="light"
          >
            <Ionicons name="arrow-back" size={20} color="#1f8a49" />
          </AnimatedPressable>
          <View className="ml-3 flex-1">
            <Text className="text-[11px] font-sans-semibold uppercase tracking-widest text-[#8a6e2f]">
              Itinéraire calculé
            </Text>
            <Text className="text-2xl font-heading-bold text-gray-900 mt-0.5">
              {itinerary.cropName}
            </Text>
          </View>
        </View>

        <View className="bg-[#1f8a49] rounded-3xl px-5 py-5 mb-5">
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-2xl bg-white/15 items-center justify-center mr-3">
              <Text className="text-3xl">{itinerary.emoji}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-heading-semibold">
                {formatArea(itinerary.areaM2)}
              </Text>
              <Text className="text-white/80 text-xs font-sans mt-1">
                Base : {formatArea(itinerary.baselineAreaM2)} • Facteur ×
                {formatNumber(itinerary.scaleFactor)}
              </Text>
            </View>
          </View>

          {itinerary.cultivationNote && (
            <View className="mt-4 bg-white/10 rounded-2xl px-3 py-2">
              <Text className="text-white text-xs font-sans">
                {itinerary.cultivationNote}
              </Text>
            </View>
          )}
        </View>

        <View className="bg-white border border-[#e7e3d4] rounded-3xl px-4 py-4 mb-5">
          <View className="flex-row items-center mb-3">
            <Ionicons
              name={fileExists ? "document-text" : "document-text-outline"}
              size={20}
              color={fileExists ? colors.primary : colors.mutedLight}
            />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-heading-semibold text-gray-900">
                {entry.pdfFileName}
              </Text>
              <Text className="text-[11px] font-sans text-gray-500 mt-0.5">
                {fileExists
                  ? "Touchez « Voir le PDF » pour le partager ou l'enregistrer."
                  : "PDF non disponible — régénérez-le."}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button
                title={isSharing ? "Ouverture…" : "Voir le PDF"}
                onPress={handleViewPdf}
                disabled={!fileExists}
                loading={isSharing}
                icon={
                  !isSharing ? (
                    <Ionicons name="open-outline" size={16} color="#fff" />
                  ) : undefined
                }
                size="md"
              />
            </View>
            <View className="flex-1">
              <Button
                title={isRegenerating ? "…" : "Régénérer"}
                onPress={handleRegenerate}
                loading={isRegenerating}
                variant="outline"
                icon={
                  !isRegenerating ? (
                    <Ionicons
                      name="refresh"
                      size={16}
                      color={colors.primary}
                    />
                  ) : undefined
                }
                size="md"
              />
            </View>
          </View>
        </View>

        <Text className="text-[11px] font-sans-semibold uppercase tracking-widest text-[#6b5e3f] px-1 mb-3">
          Programme de fertilisation
        </Text>

        {itinerary.program.fertilization.map((step, index) => (
          <View
            key={step.id}
            className="bg-white border border-[#e7e3d4] rounded-3xl px-4 py-4 mb-3"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-9 h-9 rounded-xl bg-[#fdf9ea] items-center justify-center mr-3">
                <Text className="text-sm font-heading-bold text-[#8a6e2f]">
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-heading-semibold text-gray-900">
                  {step.label}
                </Text>
                <Text className="text-[11px] font-sans text-gray-500 mt-0.5">
                  {getScheduleLabel(itinerary.program.scheduleType)} :{" "}
                  {step.schedule}
                </Text>
              </View>
            </View>

            <View className="bg-[#fbf7e9] rounded-2xl px-3 py-2">
              {step.doses.map((dose, doseIndex) => (
                <View
                  key={`${step.id}-${dose.product}`}
                  className={`flex-row items-center justify-between py-2 ${
                    doseIndex < step.doses.length - 1
                      ? "border-b border-[#ece5cf]"
                      : ""
                  }`}
                >
                  <Text className="text-sm font-sans text-gray-700 flex-1 mr-3">
                    {dose.product}
                  </Text>
                  <Text className="text-sm font-sans-semibold text-[#14532d]">
                    {formatDose(dose.scaledDose, dose.unit)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text className="text-[11px] font-sans-semibold uppercase tracking-widest text-[#6b5e3f] px-1 mt-2 mb-3">
          Protocole phytosanitaire
        </Text>

        <View className="bg-white border border-[#e7e3d4] rounded-3xl px-4 py-4 mb-3">
          <View className="flex-row items-start mb-3">
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.primary}
            />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-heading-semibold text-gray-900">
                Préventif
              </Text>
              <Text className="text-xs font-sans text-gray-700 mt-0.5">
                {itinerary.program.phyto.frequency}
              </Text>
            </View>
          </View>
          <View className="flex-row items-start">
            <Ionicons
              name="warning-outline"
              size={20}
              color={colors.warningDark}
            />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-heading-semibold text-gray-900">
                En cas d&apos;attaque
              </Text>
              <Text className="text-xs font-sans text-gray-700 mt-0.5">
                {itinerary.program.phyto.emergencyFrequency}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-2">
          {itinerary.program.phyto.categories.map((category) => (
            <View
              key={category.id}
              className="bg-white border border-[#e7e3d4] rounded-2xl px-4 py-3"
            >
              <Text className="text-[11px] font-sans-semibold uppercase tracking-wider text-[#8a6e2f]">
                {category.label}
              </Text>
              <Text className="text-sm font-sans text-gray-800 mt-1">
                {category.products.join(" / ")}
              </Text>
              {category.notes && (
                <Text className="text-[11px] font-sans text-gray-500 mt-1">
                  {category.notes}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mt-4">
          <Text className="text-xs font-sans text-amber-800">
            {itinerary.program.phyto.disclaimer}
          </Text>
        </View>

        {(itinerary.program.notes?.length ?? 0) > 0 && (
          <View className="mt-5 bg-white border border-[#e7e3d4] rounded-3xl px-4 py-4">
            <Text className="text-sm font-heading-semibold text-gray-900 mb-2">
              Notes de programme
            </Text>
            {itinerary.program.notes?.map((note) => (
              <Text
                key={note}
                className="text-sm font-sans text-gray-700 mb-1"
              >
                • {note}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
