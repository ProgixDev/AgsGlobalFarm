import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { Camera } from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "@/components/ui/FormInput";
import SwipeableBottomSheet from "@/components/ui/SwipeableBottomSheet";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { findRegionAtPoint } from "@/utils/geo";
import { useMapStore } from "@/stores/mapStore";
import { useUserStore } from "@/stores/userStore";

interface FarmLocationSelectorProps {
  cameraRef: React.RefObject<Camera | null>;
  onPinModeChange: (active: boolean) => void;
  mapCenter: [number, number];
  hidden?: boolean;
}

export interface FarmLocationSelectorHandle {
  confirmPin: () => void;
  cancelPin: () => void;
}

/** Derive a display location string from coordinates using region polygons. */
function getLocationLabel(coords: { longitude: number; latitude: number }) {
  const region = findRegionAtPoint(coords.longitude, coords.latitude);
  return region?.properties.name ?? "Position enregistrée";
}

export const FarmLocationSelector = forwardRef<
  FarmLocationSelectorHandle,
  FarmLocationSelectorProps
>(function FarmLocationSelector(
  { cameraRef, onPinModeChange, mapCenter, hidden = false },
  ref,
) {
  const {
    farmLocation,
    setFarmLocation,
    updateFarmLocation,
    deleteFarmLocation,
  } = useMapStore();
  const { currentUser } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [farmName, setFarmName] = useState("");
  const [coordinates, setCoordinates] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  const canSave = !!coordinates;

  // Zoom to farm location when it exists and we're not editing
  useEffect(() => {
    if (farmLocation && !isEditing && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [
          farmLocation.coordinates.longitude,
          farmLocation.coordinates.latitude,
        ],
        zoomLevel: 10,
        animationDuration: 1000,
      });
    }
  }, [farmLocation, isEditing, cameraRef]);

  // Enter pin placement mode
  const handlePlaceOnMap = useCallback(() => {
    onPinModeChange(true);
  }, [onPinModeChange]);

  // Confirm pin placement — called from parent via ref
  const confirmPin = useCallback(() => {
    setCoordinates({
      longitude: mapCenter[0],
      latitude: mapCenter[1],
    });
    onPinModeChange(false);
  }, [mapCenter, onPinModeChange]);

  // Cancel pin placement
  const cancelPin = useCallback(() => {
    onPinModeChange(false);
  }, [onPinModeChange]);

  // Expose confirm/cancel to parent via ref
  useImperativeHandle(ref, () => ({ confirmPin, cancelPin }), [
    confirmPin,
    cancelPin,
  ]);

  // Save farm location
  const handleSave = useCallback(() => {
    if (!canSave) return;

    const now = new Date().toISOString();
    const farmData: FarmLocation = {
      id: farmLocation?.id || `farm-${Date.now()}`,
      userId: currentUser?.id || "anonymous",
      name: farmName || "Ma Ferme",
      coordinates: coordinates!,
      createdAt: farmLocation?.createdAt || now,
      updatedAt: now,
    };

    if (isEditing && farmLocation) {
      updateFarmLocation(farmData);
    } else {
      setFarmLocation(farmData);
    }
    setIsEditing(false);
  }, [
    canSave,
    farmName,
    coordinates,
    currentUser,
    farmLocation,
    isEditing,
    setFarmLocation,
    updateFarmLocation,
  ]);

  // Enter edit mode with existing data
  const handleEdit = useCallback(() => {
    if (!farmLocation) return;
    setFarmName(farmLocation.name);
    setCoordinates(farmLocation.coordinates);
    setIsEditing(true);
  }, [farmLocation]);

  // Delete with confirmation
  const handleDelete = useCallback(() => {
    Alert.alert(
      "Supprimer la ferme",
      "Êtes-vous sûr de vouloir supprimer votre exploitation ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            deleteFarmLocation();
            setFarmName("");
            setCoordinates(null);
            setIsEditing(false);
          },
        },
      ],
    );
  }, [deleteFarmLocation]);

  // ── State B: Farm saved, not editing ──
  if (farmLocation && !isEditing) {
    if (hidden) return null;
    return (
      <View className="absolute bottom-24 left-0 right-0 mx-4">
        <View className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <View className="bg-emerald-500 px-5 py-3.5 flex-row items-center">
            <View className="bg-white/20 rounded-full p-1.5">
              <Ionicons name="home" size={16} color="white" />
            </View>
            <Text className="text-white font-bold text-base ml-2.5 flex-1">
              {farmLocation.name}
            </Text>
          </View>

          <View className="px-5 py-4">
            {/* Location card */}
            <View className="bg-emerald-50 rounded-xl p-3.5 flex-row items-center">
              <View className="bg-emerald-100 rounded-full p-2 mr-3">
                <Ionicons
                  name="location"
                  size={18}
                  color={colors.primaryDark}
                />
              </View>
              <View className="flex-1">
                <Text className="text-emerald-800 font-semibold text-sm">
                  {getLocationLabel(farmLocation.coordinates)}
                </Text>
                <Text className="text-emerald-600/70 text-xs mt-0.5">
                  {farmLocation.coordinates.latitude.toFixed(4)}°N,{" "}
                  {farmLocation.coordinates.longitude.toFixed(4)}°W
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View className="flex-row mt-4 gap-3">
              <AnimatedPressable
                onPress={handleEdit}
                hapticType="selection"
                className="flex-1 bg-emerald-50 rounded-xl py-3 flex-row items-center justify-center"
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={colors.primaryDark}
                />
                <Text className="text-emerald-700 font-semibold ml-1.5">
                  Modifier
                </Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() => {
                  haptic.warning();
                  handleDelete();
                }}
                hapticType="none"
                className="flex-1 bg-red-50 rounded-xl py-3 flex-row items-center justify-center"
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text className="text-red-600 font-semibold ml-1.5">
                  Supprimer
                </Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ── State A: No farm saved, or editing ──
  return (
    <SwipeableBottomSheet
      visible={!hidden}
      onDismiss={() => {
        if (isEditing) setIsEditing(false);
      }}
      expandedHeight={0.55}
      minimizedHeight={80}
      showBackdrop={false}
      minimizedContent={
        <View className="flex-row items-center">
          <View className="bg-primary/10 rounded-full p-2 mr-3">
            <Ionicons name="location" size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-800">
              {isEditing
                ? "Modifier votre exploitation"
                : "Localiser votre exploitation"}
            </Text>
            <Text className="text-xs text-muted-foreground">
              Placez votre ferme sur la carte
            </Text>
          </View>
        </View>
      }
    >
      <ScrollView
        className="px-5 pt-2 pb-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Farm name */}
        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Nom de l&apos;exploitation
        </Text>
        <FormInput
          label=""
          value={farmName}
          onChangeText={setFarmName}
          placeholder="Ex: Ferme de Thiès"
          containerClassName="mb-4"
        />

        {/* Location section */}
        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Emplacement
        </Text>

        {coordinates ? (
          /* Pin placed — green confirmation card */
          <View className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200">
            <View className="flex-row items-center">
              <View className="bg-emerald-500 rounded-full p-1.5 mr-3">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-emerald-800 font-semibold text-sm">
                  {getLocationLabel(coordinates)}
                </Text>
                <Text className="text-emerald-600/70 text-xs mt-0.5">
                  {coordinates.latitude.toFixed(4)}°N,{" "}
                  {coordinates.longitude.toFixed(4)}°W
                </Text>
              </View>
            </View>
            <AnimatedPressable
              onPress={handlePlaceOnMap}
              className="mt-3 flex-row items-center justify-center border border-emerald-300 rounded-lg py-2"
            >
              <Ionicons name="refresh" size={14} color={colors.primaryDark} />
              <Text className="text-emerald-700 font-medium text-xs ml-1.5">
                Repositionner
              </Text>
            </AnimatedPressable>
          </View>
        ) : (
          /* No pin yet — dashed prompt card */
          <AnimatedPressable onPress={handlePlaceOnMap} className="mb-4">
            <View className="border-2 border-dashed border-gray-300 rounded-xl py-6 items-center">
              <View className="bg-gray-100 rounded-full p-3 mb-2">
                <Ionicons name="map-outline" size={28} color="#9ca3af" />
              </View>
              <Text className="text-gray-600 font-semibold text-sm">
                Placer sur la carte
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                Touchez pour positionner votre ferme
              </Text>
            </View>
          </AnimatedPressable>
        )}

        {/* Save button */}
        <AnimatedPressable
          onPress={handleSave}
          disabled={!canSave}
          className={`rounded-xl py-4 flex-row items-center justify-center mb-4 ${
            canSave ? "bg-emerald-500" : "bg-gray-200"
          }`}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={canSave ? "white" : "#9ca3af"}
          />
          <Text
            className={`font-bold text-base ml-2 ${canSave ? "text-white" : "text-gray-400"}`}
          >
            Enregistrer
          </Text>
        </AnimatedPressable>

        {/* Cancel edit button */}
        {isEditing && (
          <AnimatedPressable
            onPress={() => setIsEditing(false)}
            className="rounded-xl py-3 flex-row items-center justify-center mb-4"
          >
            <Text className="text-gray-500 font-semibold">Annuler</Text>
          </AnimatedPressable>
        )}
      </ScrollView>
    </SwipeableBottomSheet>
  );
});
