import React, { useState, useRef, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Mapbox, {
  MapView,
  Camera,
  PointAnnotation,
  ShapeSource,
  VectorSource,
  FillLayer,
  LineLayer,
} from "@rnmapbox/maps";
import type { FeatureCollection, Feature, Polygon } from "geojson";
import { Ionicons } from "@expo/vector-icons";
import {
  senegalCenter,
  senegalRegions,
  getRegionColor,
  regionAgriData,
  type SenegalRegion,
} from "@/data/senegal-regions";
import { getDepartmentsByRegion } from "@/data/agricultural-data";
import {
  RegionExplorer,
  type SelectedRegion,
} from "@/components/map/RegionExplorer";
import {
  FarmLocationSelector,
  type FarmLocationSelectorHandle,
} from "@/components/map/FarmLocationSelector";
import { IncidentMarkers } from "@/components/map/IncidentMarkers";
import { useMapStore } from "@/stores/mapStore";

// Set Mapbox access token
Mapbox.setAccessToken(
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_ACCESS_TOKEN",
);

// Calculate Senegal bounds from center and deltas
const SENEGAL_BOUNDS = {
  ne: [
    senegalCenter.longitude + senegalCenter.longitudeDelta / 2,
    senegalCenter.latitude + senegalCenter.latitudeDelta / 2,
  ],
  sw: [
    senegalCenter.longitude - senegalCenter.longitudeDelta / 2,
    senegalCenter.latitude - senegalCenter.latitudeDelta / 2,
  ],
};

// Mapbox match expression to color each region fill differently
function buildColorExpression(fallback: string): any[] {
  const expr: any[] = ["match", ["get", "id"]];
  for (const region of senegalRegions) {
    expr.push(region.properties.id, getRegionColor(region.properties.id));
  }
  expr.push(fallback);
  return expr;
}

// Ray-casting point-in-polygon test
function pointInPolygon(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

// Find which region contains a given coordinate
function findRegionAtPoint(lng: number, lat: number): SenegalRegion | null {
  for (const region of senegalRegions) {
    const ring = region.geometry.coordinates[0];
    if (pointInPolygon(lng, lat, ring)) {
      return region;
    }
  }
  return null;
}

type MapMode = "explorer" | "farm" | "incidents";

const MAP_MODES: {
  key: MapMode;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { key: "explorer", label: "Explorer", icon: "location-outline" },
  { key: "farm", label: "Ma Ferme", icon: "home-outline" },
  { key: "incidents", label: "Incidents", icon: "alert-circle-outline" },
];

export default function MapScreen() {
  const cameraRef = useRef<Camera>(null);
  const farmSelectorRef = useRef<FarmLocationSelectorHandle>(null);
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("explorer");
  const [pinMode, setPinMode] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    senegalCenter.longitude,
    senegalCenter.latitude,
  ]);

  const [selectedIncident, setSelectedIncident] =
    useState<IncidentReport | null>(null);

  const { farmLocation } = useMapStore();

  // GeoJSON for clickable region fills (tap detection)
  const regionsGeoJSON = useMemo<FeatureCollection<Polygon>>(
    () => ({
      type: "FeatureCollection",
      features: senegalRegions as unknown as Feature<Polygon>[],
    }),
    [],
  );

  const colorExpression = useMemo(() => buildColorExpression("#95A5A6"), []);

  // Handle map tap — uses JS point-in-polygon for reliable region detection
  const handleMapPress = useCallback(
    (event: any) => {
      if (mapMode !== "explorer" || pinMode) return;

      const coords = event?.geometry?.coordinates;
      if (!coords || coords.length < 2) return;
      const [lng, lat] = coords;

      const region = findRegionAtPoint(lng, lat);
      if (!region) return;

      const { id, name, capital, population } = region.properties;
      const departments = getDepartmentsByRegion(id).map((d) => d.name);

      setSelectedRegion({
        id,
        name,
        capital,
        population,
        agriInfo: regionAgriData[id] ?? null,
        departments,
        color: getRegionColor(id),
      });
      setModalVisible(true);
    },
    [mapMode, pinMode],
  );

  // Handle camera region changes to enforce bounds + track center
  const handleCameraChanged = (state: any) => {
    if (!state?.properties?.center) return;
    const [lng, lat] = state.properties.center;

    // Track map center for pin placement
    setMapCenter([lng, lat]);

    const isOutOfBounds =
      lng < SENEGAL_BOUNDS.sw[0] ||
      lng > SENEGAL_BOUNDS.ne[0] ||
      lat < SENEGAL_BOUNDS.sw[1] ||
      lat > SENEGAL_BOUNDS.ne[1];
    if (isOutOfBounds && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [senegalCenter.longitude, senegalCenter.latitude],
        zoomLevel: 6.5,
        animationDuration: 500,
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header area: title + mode switcher */}
      <View className="absolute top-12 left-4 right-4 z-10">
        {/* Senegal header row */}
        <View className="bg-white rounded-2xl px-5 py-4 shadow-2xl flex-row items-center">
          <Ionicons name="location" size={24} color="#10b981" />
          <Text className="text-lg font-bold text-gray-800 ml-2">Sénégal</Text>
        </View>

        {/* Mode switcher — disabled during pin placement */}
        {!pinMode && (
          <View className="bg-white rounded-2xl mt-2 px-2 py-2 shadow-lg flex-row items-center">
            {MAP_MODES.map((mode) => {
              const isActive = mapMode === mode.key;
              return (
                <TouchableOpacity
                  key={mode.key}
                  onPress={() => setMapMode(mode.key)}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-2.5 ${
                    isActive ? "bg-emerald-500" : ""
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={mode.icon}
                    size={16}
                    color={isActive ? "white" : "#4b5563"}
                  />
                  <Text
                    className={`text-xs font-semibold ml-1 ${
                      isActive ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/light-v11"
        compassEnabled={true}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        onCameraChanged={handleCameraChanged}
        onPress={handleMapPress}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [senegalCenter.longitude, senegalCenter.latitude],
            zoomLevel: 6.5,
            padding: {
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 100,
              paddingBottom: 100,
            },
          }}
          minZoomLevel={5.5}
          maxZoomLevel={12}
          maxBounds={{
            ne: SENEGAL_BOUNDS.ne,
            sw: SENEGAL_BOUNDS.sw,
          }}
        />

        {/* Senegal country boundary fill + outer border */}
        <VectorSource
          id="countries"
          url="mapbox://mapbox.country-boundaries-v1"
        >
          <FillLayer
            id="country-fill"
            sourceLayerID="country_boundaries"
            filter={[
              "all",
              ["==", ["get", "iso_3166_1"], "SN"],
              ["==", ["get", "disputed"], "false"],
              [
                "any",
                ["==", "all", ["get", "worldview"]],
                ["in", "US", ["get", "worldview"]],
              ],
            ]}
            style={{ fillColor: "#10b981", fillOpacity: 0.15 }}
          />
          <LineLayer
            id="country-outline"
            sourceLayerID="country_boundaries"
            filter={[
              "all",
              ["==", ["get", "iso_3166_1"], "SN"],
              ["==", ["get", "disputed"], "false"],
              [
                "any",
                ["==", "all", ["get", "worldview"]],
                ["in", "US", ["get", "worldview"]],
              ],
            ]}
            style={{ lineColor: "#059669", lineWidth: 2 }}
          />
        </VectorSource>

        {/* Per-region colored fills */}
        <ShapeSource id="senegal-regions" shape={regionsGeoJSON}>
          <FillLayer
            id="region-fill"
            style={{
              fillColor: colorExpression as any,
              fillOpacity: [
                "case",
                ["==", ["get", "id"], selectedRegion?.id ?? ""],
                0.65,
                0.35,
              ],
            }}
          />
        </ShapeSource>

        {/* Accurate wilaya borders from Mapbox Streets tileset */}
        <VectorSource
          id="senegal-wilayas"
          url="mapbox://mapbox.mapbox-streets-v8"
        >
          <LineLayer
            id="wilaya-borders"
            sourceLayerID="admin"
            filter={[
              "all",
              ["==", ["get", "admin_level"], 1],
              ["==", ["get", "iso_3166_1"], "SN"],
              ["==", ["get", "disputed"], "false"],
              [
                "any",
                ["==", "all", ["get", "worldview"]],
                ["in", "US", ["get", "worldview"]],
              ],
            ]}
            style={{ lineColor: "#ffffff", lineWidth: 1.5, lineOpacity: 0.9 }}
          />
        </VectorSource>

        {/* Farm location marker */}
        {farmLocation && (
          <PointAnnotation
            id="farm-marker"
            coordinate={[
              farmLocation.coordinates.longitude,
              farmLocation.coordinates.latitude,
            ]}
          >
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: "#10b981",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Ionicons name="home" size={20} color="white" />
              </View>
            </View>
          </PointAnnotation>
        )}

        {/* Incident markers */}
        {mapMode === "incidents" && (
          <IncidentMarkers
            onMarkerPress={setSelectedIncident}
            selectedIncidentId={selectedIncident?.id}
          />
        )}
      </MapView>

      {/* Pin placement crosshair overlay */}
      {pinMode && (
        <>
          {/* Centered crosshair */}
          <View
            className="absolute"
            style={styles.crosshairContainer}
            pointerEvents="none"
          >
            <Ionicons name="locate" size={48} color="#10b981" />
          </View>

          {/* Instruction banner */}
          <View className="absolute top-32 left-4 right-4 z-20">
            <View className="bg-white rounded-2xl px-5 py-3 shadow-lg">
              <Text className="text-gray-700 text-sm text-center font-medium">
                Déplacez la carte pour positionner votre ferme
              </Text>
            </View>
          </View>

          {/* Confirm / Cancel buttons */}
          <View className="absolute bottom-28 left-4 right-4 z-20 flex-row gap-3">
            <TouchableOpacity
              onPress={() => farmSelectorRef.current?.cancelPin()}
              className="flex-1 bg-gray-200 rounded-xl py-3.5 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-gray-600 font-semibold text-base">
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => farmSelectorRef.current?.confirmPin()}
              className="flex-1 bg-emerald-500 rounded-xl py-3.5 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-base">Confirmer</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Mode-specific overlays */}
      {mapMode === "farm" && (
        <FarmLocationSelector
          ref={farmSelectorRef}
          cameraRef={cameraRef}
          onPinModeChange={setPinMode}
          mapCenter={mapCenter}
          hidden={pinMode}
        />
      )}

      {/* Region explorer modal (only in explorer mode) */}
      {mapMode === "explorer" && (
        <RegionExplorer
          selectedRegion={selectedRegion}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  map: { flex: 1 },
  crosshairContainer: {
    top: "50%",
    left: "50%",
    marginTop: -24,
    marginLeft: -24,
  },
});
