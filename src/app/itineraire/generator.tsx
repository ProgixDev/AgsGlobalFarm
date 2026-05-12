import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { z } from "zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedPressable from "@/components/animated/AnimatedPressable";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import CropPickerSheet from "@/components/itineraire/CropPickerSheet";
import {
  getTechnicalItineraryById,
  technicalItineraries,
} from "@/data/itineraries";
import { itineraryGeneratorSchema } from "@/schemas/validation";
import { useItineraryStore } from "@/stores/itineraryStore";
import { TAB_BAR_HEIGHT } from "@/components/ui/FloatingTabBar";
import { calculateScaledItinerary, formatArea } from "@/utils/itinerary-calc";
import {
  buildPdfFileName,
  generatePdf,
  pdfFileExists,
} from "@/utils/itinerary-pdf";
import { colors } from "@/theme/colors";
import { haptic } from "@/utils/haptics";

function parseAreaInput(input: string) {
  return Number(input.replaceAll(" ", "").replace(",", "."));
}

function mapValidationErrors(error: z.ZodError): ItineraryGeneratorFormErrors {
  const next: ItineraryGeneratorFormErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof ItineraryGeneratorFormErrors;
    if (!next[field]) next[field] = issue.message;
  }
  return next;
}

const cropOptions = technicalItineraries.map((item) => ({
  id: item.id,
  cropName: item.cropName,
  emoji: item.emoji,
  tagline: item.tagline,
  cultivationNote: item.cultivationNote,
}));

export default function ItineraryGeneratorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const history = useItineraryStore((state) => state.history);
  const addHistory = useItineraryStore((state) => state.addHistory);
  const updateHistoryPdf = useItineraryStore((state) => state.updateHistoryPdf);

  const [formData, setFormData] = useState<ItineraryGeneratorFormData>({
    cropId: "",
    areaM2: "",
  });
  const [errors, setErrors] = useState<ItineraryGeneratorFormErrors>({});
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const selectedCrop = useMemo(
    () => (formData.cropId ? getTechnicalItineraryById(formData.cropId) : null),
    [formData.cropId],
  );

  const updateField = <K extends keyof ItineraryGeneratorFormData>(
    field: K,
    value: ItineraryGeneratorFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleGenerate = async () => {
    const validation = itineraryGeneratorSchema.safeParse(formData);
    if (!validation.success) {
      setErrors(mapValidationErrors(validation.error));
      haptic.error();
      return;
    }

    const validated = validation.data;
    const areaM2 = parseAreaInput(validated.areaM2);
    const definition = getTechnicalItineraryById(validated.cropId);

    if (!definition) {
      setErrors({ cropId: "Culture introuvable." });
      return;
    }

    setSubmitting(true);

    try {
      const provisionalFileName = buildPdfFileName(definition.cropName, areaM2);
      const provisional = addHistory({
        cropId: definition.id,
        cropName: definition.cropName,
        emoji: definition.emoji,
        areaM2,
        pdfUri: null,
        pdfFileName: provisionalFileName,
        savedToDownloads: false,
      });

      const itinerary = calculateScaledItinerary({
        cropId: definition.id,
        areaM2,
      });

      const pdf = await generatePdf(itinerary);
      updateHistoryPdf(provisional.id, pdf.uri, pdf.savedToDownloads);

      haptic.success();
      router.push({
        pathname: "/itineraire/results",
        params: { entryId: provisional.id },
      } as unknown as Href);
    } catch (error) {
      haptic.error();
      console.error("[itinerary] generation failed", error);
      Alert.alert(
        "Génération impossible",
        error instanceof Error
          ? error.message
          : "Le PDF n'a pas pu être généré.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reuseEntry = (entry: ItineraryHistoryEntry) => {
    haptic.selection();
    if (pdfFileExists(entry.pdfUri)) {
      router.push({
        pathname: "/itineraire/results",
        params: { entryId: entry.id },
      } as unknown as Href);
    } else {
      updateField("cropId", entry.cropId);
      updateField("areaM2", String(entry.areaM2));
    }
  };

  const recentHistory = history.slice(0, 5);

  return (
    <>
      <ScrollView
        className="flex-1 bg-[#f6f4eb]"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 32,
        }}
      >
        <View className="px-5">
          <View className="flex-row items-center mb-5">
            <AnimatedPressable
              onPress={() => router.back()}
              className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-white border border-[#e7e3d4]"
              hapticType="light"
            >
              <Ionicons name="arrow-back" size={20} color="#1f8a49" />
              <Text className="text-[#1f8a49] font-sans-bold text-base">
                Retour
              </Text>
            </AnimatedPressable>
            <View className="ml-3 flex-1">
              <Text className="text-[11px] font-sans-semibold uppercase tracking-widest text-[#8a6e2f]">
                Outil terrain
              </Text>
              <Text className="text-2xl font-heading-bold text-gray-900 mt-0.5">
                Générateur d&apos;itinéraire
              </Text>
            </View>
          </View>

          <View className="bg-[#1f8a49] rounded-3xl px-5 py-5 mb-5">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-white/15 items-center justify-center mr-3">
                <Ionicons name="leaf" size={22} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-heading-bold">
                  Programme personnalisé en quelques secondes
                </Text>
                <Text className="text-white/85 text-xs font-sans mt-1">
                  Doses de fertilisation et protocole phyto adaptés à votre
                  superficie. PDF téléchargeable.
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white border border-[#e7e3d4] rounded-3xl p-5 mb-5">
            <Text className="text-[11px] font-sans-semibold uppercase tracking-widest text-[#8a6e2f] mb-3">
              Paramètres de calcul
            </Text>

            <Text className="text-sm font-sans-medium text-gray-700 mb-2">
              Culture <Text className="text-danger">*</Text>
            </Text>
            <AnimatedPressable
              onPress={() => {
                haptic.light();
                setPickerOpen(true);
              }}
              className={`flex-row items-center bg-white border rounded-2xl px-4 py-3 mb-1 ${
                errors.cropId ? "border-danger" : "border-[#d9d2bd]"
              }`}
              hapticType="none"
            >
              {selectedCrop ? (
                <>
                  <Text className="text-2xl mr-3">{selectedCrop.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-heading-semibold text-gray-900">
                      {selectedCrop.cropName}
                    </Text>
                    <Text className="text-xs font-sans text-[#8a6e2f] mt-0.5">
                      {selectedCrop.cultivationNote}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View className="w-10 h-10 rounded-xl bg-[#fdf9ea] items-center justify-center mr-3">
                    <Ionicons
                      name="leaf-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <Text className="flex-1 text-base font-sans text-gray-400">
                    Choisir une culture
                  </Text>
                </>
              )}
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.mutedLight}
              />
            </AnimatedPressable>
            {errors.cropId && (
              <Text className="text-danger text-xs font-sans mt-1 mb-3">
                {errors.cropId}
              </Text>
            )}

            <View className="mt-4">
              <FormInput
                label="Superficie (m²)"
                required
                value={formData.areaM2}
                onChangeText={(value) => updateField("areaM2", value)}
                placeholder="Ex : 500, 1000, 2500"
                keyboardType={
                  Platform.OS === "ios" ? "decimal-pad" : "number-pad"
                }
                error={errors.areaM2}
              />
            </View>

            <View className="bg-[#fdf9ea] border border-[#ece5cf] rounded-2xl px-4 py-3 mb-4">
              <Text className="text-[11px] font-sans-semibold uppercase tracking-wider text-[#8a6e2f]">
                Base de référence
              </Text>
              <Text className="text-sm font-sans text-gray-700 mt-1">
                Programme calibré pour 1 000 m². Les doses sont multipliées
                proportionnellement à votre superficie.
              </Text>
            </View>

            <Button
              title={isSubmitting ? "Génération…" : "Générer mon itinéraire"}
              onPress={handleGenerate}
              loading={isSubmitting}
              icon={
                !isSubmitting ? (
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#fff"
                  />
                ) : undefined
              }
              className="min-h-[52px]"
            />
          </View>

          {recentHistory.length > 0 && (
            <View>
              <View className="flex-row items-center justify-between mb-3 px-1">
                <Text className="text-[11px] font-sans-semibold uppercase tracking-widest text-[#6b5e3f]">
                  Derniers calculs
                </Text>
                <Text className="text-[11px] font-sans text-gray-500">
                  Touchez pour rouvrir
                </Text>
              </View>

              <View className="gap-2">
                {recentHistory.map((entry) => {
                  const fileAvailable = pdfFileExists(entry.pdfUri);
                  return (
                    <AnimatedPressable
                      key={entry.id}
                      onPress={() => reuseEntry(entry)}
                      className="flex-row items-center bg-white border border-[#ece5cf] rounded-2xl px-4 py-3"
                      hapticType="none"
                    >
                      <Text className="text-2xl mr-3">{entry.emoji}</Text>
                      <View className="flex-1">
                        <Text className="text-base font-heading-semibold text-gray-900">
                          {entry.cropName}
                        </Text>
                        <Text className="text-xs font-sans text-gray-500 mt-0.5">
                          {formatArea(entry.areaM2)} •{" "}
                          {new Date(entry.generatedAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </Text>
                      </View>
                      <View
                        className={`px-2.5 py-1 rounded-full ${
                          fileAvailable
                            ? "bg-emerald-50 border border-emerald-200"
                            : "bg-[#fdf9ea] border border-[#ece5cf]"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-sans-semibold uppercase tracking-wider ${
                            fileAvailable
                              ? "text-emerald-700"
                              : "text-[#8a6e2f]"
                          }`}
                        >
                          {fileAvailable ? "PDF" : "Recalc."}
                        </Text>
                      </View>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <CropPickerSheet
        visible={isPickerOpen}
        options={cropOptions}
        selectedId={formData.cropId}
        onSelect={(id) => updateField("cropId", id)}
        onDismiss={() => setPickerOpen(false)}
      />
    </>
  );
}
