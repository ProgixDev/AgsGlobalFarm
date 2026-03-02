import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import Mapbox, {
  MapView,
  Camera,
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
  type RegionAgriInfo,
  type SenegalRegion,
} from "@/data/senegal-regions";
import { getDepartmentsByRegion } from "@/data/agricultural-data";

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
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
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

interface SelectedRegion {
  id: string;
  name: string;
  capital: string;
  population?: number;
  agriInfo: RegionAgriInfo | null;
  departments: string[];
  color: string;
}

export default function MapScreen() {
  const cameraRef = useRef<Camera>(null);
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

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
  const handleMapPress = useCallback((event: any) => {
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
  }, []);

  // Handle camera region changes to enforce bounds
  const handleCameraChanged = (state: any) => {
    if (!state?.properties?.center) return;
    const [lng, lat] = state.properties.center;
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
      <View className="absolute top-12 left-4 right-4 z-10">
        <View className="bg-white rounded-2xl px-5 py-4 shadow-2xl flex-row items-center">
          <Ionicons name="location" size={24} color="#10b981" />
          <Text className="text-lg font-bold text-gray-800 ml-2">Sénégal</Text>
        </View>
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
        <ShapeSource
          id="senegal-regions"
          shape={regionsGeoJSON}
        >
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
      </MapView>

      {/* Region info bottom sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedRegion && (
              <>
                {/* Coloured header */}
                <View
                  style={[
                    styles.regionHeader,
                    { backgroundColor: selectedRegion.color },
                  ]}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-white text-2xl font-bold">
                        {selectedRegion.name}
                      </Text>
                      <Text className="text-white/80 text-sm mt-0.5">
                        Capitale : {selectedRegion.capital}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="bg-white/20 rounded-full p-2"
                    >
                      <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                  {selectedRegion.population && (
                    <View className="flex-row items-center mt-3 bg-white/20 rounded-xl px-3 py-1.5 self-start">
                      <Ionicons name="people" size={14} color="white" />
                      <Text className="text-white text-sm ml-1.5 font-medium">
                        {selectedRegion.population.toLocaleString("fr-FR")} hab.
                      </Text>
                    </View>
                  )}
                </View>

                <ScrollView
                  className="px-5 py-4"
                  showsVerticalScrollIndicator={false}
                >
                  {selectedRegion.agriInfo && (
                    <>
                      {/* Climate */}
                      <InfoSection
                        icon="partly-sunny"
                        title="Climat & Pluviométrie"
                        color={selectedRegion.color}
                      >
                        <InfoRow
                          label="Climat"
                          value={selectedRegion.agriInfo.climate}
                        />
                        <InfoRow
                          label="Pluviométrie"
                          value={selectedRegion.agriInfo.rainfall}
                        />
                      </InfoSection>

                      {/* Soil */}
                      <InfoSection
                        icon="layers"
                        title="Types de Sols"
                        color={selectedRegion.color}
                      >
                        <View className="flex-row flex-wrap gap-2 mb-2">
                          {selectedRegion.agriInfo.soilInfo.mainSoilTypes.map(
                            (soil) => (
                              <View
                                key={soil}
                                className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1"
                              >
                                <Text className="text-amber-800 text-sm font-medium">
                                  {soil}
                                </Text>
                              </View>
                            ),
                          )}
                        </View>
                        <Text className="text-gray-600 text-sm leading-5 mt-1">
                          {selectedRegion.agriInfo.soilInfo.soilDescription}
                        </Text>
                        <View className="flex-row gap-3 mt-3">
                          <View className="flex-1 bg-gray-50 rounded-xl p-3">
                            <Text className="text-xs text-gray-500 mb-0.5">
                              pH
                            </Text>
                            <Text className="text-sm font-semibold text-gray-800">
                              {selectedRegion.agriInfo.soilInfo.pH}
                            </Text>
                          </View>
                          <View className="flex-1 bg-gray-50 rounded-xl p-3">
                            <Text className="text-xs text-gray-500 mb-0.5">
                              Drainage
                            </Text>
                            <Text className="text-sm font-semibold text-gray-800">
                              {selectedRegion.agriInfo.soilInfo.drainage}
                            </Text>
                          </View>
                        </View>
                      </InfoSection>

                      {/* Crops */}
                      <InfoSection
                        icon="leaf"
                        title="Cultures principales"
                        color={selectedRegion.color}
                      >
                        {selectedRegion.agriInfo.mainCrops.map((crop) => (
                          <View
                            key={crop}
                            className="flex-row items-start mb-1"
                          >
                            <Text className="text-green-500 mr-2 mt-0.5">
                              •
                            </Text>
                            <Text className="text-gray-700 text-sm flex-1">
                              {crop}
                            </Text>
                          </View>
                        ))}
                      </InfoSection>

                      {/* Livestock */}
                      <InfoSection
                        icon="paw"
                        title="Élevage & Activités"
                        color={selectedRegion.color}
                      >
                        {selectedRegion.agriInfo.mainLivestock.map((item) => (
                          <View
                            key={item}
                            className="flex-row items-start mb-1"
                          >
                            <Text className="text-blue-500 mr-2 mt-0.5">•</Text>
                            <Text className="text-gray-700 text-sm flex-1">
                              {item}
                            </Text>
                          </View>
                        ))}
                      </InfoSection>

                      {/* Notes */}
                      <InfoSection
                        icon="information-circle"
                        title="Notes agricoles"
                        color={selectedRegion.color}
                      >
                        <Text className="text-gray-600 text-sm leading-5">
                          {selectedRegion.agriInfo.agriculturalNotes}
                        </Text>
                      </InfoSection>
                    </>
                  )}

                  {/* Departments */}
                  {selectedRegion.departments.length > 0 && (
                    <InfoSection
                      icon="location"
                      title="Départements"
                      color={selectedRegion.color}
                    >
                      <View className="flex-row flex-wrap gap-2">
                        {selectedRegion.departments.map((dept) => (
                          <View
                            key={dept}
                            className="bg-gray-100 rounded-lg px-3 py-1"
                          >
                            <Text className="text-gray-700 text-sm">
                              {dept}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </InfoSection>
                  )}

                  <View className="h-8" />
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function InfoSection({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={15} color={color} />
        <Text className="text-xs font-bold text-gray-800 ml-1.5 uppercase tracking-wide">
          {title}
        </Text>
      </View>
      <View className="bg-white rounded-xl p-3 border border-gray-100">
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-0.5">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-800 text-sm font-medium text-right flex-1 ml-4">
        {value}
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  map: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    overflow: "hidden",
  },
  regionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
});
