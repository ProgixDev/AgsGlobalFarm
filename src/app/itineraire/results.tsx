import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedPressable from "@/components/animated/AnimatedPressable";
import Button from "@/components/ui/Button";
import {
  calculateScaledItinerary,
  formatDoseValue,
  getMethodLabel,
  getScheduleLabel,
} from "@/utils/itinerary-calc";
import { exportItineraryToPdf } from "@/utils/itinerary-pdf";
import { colors } from "@/theme/colors";
import { haptic } from "@/utils/haptics";

function toSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseArea(value?: string) {
  if (!value) return Number.NaN;
  return Number(value.replaceAll(" ", "").replace(",", "."));
}

export default function ItineraryResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    cropId?: string;
    areaM2?: string;
    method?: string;
  }>();

  const [isExporting, setIsExporting] = useState(false);

  const result = useMemo(() => {
    const cropId = toSingleParam(params.cropId);
    const areaParam = toSingleParam(params.areaM2);
    const methodParam = toSingleParam(params.method);

    if (!cropId || !areaParam || !methodParam) {
      return { error: "Parametres incomplets pour afficher le resultat." };
    }

    if (methodParam !== "serre" && methodParam !== "plein_champ") {
      return { error: "Mode de culture invalide." };
    }

    const areaM2 = parseArea(areaParam);

    try {
      const itinerary = calculateScaledItinerary({
        cropId,
        areaM2,
        method: methodParam,
      });

      return { itinerary };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de calculer cet itineraire.",
      };
    }
  }, [params.areaM2, params.cropId, params.method]);

  const itinerary = result.itinerary;

  const handleExportPdf = async () => {
    if (!itinerary) return;

    try {
      setIsExporting(true);
      const exportResult = await exportItineraryToPdf(itinerary);
      haptic.success();
      Alert.alert(
        "PDF pret",
        exportResult.shared
          ? "Le document PDF a ete genere et partage."
          : exportResult.usedPrintDialog
            ? "Le menu d'impression a ete ouvert. Choisissez 'Enregistrer au format PDF'."
            : "Le document PDF a ete genere, mais le partage n'est pas disponible sur cet appareil.",
      );
    } catch (error) {
      console.error("[Itinerary PDF] Export error", error);
      Alert.alert(
        "Export impossible",
        error instanceof Error
          ? error.message
          : "Le PDF n'a pas pu etre exporte.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!itinerary) {
    return (
      <View className="flex-1 bg-[#f6f4eb] items-center justify-center px-6">
        <View className="bg-white rounded-3xl border border-[#e7e3d4] p-6 w-full">
          <Ionicons name="alert-circle-outline" size={34} color={colors.warningDark} />
          <Text className="text-xl font-heading-bold text-gray-900 mt-3">
            Resultat indisponible
          </Text>
          <Text className="text-sm font-sans text-gray-600 mt-2">
            {result.error ?? "Les parametres envoyes sont invalides."}
          </Text>
          <Button
            title="Retour au generateur"
            onPress={() => router.replace("/itineraire/generator" as Href)}
            className="mt-5"
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#f6f4eb]">
      <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-8">
        <View className="bg-[#1f8a49] rounded-[28px] p-5">
          <View className="flex-row items-center">
            <AnimatedPressable
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-white/20 items-center justify-center"
              hapticType="light"
            >
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </AnimatedPressable>

            <View className="ml-3 flex-1">
              <Text className="text-white text-xs uppercase tracking-widest font-sans-semibold">
                Itineraire calcule
              </Text>
              <Text className="text-white text-2xl font-heading-bold mt-1">
                {itinerary.cropName}
              </Text>
              <Text className="text-white/85 text-sm font-sans mt-1">
                {formatDoseValue(itinerary.areaM2)} m2 • {getMethodLabel(itinerary.method)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-[#fffdf8] border border-[#ece5cf] rounded-3xl p-5 mt-4">
          <Text className="text-xs uppercase tracking-widest font-sans-semibold text-[#8a6e2f]">
            Resume calcul
          </Text>
          <View className="mt-3 gap-2">
            <Text className="text-sm font-sans text-gray-700">
              Facteur applique: <Text className="font-sans-semibold">{formatDoseValue(itinerary.scaleFactor)}</Text>
            </Text>
            <Text className="text-sm font-sans text-gray-700">
              Base technique: <Text className="font-sans-semibold">{formatDoseValue(itinerary.baselineAreaM2)} m2</Text>
            </Text>
            <Text className="text-sm font-sans text-gray-700">
              Structure: <Text className="font-sans-semibold">{getScheduleLabel(itinerary.program.scheduleType)}</Text>
            </Text>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-xs uppercase tracking-widest font-sans-semibold text-[#6b5e3f] mb-3">
            Programme de fertilisation
          </Text>

          {itinerary.program.fertilization.map((step) => (
            <View
              key={step.id}
              className="bg-white border border-[#e7e3d4] rounded-2xl px-4 py-4 mb-3"
            >
              <Text className="text-base font-heading-semibold text-gray-900">
                {step.label}
              </Text>
              <Text className="text-xs font-sans text-gray-500 mt-0.5 mb-3">
                {getScheduleLabel(itinerary.program.scheduleType)}: {step.schedule}
              </Text>

              {step.doses.map((dose) => (
                <View
                  key={`${step.id}-${dose.product}`}
                  className="flex-row items-center justify-between py-2 border-b border-gray-100"
                >
                  <Text className="text-sm font-sans text-gray-700 flex-1 mr-3">
                    {dose.product}
                  </Text>
                  <Text className="text-sm font-sans-semibold text-[#14532d]">
                    {formatDoseValue(dose.scaledDose)} {dose.unit}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View className="mt-3">
          <Text className="text-xs uppercase tracking-widest font-sans-semibold text-[#6b5e3f] mb-3">
            Protocole phytosanitaire
          </Text>

          <View className="bg-white border border-[#e7e3d4] rounded-2xl px-4 py-4 mb-3">
            <Text className="text-sm font-sans text-gray-700">
              <Text className="font-sans-semibold">Preventif:</Text> {itinerary.program.phyto.frequency}
            </Text>
            <Text className="text-sm font-sans text-gray-700 mt-1">
              <Text className="font-sans-semibold">En cas d&apos;attaque:</Text> {itinerary.program.phyto.emergencyFrequency}
            </Text>
          </View>

          {itinerary.program.phyto.categories.map((category) => (
            <View
              key={category.id}
              className="bg-white border border-[#e7e3d4] rounded-2xl px-4 py-3 mb-2"
            >
              <Text className="text-sm font-sans-semibold text-gray-900">
                {category.label}
              </Text>
              <Text className="text-sm font-sans text-gray-700 mt-1">
                {category.products.join(" / ")}
              </Text>
              {category.notes && (
                <Text className="text-xs font-sans text-gray-500 mt-1">
                  {category.notes}
                </Text>
              )}
            </View>
          ))}

          <View className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mt-2">
            <Text className="text-xs font-sans text-amber-800">
              {itinerary.program.phyto.disclaimer}
            </Text>
          </View>
        </View>

        {(itinerary.program.notes?.length ?? 0) > 0 && (
          <View className="mt-5 bg-white border border-[#e7e3d4] rounded-2xl px-4 py-4">
            <Text className="text-sm font-sans-semibold text-gray-900 mb-2">
              Notes
            </Text>
            {itinerary.program.notes?.map((note) => (
              <Text key={note} className="text-sm font-sans text-gray-700 mb-1">
                • {note}
              </Text>
            ))}
          </View>
        )}

        <View className="mt-5 bg-white border border-[#e7e3d4] rounded-2xl px-4 py-4">
          <Text className="text-sm font-sans-semibold text-gray-900 mb-2">Sources</Text>
          {itinerary.sourcePdf.map((source) => (
            <Text key={source} className="text-sm font-sans text-gray-700 mb-1">
              • {source}
            </Text>
          ))}
        </View>

        <Button
          title="Telecharger le PDF"
          onPress={handleExportPdf}
          loading={isExporting}
          icon={<Ionicons name="download-outline" size={18} color="#fff" />}
          className="mt-6 min-h-[48px]"
        />
      </View>
    </ScrollView>
  );
}
