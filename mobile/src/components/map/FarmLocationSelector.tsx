import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Camera } from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "@/components/ui/FormInput";
import FormPicker from "@/components/ui/FormPicker";
import SwipeableBottomSheet from "@/components/ui/SwipeableBottomSheet";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { findRegionAtPoint } from "@/utils/geo";
import { calculatePolygonSurfaceHectares } from "@/utils/farm-geometry";
import { useMapStore } from "@/stores/mapStore";
import { useUserStore } from "@/stores/userStore";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";

interface FarmLocationSelectorProps {
  cameraRef: React.RefObject<Camera | null>;
  onPointPinModeChange: (active: boolean) => void;
  onPolygonDrawModeChange: (active: boolean) => void;
  onDismiss?: () => void;
  mapCenter: [number, number];
  polygonPoints: [number, number][];
  selectedFarmId: string | null;
  onSelectFarm: (farmId: string | null) => void;
  expandTrigger?: string | number | null;
  minimizeTrigger?: string | number | null;
  hidden?: boolean;
  visible?: boolean;
}

export interface FarmLocationSelectorHandle {
  confirmPointPin: () => void;
  cancelPointPin: () => void;
  confirmPolygon: () => void;
  cancelPolygon: () => void;
  removeLastPolygonPoint: () => void;
}

function getLocationLabel(coords: { longitude: number; latitude: number }) {
  const region = findRegionAtPoint(coords.longitude, coords.latitude);
  return region?.properties.name ?? "Position enregistrée";
}

function getPolygonCenter(points: { longitude: number; latitude: number }[]) {
  if (points.length === 0) return null;
  const totals = points.reduce(
    (acc, p) => ({
      longitude: acc.longitude + p.longitude,
      latitude: acc.latitude + p.latitude,
    }),
    { longitude: 0, latitude: 0 },
  );
  return {
    longitude: totals.longitude / points.length,
    latitude: totals.latitude / points.length,
  };
}

function distanceKm(
  a: { longitude: number; latitude: number },
  b: { longitude: number; latitude: number },
) {
  const r = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const AREA_OPTIONS: { label: string; value: FarmArea }[] = [
  { label: "Moins de 1 ha", value: "less_1ha" },
  { label: "1 hectare", value: "1ha" },
  { label: "2 hectares", value: "2ha" },
  { label: "Autre", value: "other" },
];

const FARM_TYPE_OPTIONS: { label: string; value: FarmType }[] = [
  { label: "Maraîcher", value: "maraicher" },
  { label: "Avicole", value: "avicole" },
  { label: "Fruitier", value: "fruitier" },
  { label: "Élevage", value: "elevage" },
  { label: "Agroécologie", value: "agroecologie" },
  { label: "Céréaliculture", value: "cerealiculture" },
  { label: "Aquaculture", value: "aquaculture" },
  { label: "Autre", value: "autre" },
];

const AREA_LABELS: Record<FarmArea, string> = {
  less_1ha: "< 1 ha",
  "1ha": "1 ha",
  "2ha": "2 ha",
  other: "Autre",
};

export const FarmLocationSelector = forwardRef<
  FarmLocationSelectorHandle,
  FarmLocationSelectorProps
>(function FarmLocationSelector(
  {
    cameraRef,
    onPointPinModeChange,
    onPolygonDrawModeChange,
    onDismiss,
    mapCenter,
    polygonPoints,
    selectedFarmId,
    onSelectFarm,
    expandTrigger,
    minimizeTrigger,
    hidden = false,
    visible = true,
  },
  ref,
) {
  const {
    farmLocations,
    addFarmLocation,
    updateFarmLocation,
    deleteFarmLocation,
    incidents,
  } = useMapStore();
  const { currentUser } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);

  const {
    loading: gpsLoading,
    error: gpsError,
    requestLocation,
    reset: resetGpsError,
  } = useDeviceLocation();
  const [gpsCaptured, setGpsCaptured] = useState(false);

  const [farmName, setFarmName] = useState("");
  const [locationMode, setLocationMode] = useState<"point" | "polygon">(
    "point",
  );
  const [coordinates, setCoordinates] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [boundaryCoordinates, setBoundaryCoordinates] = useState<
    { longitude: number; latitude: number }[]
  >([]);
  const [area, setArea] = useState<FarmArea | "">("");
  const [farmType, setFarmType] = useState<FarmType | "">("");
  const [currentCrops, setCurrentCrops] = useState("");
  const [contact, setContact] = useState("");
  const [hidePersonalInfo, setHidePersonalInfo] = useState(false);

  const drawingPolygon = polygonPoints.length > 0;
  const canSave =
    locationMode === "point" ? !!coordinates : boundaryCoordinates.length >= 3;

  const editingFarm = useMemo(
    () => farmLocations.find((farm) => farm.id === editingFarmId) ?? null,
    [farmLocations, editingFarmId],
  );

  const resetForm = useCallback(() => {
    setFarmName("");
    setLocationMode("point");
    setCoordinates(null);
    setBoundaryCoordinates([]);
    setArea("");
    setFarmType("");
    setCurrentCrops("");
    setContact("");
    setHidePersonalInfo(false);
    setGpsCaptured(false);
    resetGpsError();
    setEditingFarmId(null);
    setIsEditing(false);
    setShowForm(false);
  }, [resetGpsError]);

  const handleUseGps = useCallback(async () => {
    resetGpsError();
    const coords = await requestLocation();
    if (!coords) {
      haptic.error();
      return;
    }
    haptic.success();
    setCoordinates(coords);
    setLocationMode("point");
    setGpsCaptured(true);
    onPointPinModeChange(false);
    onPolygonDrawModeChange(false);
    cameraRef.current?.setCamera({
      centerCoordinate: [coords.longitude, coords.latitude],
      zoomLevel: 14,
      animationDuration: 800,
    });
  }, [
    cameraRef,
    onPointPinModeChange,
    onPolygonDrawModeChange,
    requestLocation,
    resetGpsError,
  ]);

  const handlePlacePoint = useCallback(() => {
    onPointPinModeChange(true);
  }, [onPointPinModeChange]);

  const handleDrawPolygon = useCallback(() => {
    onPolygonDrawModeChange(true);
    setBoundaryCoordinates([]);
  }, [onPolygonDrawModeChange]);

  const confirmPointPin = useCallback(() => {
    setCoordinates({ longitude: mapCenter[0], latitude: mapCenter[1] });
    setLocationMode("point");
    setGpsCaptured(false);
    onPointPinModeChange(false);
  }, [mapCenter, onPointPinModeChange]);

  const cancelPointPin = useCallback(() => {
    onPointPinModeChange(false);
  }, [onPointPinModeChange]);

  const confirmPolygon = useCallback(() => {
    if (polygonPoints.length < 3) return;
    setBoundaryCoordinates(
      polygonPoints.map(([longitude, latitude]) => ({ longitude, latitude })),
    );
    setLocationMode("polygon");
    onPolygonDrawModeChange(false);
  }, [polygonPoints, onPolygonDrawModeChange]);

  const cancelPolygon = useCallback(() => {
    onPolygonDrawModeChange(false);
  }, [onPolygonDrawModeChange]);

  const removeLastPolygonPoint = useCallback(() => {
    if (polygonPoints.length < 1) return;
    setBoundaryCoordinates(
      polygonPoints
        .slice(0, -1)
        .map(([longitude, latitude]) => ({ longitude, latitude })),
    );
  }, [polygonPoints]);

  useImperativeHandle(
    ref,
    () => ({
      confirmPointPin,
      cancelPointPin,
      confirmPolygon,
      cancelPolygon,
      removeLastPolygonPoint,
    }),
    [
      confirmPointPin,
      cancelPointPin,
      confirmPolygon,
      cancelPolygon,
      removeLastPolygonPoint,
    ],
  );

  const handleSave = useCallback(() => {
    if (!canSave) return;

    const now = new Date().toISOString();
    const id = editingFarm?.id ?? `farm-${Date.now()}`;

    const farmData: FarmLocation = {
      id,
      remoteId: editingFarm?.remoteId,
      userId: currentUser?.id || "anonymous",
      name: farmName || "Ma Ferme",
      geometryType: locationMode,
      coordinates:
        locationMode === "point" && coordinates ? coordinates : undefined,
      boundaryCoordinates:
        locationMode === "polygon" ? boundaryCoordinates : undefined,
      surfaceHectares:
        locationMode === "polygon"
          ? calculatePolygonSurfaceHectares(boundaryCoordinates)
          : undefined,
      area: area || undefined,
      farmType: farmType || undefined,
      currentCrops: currentCrops || undefined,
      contact: contact || undefined,
      hidePersonalInfo,
      gpsCaptured: locationMode === "point" ? gpsCaptured : undefined,
      createdAt: editingFarm?.createdAt || now,
      updatedAt: now,
    };

    if (isEditing && editingFarm) {
      void updateFarmLocation(farmData);
    } else {
      void addFarmLocation(farmData);
    }

    onSelectFarm(id);

    resetForm();
  }, [
    canSave,
    editingFarm,
    currentUser,
    farmName,
    locationMode,
    coordinates,
    boundaryCoordinates,
    area,
    farmType,
    currentCrops,
    contact,
    hidePersonalInfo,
    gpsCaptured,
    isEditing,
    updateFarmLocation,
    addFarmLocation,
    onSelectFarm,
    resetForm,
  ]);

  const handleEdit = useCallback((farm: FarmLocation) => {
    setEditingFarmId(farm.id);
    setIsEditing(true);
    setShowForm(true);
    setFarmName(farm.name);
    setLocationMode(farm.geometryType);
    setCoordinates(farm.coordinates ?? null);
    setBoundaryCoordinates(farm.boundaryCoordinates ?? []);
    setArea(farm.area ?? "");
    setFarmType(farm.farmType ?? "");
    setCurrentCrops(farm.currentCrops ?? "");
    setContact(farm.contact ?? "");
    setHidePersonalInfo(farm.hidePersonalInfo ?? false);
    setGpsCaptured(farm.gpsCaptured ?? false);
  }, []);

  const handleDelete = useCallback(
    (farmId: string) => {
      Alert.alert(
        "Supprimer la ferme",
        "Êtes-vous sûr de vouloir supprimer cette exploitation ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: () => {
              void deleteFarmLocation(farmId);
              if (editingFarmId === farmId) {
                resetForm();
              }
            },
          },
        ],
      );
    },
    [deleteFarmLocation, editingFarmId, resetForm],
  );

  const handleFocusFarm = useCallback(
    (farm: FarmLocation) => {
      const center =
        farm.geometryType === "point"
          ? farm.coordinates
          : getPolygonCenter(farm.boundaryCoordinates ?? []);
      if (!center || !cameraRef.current) return;

      cameraRef.current.setCamera({
        centerCoordinate: [center.longitude, center.latitude],
        zoomLevel: 11,
        animationDuration: 800,
      });
    },
    [cameraRef],
  );

  const selectedFarm = useMemo(
    () => farmLocations.find((farm) => farm.id === selectedFarmId) ?? null,
    [farmLocations, selectedFarmId],
  );

  const selectedFarmCenter = useMemo(() => {
    if (!selectedFarm) return null;
    if (selectedFarm.geometryType === "point") {
      return selectedFarm.coordinates ?? null;
    }
    return getPolygonCenter(selectedFarm.boundaryCoordinates ?? []);
  }, [selectedFarm]);

  const nearbyIncidents = useMemo(() => {
    if (!selectedFarmCenter) return [];
    return [...incidents]
      .filter(
        (incident) =>
          distanceKm(selectedFarmCenter, incident.coordinates) <= 35,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [incidents, selectedFarmCenter]);

  if (hidden) return null;

  return (
    <SwipeableBottomSheet
      visible={visible}
      onDismiss={() => {
        onPointPinModeChange(false);
        onPolygonDrawModeChange(false);
        onDismiss?.();
      }}
      expandedHeight={0.88}
      minimizedHeight={90}
      initialState="minimized"
      showBackdrop={false}
      expandTrigger={expandTrigger}
      minimizeTrigger={minimizeTrigger}
      minimizedContent={
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <Ionicons name="home" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-heading-bold text-gray-800">
              Mes exploitations
            </Text>
            <Text className="text-xs font-sans text-muted-foreground">
              {farmLocations.length} exploitation
              {farmLocations.length > 1 ? "s" : ""}
            </Text>
          </View>
          <Ionicons name="chevron-up" size={20} color={colors.muted} />
        </View>
      }
    >
      <View className="px-4 pt-1">
        {!showForm ? (
          <AnimatedPressable
            onPress={() => {
              setIsEditing(false);
              setEditingFarmId(null);
              setShowForm(true);
            }}
            className="rounded-xl py-3.5 items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-sans-bold text-sm">
              + Ajouter une exploitation
            </Text>
          </AnimatedPressable>
        ) : (
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.primary }}
          >
            <View className="px-4 pt-4 pb-3">
              <Text className="text-white text-xl font-heading-bold">
                {isEditing
                  ? "Modifier une exploitation"
                  : "Ajouter une exploitation"}
              </Text>
              <Text className="text-white/60 text-sm font-sans mt-1">
                Point ou limite dessinée sur la carte
              </Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View className="mx-5 mt-4">
          <SectionHeader icon="list" title="Mes exploitations" />
          {farmLocations.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-3">
              <Text className="text-gray-500 text-sm font-sans">
                Aucune exploitation enregistrée pour le moment.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {farmLocations.map((farm) => {
                const center =
                  farm.geometryType === "point"
                    ? farm.coordinates
                    : getPolygonCenter(farm.boundaryCoordinates ?? []);
                const regionLabel = center ? getLocationLabel(center) : "";

                const isSelected = selectedFarmId === farm.id;
                return (
                  <TouchableOpacity
                    key={farm.id}
                    onPress={() => {
                      onSelectFarm(farm.id);
                      handleFocusFarm(farm);
                    }}
                    activeOpacity={0.75}
                    className="bg-white border rounded-xl px-3 py-3"
                    style={{
                      borderColor: isSelected
                        ? colors.primary
                        : colors.borderLight,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-800 font-sans-semibold text-sm">
                          {farm.name}
                        </Text>
                        <Text className="text-gray-500 font-sans text-xs mt-0.5">
                          {regionLabel || "Position enregistrée"} ·{" "}
                          {farm.geometryType === "point"
                            ? "Point"
                            : "Limite dessinée"}
                        </Text>
                        {farm.area && (
                          <Text className="text-gray-400 font-sans text-xs mt-0.5">
                            {AREA_LABELS[farm.area]}
                          </Text>
                        )}
                        {farm.surfaceHectares &&
                          farm.geometryType === "polygon" && (
                            <Text className="text-gray-500 font-sans text-xs mt-0.5">
                              Surface estimée: {farm.surfaceHectares.toFixed(2)}{" "}
                              ha
                            </Text>
                          )}
                      </View>
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          onPress={() => handleFocusFarm(farm)}
                          className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-1"
                        >
                          <Ionicons
                            name="locate-outline"
                            size={16}
                            color={colors.primaryDark}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleEdit(farm)}
                          className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-1"
                        >
                          <Ionicons
                            name="create-outline"
                            size={16}
                            color={colors.info}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            haptic.warning();
                            handleDelete(farm.id);
                          }}
                          className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={colors.danger}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {selectedFarm && selectedFarmCenter && (
          <View className="mx-5 mt-4">
            <SectionHeader icon="information-circle" title="Détails" />
            <View className="bg-white border border-gray-100 rounded-xl p-3">
              <Text className="text-gray-800 font-sans-semibold text-sm">
                {selectedFarm.name}
              </Text>
              <Text className="text-gray-500 font-sans text-xs mt-0.5">
                {getLocationLabel(selectedFarmCenter)}
              </Text>
              {selectedFarm.surfaceHectares &&
                selectedFarm.geometryType === "polygon" && (
                  <Text className="text-gray-600 font-sans text-xs mt-1">
                    Surface estimée: {selectedFarm.surfaceHectares.toFixed(2)}{" "}
                    ha
                  </Text>
                )}

              <View className="mt-3 pt-3 border-t border-gray-100">
                <Text className="text-gray-700 font-sans-semibold text-xs mb-1">
                  Incidents récents à proximité
                </Text>
                {nearbyIncidents.length === 0 ? (
                  <Text className="text-gray-400 font-sans text-xs">
                    Aucun incident récent à moins de 35 km.
                  </Text>
                ) : (
                  nearbyIncidents.map((incident) => (
                    <View
                      key={incident.id}
                      className="flex-row items-center justify-between py-1"
                    >
                      <Text
                        className="text-gray-600 font-sans text-xs flex-1 mr-2"
                        numberOfLines={1}
                      >
                        {incident.title}
                      </Text>
                      <Text className="text-gray-400 font-sans text-[11px]">
                        {incident.status === "active" ? "Actif" : "Résolu"}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        )}

        {showForm && (
          <>
            <View className="mx-5 mt-4">
              <SectionHeader icon="business" title="Nom de l'exploitation" />
              <FormInput
                label=""
                value={farmName}
                onChangeText={setFarmName}
                placeholder="Ex: Ferme de Thiès"
              />
            </View>

            <View className="mx-5 mt-2">
              <SectionHeader icon="leaf" title="Type de ferme" />
              <FormPicker
                label=""
                value={farmType}
                onValueChange={(v) => setFarmType(v as FarmType | "")}
                items={FARM_TYPE_OPTIONS}
                placeholder="Sélectionner le type..."
              />
            </View>

            <View className="mx-5 mt-2">
              <SectionHeader icon="resize" title="Superficie" />
              <FormPicker
                label=""
                value={area}
                onValueChange={(v) => setArea(v as FarmArea | "")}
                items={AREA_OPTIONS}
                placeholder="Sélectionner la superficie..."
              />
            </View>

            <View className="mx-5 mt-2">
              <SectionHeader icon="nutrition" title="Cultures en cours" />
              <FormInput
                label=""
                value={currentCrops}
                onChangeText={setCurrentCrops}
                placeholder="Ex: Tomates, oignons, mil..."
              />
            </View>

            <View className="mx-5 mt-2">
              <SectionHeader icon="call" title="Contact" />
              <FormInput
                label=""
                value={contact}
                onChangeText={setContact}
                placeholder="Ex: +221 77 123 45 67"
                keyboardType="phone-pad"
              />
            </View>

            <View className="mx-5 mt-4">
              <SectionHeader icon="location" title="Emplacement" />

              <TouchableOpacity
                onPress={handleUseGps}
                disabled={gpsLoading}
                className="rounded-xl py-3 items-center mb-3 flex-row justify-center"
                style={{
                  backgroundColor: gpsLoading
                    ? colors.borderLight
                    : colors.primaryDark,
                }}
                activeOpacity={0.75}
              >
                {gpsLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="navigate" size={16} color={colors.white} />
                )}
                <Text className="text-white font-sans-bold text-sm ml-2">
                  {gpsLoading
                    ? "Localisation en cours..."
                    : "Utiliser ma position GPS"}
                </Text>
              </TouchableOpacity>

              {gpsError && (
                <View className="bg-red-50 rounded-xl p-3 border border-red-200 mb-3">
                  <Text className="text-red-700 font-sans-semibold text-sm">
                    {gpsError.message}
                  </Text>
                  <TouchableOpacity
                    onPress={handleUseGps}
                    className="mt-2 self-start rounded-lg px-3 py-1.5"
                    style={{ backgroundColor: colors.danger }}
                  >
                    <Text className="text-white font-sans-semibold text-xs">
                      Réessayer
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                  onPress={handlePlacePoint}
                  className="flex-1 rounded-xl py-3 items-center"
                  style={{
                    backgroundColor:
                      locationMode === "point"
                        ? colors.primary
                        : colors.borderLight,
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    className={`font-sans-semibold text-xs ${
                      locationMode === "point" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    Placer un point sur la carte
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDrawPolygon}
                  className="flex-1 rounded-xl py-3 items-center"
                  style={{
                    backgroundColor:
                      locationMode === "polygon"
                        ? colors.primary
                        : colors.borderLight,
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    className={`font-sans-semibold text-xs ${
                      locationMode === "polygon"
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Dessiner la limite
                  </Text>
                </TouchableOpacity>
              </View>

              {locationMode === "point" && coordinates && (
                <View className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                  <View className="flex-row items-center">
                    <Text className="text-emerald-800 font-sans-semibold text-sm flex-1">
                      {getLocationLabel(coordinates)}
                    </Text>
                    {gpsCaptured && (
                      <View className="flex-row items-center bg-emerald-100 rounded-full px-2 py-0.5">
                        <Ionicons
                          name="navigate"
                          size={11}
                          color={colors.primaryDark}
                        />
                        <Text className="text-emerald-800 text-[11px] font-sans-semibold ml-1">
                          GPS
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-emerald-600/70 text-xs font-sans mt-0.5">
                    {coordinates.latitude.toFixed(5)}°N,{" "}
                    {coordinates.longitude.toFixed(5)}°W
                  </Text>
                </View>
              )}

              {locationMode === "polygon" && (
                <View className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <Text className="text-amber-800 font-sans-semibold text-sm">
                    {drawingPolygon
                      ? `Dessin en cours: ${polygonPoints.length} point${polygonPoints.length > 1 ? "s" : ""}`
                      : `Limite enregistrée: ${boundaryCoordinates.length} point${boundaryCoordinates.length > 1 ? "s" : ""}`}
                  </Text>
                  <Text className="text-amber-700/80 text-xs font-sans mt-0.5">
                    Minimum 3 points pour enregistrer la limite.
                  </Text>
                </View>
              )}
            </View>

            <View className="mx-5 mt-5">
              <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-3">
                  <Ionicons
                    name="eye-off-outline"
                    size={18}
                    color={colors.muted}
                  />
                  <Text className="text-gray-700 font-sans-medium text-sm ml-2">
                    Masquer mes informations personnelles
                  </Text>
                </View>
                <Switch
                  value={hidePersonalInfo}
                  onValueChange={setHidePersonalInfo}
                  trackColor={{
                    false: colors.border,
                    true: colors.primaryLight,
                  }}
                  thumbColor={
                    hidePersonalInfo ? colors.primary : colors.mutedLight
                  }
                />
              </View>
            </View>

            <View className="mx-5 mt-6">
              <AnimatedPressable
                onPress={handleSave}
                disabled={!canSave}
                className={`rounded-xl py-4 flex-row items-center justify-center mb-3 ${
                  canSave ? "bg-emerald-500" : "bg-gray-200"
                }`}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={canSave ? colors.white : colors.mutedLight}
                />
                <Text
                  className={`font-sans-bold text-base ml-2 ${canSave ? "text-white" : "text-gray-400"}`}
                >
                  {isEditing ? "Mettre à jour" : "Enregistrer"}
                </Text>
              </AnimatedPressable>

              {(isEditing ||
                farmName ||
                coordinates ||
                boundaryCoordinates.length > 0) && (
                <AnimatedPressable
                  onPress={resetForm}
                  className="bg-gray-200 rounded-xl py-3 flex-row items-center justify-center"
                >
                  <Text className="text-gray-600 font-sans-semibold">
                    Annuler
                  </Text>
                </AnimatedPressable>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SwipeableBottomSheet>
  );
});

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
}) {
  return (
    <View className="flex-row items-center mb-3">
      <View
        className="w-7 h-7 rounded-lg items-center justify-center mr-2"
        style={{ backgroundColor: colors.primaryLight }}
      >
        <Ionicons name={icon} size={14} color={colors.primary} />
      </View>
      <Text className="text-sm font-heading-semibold text-gray-800">
        {title}
      </Text>
    </View>
  );
}
