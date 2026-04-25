import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { z } from "zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedPressable from "@/components/animated/AnimatedPressable";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import FormPicker from "@/components/ui/FormPicker";
import {
  getTechnicalItineraryById,
  getTechnicalItineraryOptions,
  itineraryMethodOptions,
} from "@/data/itineraries";
import { itineraryGeneratorSchema } from "@/schemas/validation";
import { useItineraryStore } from "@/stores/itineraryStore";
import { colors } from "@/theme/colors";
import { haptic } from "@/utils/haptics";

function parseAreaInput(input: string) {
  return Number(input.replaceAll(" ", "").replace(",", "."));
}

function mapValidationErrors(error: z.ZodError): ItineraryGeneratorFormErrors {
  const nextErrors: ItineraryGeneratorFormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as keyof ItineraryGeneratorFormErrors;
    if (!nextErrors[field]) {
      nextErrors[field] = issue.message;
    }
  }

  return nextErrors;
}

export default function ItineraryGeneratorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const history = useItineraryStore((state) => state.history);
  const addHistory = useItineraryStore((state) => state.addHistory);

  const cropOptions = useMemo(() => getTechnicalItineraryOptions(), []);

  const [formData, setFormData] = useState<ItineraryGeneratorFormData>({
    cropId: "",
    areaM2: "",
    method: "",
  });
  const [errors, setErrors] = useState<ItineraryGeneratorFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof ItineraryGeneratorFormData>(
    field: K,
    value: ItineraryGeneratorFormData[K],
  ) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleGenerate = () => {
    setIsSubmitting(true);

    const validationResult = itineraryGeneratorSchema.safeParse(formData);

    if (!validationResult.success) {
      setErrors(mapValidationErrors(validationResult.error));
      setIsSubmitting(false);
      return;
    }

    const validatedData = validationResult.data;
    const areaM2 = parseAreaInput(validatedData.areaM2);
    const itinerary = getTechnicalItineraryById(validatedData.cropId);

    if (!itinerary) {
      setErrors({ cropId: "Culture introuvable dans les donnees" });
      setIsSubmitting(false);
      return;
    }

    addHistory({
      cropId: itinerary.id,
      cropName: itinerary.cropName,
      areaM2,
      method: validatedData.method,
    });

    haptic.success();
    router.push(
      {
        pathname: "/itineraire/results",
        params: {
          cropId: validatedData.cropId,
          areaM2: String(areaM2),
          method: validatedData.method,
        },
      } as unknown as Href,
    );

    setIsSubmitting(false);
  };

  const applyHistory = (entry: ItineraryHistoryEntry) => {
    updateField("cropId", entry.cropId);
    updateField("areaM2", String(entry.areaM2));
    updateField("method", entry.method);
    haptic.selection();
  };

  return (
    <ScrollView className="flex-1 bg-[#f6f4eb]">
      <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-8">
        <View className="bg-[#1f8a49] rounded-[28px] p-5">
          <View className="flex-row items-center justify-between">
            <AnimatedPressable
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-white/20 items-center justify-center"
              hapticType="light"
            >
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </AnimatedPressable>
            <View className="ml-3 flex-1">
              <Text className="text-white text-xs uppercase tracking-widest font-sans-semibold">
                Outil terrain
              </Text>
              <Text className="text-white text-xl font-heading-bold mt-1">
                Generateur d&apos;itineraire
              </Text>
              <Text className="text-white/80 text-sm font-sans mt-1">
                Calculez instantanement vos doses selon votre superficie.
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white border border-[#e7e3d4] rounded-3xl p-5 mt-4">
          <Text className="text-sm font-sans-semibold uppercase tracking-wide text-[#8a6e2f] mb-1">
            Parametres de calcul
          </Text>
          <Text className="text-base font-sans text-gray-600 mb-4">
            Base de reference: 1000 m2
          </Text>

          <FormPicker
            label="Culture"
            required
            value={formData.cropId}
            onValueChange={(value) => updateField("cropId", value)}
            items={cropOptions}
            placeholder="Choisir une culture"
            error={errors.cropId}
          />

          <FormInput
            label="Superficie (m2)"
            required
            value={formData.areaM2}
            onChangeText={(value) => updateField("areaM2", value)}
            placeholder="Ex: 500, 1000, 2500"
            keyboardType="decimal-pad"
            error={errors.areaM2}
          />

          <FormPicker
            label="Mode de culture"
            required
            value={formData.method}
            onValueChange={(value) =>
              updateField(
                "method",
                value as ItineraryGeneratorFormData["method"],
              )
            }
            items={itineraryMethodOptions}
            placeholder="Choisir le mode"
            error={errors.method}
          />

          <Button
            title="Generer mon itineraire"
            onPress={handleGenerate}
            loading={isSubmitting}
            icon={<Ionicons name="calculator-outline" size={18} color="#fff" />}
            className="mt-2 min-h-[48px]"
          />
        </View>

        {history.length > 0 && (
          <View className="mt-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs uppercase tracking-widest font-sans-semibold text-[#6b5e3f]">
                Derniers calculs
              </Text>
              <Text className="text-xs font-sans text-gray-500">
                Touchez pour reutiliser
              </Text>
            </View>

            <View className="gap-2">
              {history.slice(0, 4).map((entry) => (
                <AnimatedPressable
                  key={entry.id}
                  className="bg-[#fffdf8] border border-[#ece5cf] rounded-2xl px-4 py-3"
                  onPress={() => applyHistory(entry)}
                  hapticType="selection"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-sans-semibold text-gray-800">
                      {entry.cropName}
                    </Text>
                    <Text className="text-xs font-sans text-gray-500">
                      {new Date(entry.generatedAt).toLocaleDateString("fr-FR")}
                    </Text>
                  </View>
                  <Text className="text-sm font-sans text-[#6b5e3f] mt-1">
                    {entry.areaM2} m2 • {entry.method === "serre" ? "Serre" : "Plein champ"}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
