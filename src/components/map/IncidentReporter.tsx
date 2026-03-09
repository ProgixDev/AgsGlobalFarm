import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import FormInput from "@/components/ui/FormInput";
import {
  incidentCategories,
  getCategoryConfig,
  type IncidentCategoryConfig,
} from "@/data/incident-categories";
import { useMapStore } from "@/stores/mapStore";
import { useUserStore } from "@/stores/userStore";
import { findRegionAtPoint } from "@/utils/geo";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IncidentReporterProps {
  visible: boolean;
  onClose: () => void;
  initialCoordinates?: { longitude: number; latitude: number };
}

interface FormErrors {
  category?: string;
  customCategory?: string;
  title?: string;
  description?: string;
  severity?: string;
}

const SEVERITY_OPTIONS: {
  value: IncidentSeverity;
  label: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { value: "low", label: "Faible", color: "#10b981", icon: "leaf" },
  {
    value: "medium",
    label: "Moyen",
    color: "#f59e0b",
    icon: "alert-circle",
  },
  { value: "high", label: "Grave", color: "#ef4444", icon: "skull" },
];

// ── Main component ────────────────────────────────────────────────────────────

export function IncidentReporter({
  visible,
  onClose,
  initialCoordinates,
}: IncidentReporterProps) {
  // ── Stores ────────────────────────────────────────────────────────────────
  const addIncident = useMapStore((s) => s.addIncident);
  const currentUser = useUserStore((s) => s.currentUser);

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] =
    useState<IncidentCategory | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Reset form on close ───────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) {
      setSelectedCategory(null);
      setCustomCategory("");
      setTitle("");
      setDescription("");
      setSeverity(null);
      setImages([]);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [visible]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const categoryConfig = selectedCategory
    ? getCategoryConfig(selectedCategory)
    : null;
  const headerColor = categoryConfig?.color ?? "#ef4444";

  const regionName = useMemo(() => {
    if (!initialCoordinates) return null;
    const region = findRegionAtPoint(
      initialCoordinates.longitude,
      initialCoordinates.latitude,
    );
    return region?.properties.name ?? null;
  }, [initialCoordinates]);

  const isFormComplete =
    selectedCategory !== null &&
    title.trim().length >= 5 &&
    description.trim().length >= 10 &&
    severity !== null;

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedCategory) {
      newErrors.category = "Veuillez sélectionner un type d'incident";
    }
    if (selectedCategory === "other" && customCategory.trim().length < 3) {
      newErrors.customCategory =
        "Veuillez préciser le type d'incident (min. 3 caractères)";
    }
    if (title.trim().length < 5) {
      newErrors.title = "Le titre doit contenir au moins 5 caractères";
    }
    if (description.trim().length < 10) {
      newErrors.description =
        "La description doit contenir au moins 10 caractères";
    }
    if (!severity) {
      newErrors.severity = "Veuillez sélectionner un niveau de gravité";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedCategory, customCategory, title, description, severity]);

  // ── Image picker ──────────────────────────────────────────────────────────
  const pickImages = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 3));
    }
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    if (!selectedCategory || !severity) return;

    setIsSubmitting(true);

    // Simulate brief network delay
    await new Promise((r) => setTimeout(r, 600));

    addIncident({
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
      coordinates: initialCoordinates ?? {
        longitude: -14.4524,
        latitude: 14.4974,
      },
      images,
    });

    setIsSubmitting(false);
    onClose();
  }, [
    validate,
    selectedCategory,
    severity,
    customCategory,
    title,
    description,
    initialCoordinates,
    images,
    currentUser,
    addIncident,
    onClose,
  ]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatCoord = (val: number, pos: string, neg: string) => {
    const abs = Math.abs(val).toFixed(4);
    return `${abs}°${val >= 0 ? pos : neg}`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          {/* ── Drag handle ──────────────────────────────────────── */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          {/* ── Header ───────────────────────────────────────────── */}
          <View style={[styles.header, { backgroundColor: headerColor }]}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-white text-xl font-bold">
                  Signaler un incident
                </Text>
                <Text className="text-white/70 text-xs mt-1">
                  Aidez la communauté agricole en signalant les incidents
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="bg-white/20 rounded-full p-2"
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Scrollable form ──────────────────────────────────── */}
          <ScrollView
            className="px-5 py-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Category selector */}
            <SectionTitle title="Type d'incident" />
            <View className="flex-row flex-wrap mb-1">
              {incidentCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  selected={selectedCategory === cat.id}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setErrors((e) => ({ ...e, category: undefined }));
                  }}
                />
              ))}
            </View>
            {errors.category && (
              <Text className="text-red-500 text-sm mb-2">
                {errors.category}
              </Text>
            )}

            {/* Custom category input */}
            {selectedCategory === "other" && (
              <View className="mb-2">
                <FormInput
                  label="Précisez le type"
                  value={customCategory}
                  onChangeText={(t) => {
                    setCustomCategory(t);
                    setErrors((e) => ({ ...e, customCategory: undefined }));
                  }}
                  placeholder="Ex: Érosion des sols"
                  maxLength={60}
                  error={errors.customCategory}
                  required
                />
              </View>
            )}

            {/* 2. Title */}
            <SectionTitle title="Titre" />
            <FormInput
              label=""
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                setErrors((e) => ({ ...e, title: undefined }));
              }}
              placeholder="Ex: Invasion de criquets dans le champ de mil"
              maxLength={100}
              error={errors.title}
              containerClassName="mb-1"
            />

            {/* 3. Description */}
            <SectionTitle title="Description détaillée" />
            <FormInput
              label=""
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                setErrors((e) => ({ ...e, description: undefined }));
              }}
              placeholder="Décrivez l'incident, son étendue et ses effets..."
              maxLength={500}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              error={errors.description}
              containerClassName="mb-1"
            />
            <Text className="text-gray-400 text-xs text-right mb-5">
              {description.length}/500
            </Text>

            {/* 4. Severity */}
            <SectionTitle title="Niveau de gravité" />
            <View className="flex-row gap-2 mb-1">
              {SEVERITY_OPTIONS.map((opt) => {
                const isSelected = severity === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => {
                      setSeverity(opt.value);
                      setErrors((e) => ({ ...e, severity: undefined }));
                    }}
                    className="flex-1 flex-row items-center justify-center rounded-full py-2.5 px-3"
                    style={[
                      styles.severityPill,
                      {
                        backgroundColor: isSelected ? opt.color : "transparent",
                        borderColor: opt.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={16}
                      color={isSelected ? "white" : opt.color}
                    />
                    <Text
                      className="ml-1.5 font-semibold text-sm"
                      style={{ color: isSelected ? "white" : opt.color }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.severity && (
              <Text className="text-red-500 text-sm mt-1 mb-4">
                {errors.severity}
              </Text>
            )}
            {!errors.severity && <View className="mb-5" />}

            {/* 5. Location */}
            <SectionTitle title="Localisation" />
            <View
              className="rounded-xl p-3.5 flex-row items-center mb-6"
              style={{ backgroundColor: `${headerColor}15` }}
            >
              <View
                className="rounded-full p-2 mr-3"
                style={{ backgroundColor: `${headerColor}25` }}
              >
                <Ionicons name="location" size={18} color={headerColor} />
              </View>
              <View className="flex-1">
                {initialCoordinates ? (
                  <>
                    <Text
                      className="font-semibold text-sm"
                      style={{ color: headerColor }}
                    >
                      {regionName
                        ? `Région de ${regionName}`
                        : "Position signalée"}
                    </Text>
                    <Text
                      className="text-xs mt-0.5"
                      style={{ color: headerColor, opacity: 0.6 }}
                    >
                      {formatCoord(initialCoordinates.latitude, "N", "S")},{" "}
                      {formatCoord(initialCoordinates.longitude, "E", "W")}
                    </Text>
                  </>
                ) : (
                  <Text className="text-gray-400 text-sm italic">
                    Aucune position sélectionnée
                  </Text>
                )}
              </View>
            </View>

            {/* 6. Images */}
            <SectionTitle title="Photos (optionnel)" />
            <View className="mb-6">
              {/* Thumbnails row */}
              {images.length > 0 && (
                <View className="flex-row gap-3 mb-3">
                  {images.map((uri, index) => (
                    <View key={uri} className="relative">
                      <Image
                        source={{ uri }}
                        className="w-20 h-20 rounded-xl"
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                        style={styles.imageRemoveBtn}
                      >
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Add photos button */}
              {images.length < 3 && (
                <TouchableOpacity
                  onPress={pickImages}
                  className="flex-row items-center justify-center border border-dashed border-gray-300 rounded-xl py-3"
                >
                  <Ionicons name="camera" size={20} color="#9CA3AF" />
                  <Text className="text-gray-500 text-sm ml-2 font-medium">
                    Ajouter des photos
                  </Text>
                </TouchableOpacity>
              )}
              <Text className="text-gray-400 text-xs mt-1.5 text-right">
                {images.length}/3 photos
              </Text>
            </View>

            {/* 7. Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormComplete || isSubmitting}
              className="rounded-xl py-4 items-center mb-8"
              style={[
                {
                  backgroundColor: isFormComplete ? headerColor : "#d1d5db",
                },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Signaler l&apos;incident
                </Text>
              )}
            </TouchableOpacity>

            {/* Bottom spacer */}
            <View className="h-4" />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
      {title}
    </Text>
  );
}

function CategoryCard({
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
      className="w-[48%] mb-2"
      style={{ marginRight: "4%" }}
      // Ensure 2-col layout: every even card has no right margin
      // We use inline styles for the 48%/4% trick
    >
      <View
        className="bg-white rounded-xl p-3 items-center border-2 relative"
        style={{
          borderColor: selected ? category.color : "#f3f4f6",
        }}
      >
        {/* Icon circle */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Ionicons name={category.icon} size={20} color={category.color} />
        </View>
        <Text
          className="text-xs font-semibold text-center"
          style={{ color: selected ? category.color : "#374151" }}
          numberOfLines={2}
        >
          {category.label}
        </Text>

        {/* Checkmark badge */}
        {selected && (
          <View
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: category.color }}
          >
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  severityPill: {
    borderWidth: 2,
  },
  imageRemoveBtn: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
