import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Camera } from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "@/components/ui/FormInput";
import FormPicker from "@/components/ui/FormPicker";
import { senegalRegions } from "@/data/senegal-regions";
import {
  getDepartmentsByRegion,
  getMunicipalitiesByDepartment,
} from "@/data/agricultural-data";
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
  const [region, setRegion] = useState("");
  const [department, setDepartment] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [coordinates, setCoordinates] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  // Derived picker items
  const regionItems = senegalRegions.map((r) => ({
    label: r.properties.name,
    value: r.properties.id,
  }));

  const departmentItems = region
    ? getDepartmentsByRegion(region).map((d) => ({
        label: d.name,
        value: d.id,
      }))
    : [];

  const municipalityItems = department
    ? getMunicipalitiesByDepartment(department).map((m) => ({
        label: m,
        value: m,
      }))
    : [];

  const canSave = region && department && municipality && coordinates;

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

  // Reset department and municipality when region changes
  const handleRegionChange = useCallback((value: string) => {
    setRegion(value);
    setDepartment("");
    setMunicipality("");
  }, []);

  // Reset municipality when department changes
  const handleDepartmentChange = useCallback((value: string) => {
    setDepartment(value);
    setMunicipality("");
  }, []);

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
      region,
      department,
      municipality,
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
    region,
    department,
    municipality,
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
    setRegion(farmLocation.region);
    setDepartment(farmLocation.department);
    setMunicipality(farmLocation.municipality);
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
            // Reset form
            setFarmName("");
            setRegion("");
            setDepartment("");
            setMunicipality("");
            setCoordinates(null);
            setIsEditing(false);
          },
        },
      ],
    );
  }, [deleteFarmLocation]);

  // Find display names for saved location
  const getRegionName = (id: string) =>
    senegalRegions.find((r) => r.properties.id === id)?.properties.name || id;
  const getDepartmentName = (regionId: string, deptId: string) => {
    const allDepts = getDepartmentsByRegion(regionId);
    return allDepts.find((d) => d.id === deptId)?.name || deptId;
  };

  // ── State B: Farm saved, not editing ──
  if (farmLocation && !isEditing) {
    if (hidden) return null;
    return (
      <View className="absolute bottom-24 left-0 right-0 mx-4">
        <View className="bg-white rounded-t-3xl rounded-b-2xl shadow-2xl overflow-hidden">
          {/* Green header */}
          <View className="bg-emerald-500 px-5 py-3 flex-row items-center">
            <Ionicons name="home" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Ma Ferme
            </Text>
          </View>

          <View className="px-5 py-4">
            {/* Farm name */}
            <Text className="text-gray-800 font-bold text-lg">
              {farmLocation.name}
            </Text>

            {/* Location */}
            <View className="flex-row items-center mt-2">
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1 flex-1">
                {farmLocation.municipality},{" "}
                {getDepartmentName(
                  farmLocation.region,
                  farmLocation.department,
                )}
                , {getRegionName(farmLocation.region)}
              </Text>
            </View>

            {/* Coordinates */}
            <Text className="text-gray-400 text-xs mt-1">
              {farmLocation.coordinates.latitude.toFixed(4)}°N,{" "}
              {farmLocation.coordinates.longitude.toFixed(4)}°W
            </Text>

            {/* Buttons */}
            <View className="flex-row mt-4 gap-3">
              <TouchableOpacity
                onPress={handleEdit}
                className="flex-1 border border-emerald-500 rounded-xl py-3 flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={18} color="#10b981" />
                <Text className="text-emerald-500 font-semibold ml-1">
                  Modifier
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 border border-red-400 rounded-xl py-3 flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#f87171" />
                <Text className="text-red-400 font-semibold ml-1">
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ── State A: No farm saved, or editing ──
  if (hidden) return null;
  return (
    <View
      className="absolute bottom-0 left-0 right-0"
      style={{ maxHeight: "60%" }}
    >
      <View className="bg-white rounded-t-3xl shadow-2xl">
        <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="location" size={24} color="#10b981" />
            <Text className="text-lg font-bold text-gray-800 ml-2">
              {isEditing
                ? "Modifier votre exploitation"
                : "Localiser votre exploitation"}
            </Text>
          </View>

          {/* Farm name */}
          <FormInput
            label="Nom de l'exploitation"
            value={farmName}
            onChangeText={setFarmName}
            placeholder="Nom de l'exploitation"
          />

          {/* Region picker */}
          <FormPicker
            label="Région"
            value={region}
            onValueChange={handleRegionChange}
            items={regionItems}
            required
            placeholder="Sélectionner une région"
          />

          {/* Department picker */}
          <FormPicker
            label="Département"
            value={department}
            onValueChange={handleDepartmentChange}
            items={departmentItems}
            required
            enabled={region !== ""}
            placeholder="Sélectionner un département"
          />

          {/* Municipality picker */}
          <FormPicker
            label="Commune"
            value={municipality}
            onValueChange={setMunicipality}
            items={municipalityItems}
            required
            enabled={department !== ""}
            placeholder="Sélectionner une commune"
          />

          {/* Place on map button */}
          <TouchableOpacity
            onPress={handlePlaceOnMap}
            className="border border-emerald-500 rounded-xl py-3 flex-row items-center justify-center mb-3"
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={18} color="#10b981" />
            <Text className="text-emerald-500 font-semibold ml-2">
              Placer sur la carte
            </Text>
          </TouchableOpacity>

          {/* Coordinates display */}
          {coordinates && (
            <Text className="text-gray-400 text-xs text-center mb-3">
              Coordonnées : {coordinates.latitude.toFixed(4)}°N,{" "}
              {coordinates.longitude.toFixed(4)}°W
            </Text>
          )}

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            className={`rounded-xl py-3.5 flex-row items-center justify-center mb-6 ${
              canSave ? "bg-emerald-500" : "bg-gray-300"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Enregistrer
            </Text>
          </TouchableOpacity>

          {/* Cancel edit button */}
          {isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              className="rounded-xl py-3 flex-row items-center justify-center mb-6 border border-gray-300"
              activeOpacity={0.7}
            >
              <Text className="text-gray-500 font-semibold">Annuler</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
});
