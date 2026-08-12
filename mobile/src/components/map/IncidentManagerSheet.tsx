import React, { useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import FormInput from "@/components/ui/FormInput";
import SwipeableBottomSheet from "@/components/ui/SwipeableBottomSheet";
import { AnimatedPressable } from "@/components/animated";
import { useMapStore } from "@/stores/mapStore";
import { useUserStore } from "@/stores/userStore";
import {
  incidentCategories,
  getCategoryConfig,
  type IncidentCategoryConfig,
} from "@/data/incident-categories";
import IncidentCategoryIcon from "@/components/map/IncidentCategoryIcon";
import { findRegionAtPoint } from "@/utils/geo";
import { colors } from "@/theme/colors";
import { pickAndUploadImage } from "@/lib/api/upload";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { haptic } from "@/utils/haptics";

interface IncidentManagerSheetProps {
  visible?: boolean;
  onDismiss?: () => void;
  selectedIncident: IncidentReport | null;
  onSelectIncident: (incident: IncidentReport | null) => void;
  onCameraMove?: (coordinates: [number, number]) => void;
  coordinates?: { longitude: number; latitude: number };
  onEditLocation?: () => void;
  filteredIncidents: IncidentReport[];
  radiusKm: number;
  onChangeRadiusKm: (value: number) => void;
  radiusMode: "all_farms" | "selected_farm";
  onChangeRadiusMode: (mode: "all_farms" | "selected_farm") => void;
  hasFarms: boolean;
}

const SEVERITY_OPTIONS: {
  value: IncidentSeverity;
  label: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { value: "low", label: "Faible", color: colors.success, icon: "leaf" },
  {
    value: "medium",
    label: "Moyen",
    color: colors.warning,
    icon: "alert-circle",
  },
  { value: "high", label: "Grave", color: colors.danger, icon: "skull" },
];

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Grave",
};

function getTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 60) {
    return `Il y a ${Math.max(1, diffMin)} min`;
  }
  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }
  return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
}

export function IncidentManagerSheet({
  visible = true,
  onDismiss,
  selectedIncident,
  onSelectIncident,
  onCameraMove,
  coordinates,
  onEditLocation,
  filteredIncidents,
  radiusKm,
  onChangeRadiusKm,
  radiusMode,
  onChangeRadiusMode,
  hasFarms,
}: IncidentManagerSheetProps) {
  const addIncident = useMapStore((s) => s.addIncident);
  const resolveIncident = useMapStore((s) => s.resolveIncident);
  const currentUser = useUserStore((s) => s.currentUser);
  const { ensureAuth } = useRequireAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<IncidentCategory | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const regionName = useMemo(() => {
    if (!coordinates) return null;
    return findRegionAtPoint(coordinates.longitude, coordinates.latitude)
      ?.properties.name;
  }, [coordinates]);

  const resetForm = useCallback(() => {
    setSelectedCategory(null);
    setCustomCategory("");
    setTitle("");
    setDescription("");
    setSeverity(null);
    setImages([]);
    setSubmitError(null);
  }, []);

  const handlePickImage = useCallback(async () => {
    if (uploadingImage || images.length >= 3) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setSubmitError(
        "Autorisez l'accès aux photos pour ajouter une image.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (result.canceled || result.assets.length === 0) return;
    const localUri = result.assets[0].uri;
    setUploadingImage(true);
    setSubmitError(null);
    try {
      const upload = await pickAndUploadImage("ags/incidents", localUri);
      setImages((prev) => [...prev, upload.secureUrl]);
      haptic.success();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Échec de l'upload de la photo.";
      setSubmitError(message);
      haptic.error();
    } finally {
      setUploadingImage(false);
    }
  }, [uploadingImage, images.length]);

  const handleRemoveImage = useCallback((idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!selectedCategory) errors.push("Sélectionnez un type d'incident");
    if (
      selectedCategory === "other" &&
      customCategory.trim().length < 3
    )
      errors.push("Précisez le type (au moins 3 caractères)");
    if (title.trim().length < 5)
      errors.push("Titre trop court (5 caractères minimum)");
    if (description.trim().length < 10)
      errors.push("Description trop courte (10 caractères minimum)");
    if (!severity) errors.push("Choisissez la gravité");
    if (!coordinates)
      errors.push("Position GPS requise (toucher Repositionner)");
    return errors;
  }, [
    selectedCategory,
    customCategory,
    title,
    description,
    severity,
    coordinates,
  ]);

  const canSubmit = validationErrors.length === 0;

  const handleSubmit = useCallback(async () => {
    if (!selectedCategory || !severity || !coordinates) return;
    if (
      !ensureAuth({
        message: "Connectez-vous pour signaler un incident.",
      })
    )
      return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const region =
        findRegionAtPoint(coordinates.longitude, coordinates.latitude)
          ?.properties.name ?? undefined;

      await addIncident({
        reporterId: currentUser?.id ?? "anonymous",
        reporterName: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "Utilisateur anonyme",
        category: selectedCategory,
        customCategory:
          selectedCategory === "other" ? customCategory.trim() : undefined,
        title: title.trim(),
        description: description.trim(),
        severity,
        coordinates,
        region,
        images,
      });
      haptic.success();
      resetForm();
      setShowCreateForm(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur d'enregistrement.";
      setSubmitError(message);
      haptic.error();
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedCategory,
    severity,
    coordinates,
    ensureAuth,
    addIncident,
    currentUser,
    customCategory,
    title,
    description,
    images,
    resetForm,
  ]);

  return (
    <SwipeableBottomSheet
      visible={visible}
      onDismiss={onDismiss ?? (() => {})}
      expandedHeight={0.86}
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
              {filteredIncidents.length} incident
              {filteredIncidents.length > 1 ? "s" : ""} visible
              {filteredIncidents.length > 1 ? "s" : ""}
            </Text>
          </View>
          <Ionicons name="chevron-up" size={20} color={colors.muted} />
        </View>
      }
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-4 pt-1">
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.warning }}
          >
            <View className="px-4 pt-4 pb-3">
              <Text className="text-white text-xl font-heading-bold">
                Incidents agricoles
              </Text>
              <Text className="text-white/60 text-sm font-sans mt-1">
                Signaler et consulter dans un seul panneau
              </Text>
            </View>
          </View>
        </View>

        <View className="mx-5 mt-4">
          <Text className="text-sm font-heading-semibold text-gray-800 mb-2">
            Rayon de visibilité
          </Text>
          <View className="bg-white border border-gray-100 rounded-xl p-3">
            <View className="flex-row gap-2 mb-3">
              <TouchableOpacity
                onPress={() => onChangeRadiusMode("all_farms")}
                className="flex-1 rounded-full py-2 items-center"
                style={{
                  backgroundColor:
                    radiusMode === "all_farms"
                      ? colors.primary
                      : colors.borderLight,
                }}
              >
                <Text
                  className={`font-sans-semibold text-xs ${radiusMode === "all_farms" ? "text-white" : "text-gray-600"}`}
                >
                  Toutes mes fermes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onChangeRadiusMode("selected_farm")}
                className="flex-1 rounded-full py-2 items-center"
                style={{
                  backgroundColor:
                    radiusMode === "selected_farm"
                      ? colors.primary
                      : colors.borderLight,
                }}
              >
                <Text
                  className={`font-sans-semibold text-xs ${radiusMode === "selected_farm" ? "text-white" : "text-gray-600"}`}
                >
                  Ferme sélectionnée
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-gray-700 font-sans-semibold text-sm mb-1">
              {Math.round(radiusKm)} km
            </Text>
            <Slider
              minimumValue={5}
              maximumValue={100}
              step={1}
              value={radiusKm}
              onValueChange={(v) => onChangeRadiusKm(Math.round(v))}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primaryDark}
            />

            {!hasFarms && (
              <Text className="text-gray-500 font-sans text-xs mt-1">
                Aucune ferme enregistrée, tous les incidents sont affichés.
              </Text>
            )}
          </View>
        </View>

        <View className="mx-5 mt-4">
          <AnimatedPressable
            onPress={() => {
              setShowCreateForm((v) => !v);
              if (showCreateForm) resetForm();
            }}
            className="bg-danger rounded-xl py-3 flex-row items-center justify-center"
            style={{ backgroundColor: colors.danger }}
          >
            <Ionicons
              name={showCreateForm ? "close" : "add"}
              size={18}
              color={colors.white}
            />
            <Text className="text-white font-sans-bold ml-2">
              {showCreateForm ? "Fermer le formulaire" : "Signaler un incident"}
            </Text>
          </AnimatedPressable>
        </View>

        {showCreateForm && (
          <View className="mx-5 mt-4 bg-white rounded-2xl border border-gray-100 p-4">
            <Text className="text-sm font-heading-semibold text-gray-800 mb-3">
              Nouveau signalement
            </Text>

            <Text className="text-xs text-gray-500 font-sans mb-2">Type</Text>
            <View className="flex-row flex-wrap mb-2">
              {incidentCategories.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  category={cat}
                  selected={selectedCategory === cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                />
              ))}
            </View>

            {selectedCategory === "other" && (
              <FormInput
                label=""
                value={customCategory}
                onChangeText={setCustomCategory}
                placeholder="Précisez le type"
              />
            )}

            <FormInput
              label=""
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de l'incident"
            />

            <FormInput
              label=""
              value={description}
              onChangeText={setDescription}
              placeholder="Description détaillée"
              multiline={true}
              numberOfLines={4}
            />

            <Text className="text-xs text-gray-500 font-sans mt-1 mb-2">
              Gravité
            </Text>
            <View className="flex-row gap-2 mb-3">
              {SEVERITY_OPTIONS.map((opt) => {
                const selected = severity === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setSeverity(opt.value)}
                    className="flex-1 rounded-full py-2 items-center"
                    style={{
                      backgroundColor: selected
                        ? opt.color
                        : colors.borderLight,
                    }}
                  >
                    <Text
                      className={`font-sans-semibold text-xs ${selected ? "text-white" : "text-gray-600"}`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={onEditLocation}
              className="bg-amber-50 rounded-xl px-3 py-3 flex-row items-center mb-3"
            >
              <Ionicons name="locate" size={16} color={colors.warning} />
              <View className="flex-1 ml-2">
                <Text className="text-amber-800 font-sans-semibold text-xs">
                  {regionName ? `Région de ${regionName}` : "Position actuelle"}
                </Text>
                <Text className="text-amber-700/70 font-sans text-xs mt-0.5">
                  Appuyer pour repositionner sur la carte
                </Text>
              </View>
            </TouchableOpacity>

            <Text className="text-xs text-gray-500 font-sans mb-2">
              Photos (optionnel) — {images.length}/3
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {images.map((url, idx) => (
                <View
                  key={`${url}-${idx}`}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200"
                >
                  <Image source={{ uri: url }} style={{ flex: 1 }} />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                  >
                    <Ionicons name="close" size={12} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 3 && (
                <TouchableOpacity
                  onPress={handlePickImage}
                  disabled={uploadingImage}
                  className="w-20 h-20 rounded-xl border border-dashed border-gray-300 items-center justify-center bg-gray-50"
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name="camera-outline"
                      size={22}
                      color={colors.muted}
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {submitError && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-2">
                <Text className="text-red-700 text-xs font-sans">
                  {submitError}
                </Text>
              </View>
            )}

            {!canSubmit && validationErrors.length > 0 && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2">
                {validationErrors.map((msg) => (
                  <Text
                    key={msg}
                    className="text-amber-800 text-xs font-sans"
                  >
                    • {msg}
                  </Text>
                ))}
              </View>
            )}

            <AnimatedPressable
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`rounded-xl py-3 items-center ${
                canSubmit && !submitting ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text
                  className={`font-sans-bold ${canSubmit ? "text-white" : "text-gray-400"}`}
                >
                  Enregistrer le signalement
                </Text>
              )}
            </AnimatedPressable>
          </View>
        )}

        <View className="mx-5 mt-4">
          <Text className="text-sm font-heading-semibold text-gray-800 mb-2">
            Incidents actifs
          </Text>

          {filteredIncidents.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-3">
              <Text className="text-gray-500 text-sm font-sans">
                Aucun incident dans ce rayon.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {filteredIncidents.map((incident) => {
                const category = getCategoryConfig(incident.category);
                const isSelected = selectedIncident?.id === incident.id;

                return (
                  <TouchableOpacity
                    key={incident.id}
                    onPress={() => {
                      onSelectIncident(isSelected ? null : incident);
                      onCameraMove?.([
                        incident.coordinates.longitude,
                        incident.coordinates.latitude,
                      ]);
                    }}
                    className="bg-white border rounded-xl px-3 py-3"
                    style={{
                      borderColor: isSelected
                        ? category.color
                        : colors.borderLight,
                    }}
                    activeOpacity={0.75}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-800 font-sans-semibold text-sm">
                          {incident.title}
                        </Text>
                        <Text className="text-gray-500 font-sans text-xs mt-0.5">
                          {category.label} ·{" "}
                          {SEVERITY_LABELS[incident.severity]} ·{" "}
                          {getTimeAgo(incident.createdAt)}
                        </Text>
                      </View>
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: category.color }}
                      >
                        <IncidentCategoryIcon
                          icon={category.icon}
                          iconSet={category.iconSet}
                          size={16}
                          color={colors.white}
                        />
                      </View>
                    </View>

                    {isSelected && (
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <Text className="text-gray-700 font-sans text-sm leading-5">
                          {incident.description}
                        </Text>
                        <Text className="text-gray-400 font-sans text-xs mt-1">
                          Signalé par {incident.reporterName}
                        </Text>
                        {currentUser?.id === incident.reporterId && (
                          <TouchableOpacity
                            onPress={() => {
                              resolveIncident(incident.id);
                              onSelectIncident(null);
                            }}
                            className="mt-3 bg-emerald-500 rounded-lg py-2.5 items-center"
                          >
                            <Text className="text-white font-sans-semibold text-sm">
                              Marquer comme résolu
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SwipeableBottomSheet>
  );
}

function CategoryChip({
  category,
  selected,
  onPress,
}: {
  category: IncidentCategoryConfig;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="px-3 py-2 rounded-full mr-2 mb-2 flex-row items-center"
      style={{
        backgroundColor: selected ? category.color : colors.borderLight,
      }}
      activeOpacity={0.75}
    >
      <IncidentCategoryIcon
        icon={category.icon}
        iconSet={category.iconSet}
        size={13}
        color={selected ? colors.white : colors.muted}
      />
      <Text
        className={`text-xs ml-1.5 font-sans-medium ${selected ? "text-white" : "text-gray-600"}`}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );
}
