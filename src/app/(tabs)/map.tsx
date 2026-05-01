import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import {
  senegalCenter,
  senegalRegions,
  getRegionColor,
  regionAgriData,
} from "@/data/senegal-regions";
import { getDepartmentsByRegion } from "@/data/agricultural-data";
import { findRegionAtPoint, getRegionBounds } from "@/utils/geo";
import {
  RegionExplorer,
  type SelectedRegion,
} from "@/components/map/RegionExplorer";
import {
  FarmLocationSelector,
  type FarmLocationSelectorHandle,
} from "@/components/map/FarmLocationSelector";
import { IncidentMarkers } from "@/components/map/IncidentMarkers";
import { IncidentManagerSheet } from "@/components/map/IncidentManagerSheet";
import { useNavigation } from "expo-router";
import { useMapStore } from "@/stores/mapStore";
import { useUserStore } from "@/stores/userStore";

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

type MapMode = "explorer" | "farm" | "incidents";

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

function pointInPolygon(point: [number, number], polygon: [number, number][]) {
  if (polygon.length < 3) return false;
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function getFarmCenter(farm: FarmLocation): {
  longitude: number;
  latitude: number;
} | null {
  if (farm.geometryType === "point") {
    return farm.coordinates ?? null;
  }

  const points = farm.boundaryCoordinates ?? [];
  if (points.length < 3) return null;

  const total = points.reduce(
    (acc, p) => ({
      longitude: acc.longitude + p.longitude,
      latitude: acc.latitude + p.latitude,
    }),
    { longitude: 0, latitude: 0 },
  );

  return {
    longitude: total.longitude / points.length,
    latitude: total.latitude / points.length,
  };
}

const ALL_MAP_MODES: {
  key: MapMode;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { key: "explorer", label: "Explorer", icon: "location-outline" },
  { key: "farm", label: "Ma Ferme", icon: "home-outline" },
  { key: "incidents", label: "Incidents", icon: "alert-circle-outline" },
];

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { currentUser } = useUserStore();
  const isFarmOwner = currentUser?.userType === "farm_owner";

  // Job seekers don't see the "Ma Ferme" mode
  const mapModes = useMemo(
    () =>
      isFarmOwner
        ? ALL_MAP_MODES
        : ALL_MAP_MODES.filter((m) => m.key !== "farm"),
    [isFarmOwner],
  );

  const cameraRef = useRef<Camera>(null);
  const farmSelectorRef = useRef<FarmLocationSelectorHandle>(null);

  // Map state
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("explorer");
  const [pinMode, setPinMode] = useState(false);
  const [polygonDrawMode, setPolygonDrawMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    senegalCenter.longitude,
    senegalCenter.latitude,
  ]);

  const [selectedIncident, setSelectedIncident] =
    useState<IncidentReport | null>(null);
  const [incidentCoordinates, setIncidentCoordinates] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [incidentLocationPinMode, setIncidentLocationPinMode] = useState(false);
  const [farmSheetVisible, setFarmSheetVisible] = useState(false);
  const [incidentSheetVisible, setIncidentSheetVisible] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [farmSheetMinimizeKey, setFarmSheetMinimizeKey] = useState(0);
  const [incidentRadiusKm, setIncidentRadiusKm] = useState(25);
  const [incidentRadiusMode, setIncidentRadiusMode] = useState<
    "all_farms" | "selected_farm"
  >("all_farms");

  const { farmLocations, incidents, loadFarmsFromBackend } = useMapStore();

  useEffect(() => {
    if (isFarmOwner) {
      loadFarmsFromBackend();
    }
  }, [isFarmOwner, loadFarmsFromBackend]);

  const zoomToFarm = useCallback((farm: FarmLocation) => {
    if (!cameraRef.current) return;

    if (farm.geometryType === "point" && farm.coordinates) {
      cameraRef.current.setCamera({
        centerCoordinate: [
          farm.coordinates.longitude,
          farm.coordinates.latitude,
        ],
        zoomLevel: 11,
        animationDuration: 800,
      });
      return;
    }

    if (
      farm.geometryType === "polygon" &&
      (farm.boundaryCoordinates?.length ?? 0) > 0
    ) {
      const lons = farm.boundaryCoordinates!.map((p) => p.longitude);
      const lats = farm.boundaryCoordinates!.map((p) => p.latitude);
      cameraRef.current.fitBounds(
        [Math.max(...lons), Math.max(...lats)],
        [Math.min(...lons), Math.min(...lats)],
        [50, 50, 50, 50],
        900,
      );
    }
  }, []);

  const focusFarmFromMap = useCallback(
    (farm: FarmLocation) => {
      setSelectedFarmId(farm.id);
      setFarmSheetVisible(true);
      setFarmSheetMinimizeKey((v) => v + 1);
      zoomToFarm(farm);
    },
    [zoomToFarm],
  );

  // Hide tab bar when any bottom sheet / overlay is on screen
  const overlayActive =
    modalVisible ||
    farmSheetVisible ||
    incidentSheetVisible ||
    selectedIncident !== null ||
    pinMode ||
    polygonDrawMode ||
    incidentLocationPinMode ||
    false;

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: overlayActive ? { display: "none" } : undefined,
    });
  }, [overlayActive, navigation]);

  // Header state
  const [searchQuery, setSearchQuery] = useState("");

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleModeChange = useCallback(
    (mode: MapMode) => {
      if (mapMode === "incidents" && mode !== "incidents") {
        setSelectedIncident(null);
      }
      haptic.selection();
      setMapMode(mode);
      setSearchQuery("");
      setFarmSheetVisible(mode === "farm");
      setIncidentSheetVisible(mode === "incidents");
      setPinMode(false);
      setPolygonDrawMode(false);
      setPolygonPoints([]);
      setIncidentLocationPinMode(false);
      if (mode === "incidents") {
        setIncidentCoordinates({
          longitude: mapCenter[0],
          latitude: mapCenter[1],
        });
      }
      if (mode !== "farm") {
        setSelectedFarmId(null);
      }
    },
    [mapMode, mapCenter],
  );

  const handleIncidentCameraMove = useCallback(
    (coordinates: [number, number]) => {
      cameraRef.current?.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: 9,
        animationDuration: 800,
      });
    },
    [],
  );

  // Filter regions by search query
  const matchingRegionIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || mapMode !== "explorer") return null; // null = all match
    return new Set(
      senegalRegions
        .filter((r) => {
          const { id, name, capital } = r.properties;
          const agri = regionAgriData[id];
          const depts = getDepartmentsByRegion(id).map((d) => d.name);
          const haystack = [
            name,
            capital,
            ...(agri?.mainCrops ?? []),
            ...(agri?.mainLivestock ?? []),
            ...(agri?.agriculturalNotes ? [agri.agriculturalNotes] : []),
            ...(agri?.climate ? [agri.climate] : []),
            ...depts,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
        .map((r) => r.properties.id),
    );
  }, [searchQuery, mapMode]);

  // GeoJSON for clickable region fills
  const regionsGeoJSON = useMemo<FeatureCollection<Polygon>>(
    () => ({
      type: "FeatureCollection",
      features: senegalRegions as unknown as Feature<Polygon>[],
    }),
    [],
  );

  const farmPolygonsGeoJSON = useMemo<FeatureCollection<Polygon>>(
    () => ({
      type: "FeatureCollection",
      features: farmLocations
        .filter(
          (farm) =>
            farm.geometryType === "polygon" &&
            (farm.boundaryCoordinates?.length ?? 0) >= 3,
        )
        .map((farm) => {
          const raw = (farm.boundaryCoordinates ?? []).map((point) => [
            point.longitude,
            point.latitude,
          ]) as [number, number][];
          const first = raw[0];
          const last = raw[raw.length - 1];
          const closed =
            first && last && (first[0] !== last[0] || first[1] !== last[1])
              ? [...raw, first]
              : raw;

          return {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [closed],
            },
            properties: { id: farm.id },
          } as Feature<Polygon>;
        }),
    }),
    [farmLocations],
  );

  const drawingFarmPolygonGeoJSON = useMemo<FeatureCollection<Polygon>>(() => {
    if (polygonPoints.length < 3) {
      return { type: "FeatureCollection", features: [] };
    }

    const first = polygonPoints[0];
    const last = polygonPoints[polygonPoints.length - 1];
    const closed =
      first && last && (first[0] !== last[0] || first[1] !== last[1])
        ? [...polygonPoints, first]
        : polygonPoints;

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [closed] },
          properties: { id: "drawing-farm-polygon" },
        } as Feature<Polygon>,
      ],
    };
  }, [polygonPoints]);

  const activeIncidents = useMemo(
    () => incidents.filter((incident) => incident.status === "active"),
    [incidents],
  );

  const farmCenters = useMemo(
    () =>
      farmLocations
        .map((farm) => ({ farmId: farm.id, center: getFarmCenter(farm) }))
        .filter((entry) => entry.center !== null) as {
        farmId: string;
        center: { longitude: number; latitude: number };
      }[],
    [farmLocations],
  );

  const filteredIncidents = useMemo(() => {
    if (farmCenters.length === 0) {
      return activeIncidents;
    }

    const radius = Math.max(5, Math.min(100, incidentRadiusKm));

    const centersToUse =
      incidentRadiusMode === "selected_farm"
        ? (() => {
            const selected = farmCenters.find(
              (entry) => entry.farmId === selectedFarmId,
            );
            return selected
              ? [selected.center]
              : farmCenters.map((e) => e.center);
          })()
        : farmCenters.map((entry) => entry.center);

    return activeIncidents.filter((incident) =>
      centersToUse.some(
        (center) => distanceKm(center, incident.coordinates) <= radius,
      ),
    );
  }, [
    activeIncidents,
    farmCenters,
    incidentRadiusKm,
    incidentRadiusMode,
    selectedFarmId,
  ]);

  const handleMapPress = useCallback(
    (event: any) => {
      Keyboard.dismiss();

      const coords = event?.geometry?.coordinates;
      if (!coords || coords.length < 2) return;
      const [lng, lat] = coords;

      if (mapMode === "farm" && polygonDrawMode) {
        setPolygonPoints((prev) => [...prev, [lng, lat]]);
        haptic.selection();
        return;
      }

      if (mapMode === "farm" && !pinMode && !polygonDrawMode) {
        const tappedPointFarm = farmLocations.find(
          (farm) =>
            farm.geometryType === "point" &&
            farm.coordinates &&
            distanceKm(
              { longitude: lng, latitude: lat },
              {
                longitude: farm.coordinates.longitude,
                latitude: farm.coordinates.latitude,
              },
            ) <= 2,
        );

        const tappedPolygonFarm = farmLocations.find((farm) => {
          if (
            farm.geometryType !== "polygon" ||
            (farm.boundaryCoordinates?.length ?? 0) < 3
          ) {
            return false;
          }
          const polygon = (farm.boundaryCoordinates ?? []).map((p) => [
            p.longitude,
            p.latitude,
          ]) as [number, number][];
          return pointInPolygon([lng, lat], polygon);
        });

        const tappedFarm = tappedPointFarm ?? tappedPolygonFarm;

        if (tappedFarm) {
          focusFarmFromMap(tappedFarm);
          return;
        }
      }

      if (mapMode !== "explorer" || pinMode) return;

      const region = findRegionAtPoint(lng, lat);
      if (!region) return;

      // Block tap on regions that don't match the search
      if (matchingRegionIds && !matchingRegionIds.has(region.properties.id))
        return;

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

      // Fly camera to fit the selected region
      const bounds = getRegionBounds(id);
      if (bounds) {
        cameraRef.current?.fitBounds(
          bounds.ne,
          bounds.sw,
          [40, 40, 40, 40],
          800,
        );
      }
    },
    [
      mapMode,
      pinMode,
      polygonDrawMode,
      matchingRegionIds,
      farmLocations,
      focusFarmFromMap,
    ],
  );

  const handleCameraChanged = (state: any) => {
    Keyboard.dismiss();
    if (!state?.properties?.center) return;
    const [lng, lat] = state.properties.center;
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

  // ── Search placeholder based on mode ───────────────────────────────────────

  const searchPlaceholder = useMemo(() => {
    switch (mapMode) {
      case "explorer":
        return "Rechercher une région...";
      case "farm":
        return "Rechercher un lieu...";
      case "incidents":
        return "Rechercher un incident...";
    }
  }, [mapMode]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-gray-100">
      <View
        testID="header"
        className="bg-white border-b border-gray-100"
        style={{ paddingTop: insets.top }}
      >
        <View testID="header-search" className="px-4 pt-3 pb-2">
          <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2.5">
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              className="flex-1 ml-2 text-sm font-sans text-gray-800"
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => {
                setModalVisible(false);
                setSelectedRegion(null);
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View testID="header-modes" className="px-4 pb-2">
          <View className="flex-row bg-gray-50 rounded-xl p-1">
            {mapModes.map((mode) => {
              const isActive = mapMode === mode.key;
              return (
                <TouchableOpacity
                  key={mode.key}
                  onPress={() => handleModeChange(mode.key)}
                  className={`flex-1 flex-row items-center justify-center rounded-lg py-2 ${
                    isActive ? "bg-primary" : ""
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={mode.icon}
                    size={15}
                    color={isActive ? colors.white : colors.muted}
                  />
                  <Text
                    className={`text-xs ml-1 ${
                      isActive
                        ? "text-white font-sans-semibold"
                        : "text-gray-500 font-sans-medium"
                    }`}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View testID="map" className="flex-1">
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
              centerCoordinate: [
                senegalCenter.longitude,
                senegalCenter.latitude,
              ],
              zoomLevel: 6.5,
              padding: {
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 20,
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

          {/* Senegal country border */}
          <VectorSource
            id="countries"
            url="mapbox://mapbox.country-boundaries-v1"
          >
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
              style={{ lineColor: colors.mutedLighter, lineWidth: 1.5 }}
            />
          </VectorSource>

          {/* Per-region fills for explorer mode only */}
          {mapMode === "explorer" && (
            <ShapeSource id="senegal-regions" shape={regionsGeoJSON}>
              <FillLayer
                id="region-fill"
                style={{
                  fillColor: (() => {
                    const baseColors = [
                      "match",
                      ["get", "id"],
                      ...senegalRegions.flatMap((r) => [
                        r.properties.id,
                        matchingRegionIds &&
                        !matchingRegionIds.has(r.properties.id)
                          ? "transparent"
                          : getRegionColor(r.properties.id),
                      ]),
                      colors.mutedLight,
                    ];
                    if (selectedRegion) {
                      return [
                        "case",
                        ["==", ["get", "id"], selectedRegion.id],
                        colors.primary,
                        baseColors,
                      ];
                    }
                    return baseColors;
                  })() as any,
                  fillOpacity: (() => {
                    if (matchingRegionIds) {
                      const matchIds = [...matchingRegionIds];
                      return [
                        "case",
                        ["==", ["get", "id"], selectedRegion?.id ?? ""],
                        0.55,
                        ["in", ["get", "id"], ["literal", matchIds]],
                        0.35,
                        0,
                      ];
                    }
                    return [
                      "case",
                      ["==", ["get", "id"], selectedRegion?.id ?? ""],
                      0.55,
                      0.35,
                    ];
                  })() as any,
                }}
              />
              <LineLayer
                id="region-borders-inactive"
                filter={["!=", ["get", "id"], selectedRegion?.id ?? ""]}
                style={{
                  lineColor: (() => {
                    if (!matchingRegionIds) return "rgba(255,255,255,0.9)";
                    const matchIds = [...matchingRegionIds];
                    return [
                      "case",
                      ["in", ["get", "id"], ["literal", matchIds]],
                      colors.warning,
                      "transparent",
                    ];
                  })() as any,
                  lineWidth: matchingRegionIds ? 2.5 : 1.5,
                }}
              />
              <LineLayer
                id="region-borders-active"
                filter={["==", ["get", "id"], selectedRegion?.id ?? ""]}
                style={{
                  lineColor: colors.primaryDark,
                  lineWidth: 3,
                }}
              />
            </ShapeSource>
          )}

          {/* Saved farm polygons */}
          {farmPolygonsGeoJSON.features.length > 0 && (
            <ShapeSource id="farm-polygons" shape={farmPolygonsGeoJSON}>
              <FillLayer
                id="farm-polygons-fill"
                style={{
                  fillColor: colors.primary,
                  fillOpacity: 0.18,
                }}
              />
              <LineLayer
                id="farm-polygons-border"
                style={{
                  lineColor: colors.primaryDark,
                  lineWidth: 2.2,
                }}
              />
            </ShapeSource>
          )}

          {/* Drawing preview polygon */}
          {polygonDrawMode && drawingFarmPolygonGeoJSON.features.length > 0 && (
            <ShapeSource
              id="farm-polygon-drawing"
              shape={drawingFarmPolygonGeoJSON}
            >
              <FillLayer
                id="farm-polygon-drawing-fill"
                style={{ fillColor: colors.warning, fillOpacity: 0.15 }}
              />
              <LineLayer
                id="farm-polygon-drawing-border"
                style={{
                  lineColor: colors.warning,
                  lineWidth: 2,
                  lineDasharray: [2, 2],
                }}
              />
            </ShapeSource>
          )}

          {/* Farm point markers */}
          {farmLocations
            .filter(
              (farm) => farm.geometryType === "point" && !!farm.coordinates,
            )
            .map((farm) => (
              <PointAnnotation
                key={farm.id}
                id={`farm-marker-${farm.id}`}
                coordinate={[
                  farm.coordinates!.longitude,
                  farm.coordinates!.latitude,
                ]}
                onSelected={() => focusFarmFromMap(farm)}
              >
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons
                    name="location"
                    size={34}
                    color={
                      selectedFarmId === farm.id
                        ? colors.primaryDark
                        : colors.info
                    }
                  />
                </View>
              </PointAnnotation>
            ))}

          {/* Incident markers */}
          {mapMode === "incidents" && (
            <IncidentMarkers
              incidents={filteredIncidents}
              onMarkerPress={setSelectedIncident}
              selectedIncidentId={selectedIncident?.id}
            />
          )}
        </MapView>

        {pinMode && (
          <>
            <View
              className="absolute"
              style={styles.crosshairContainer}
              pointerEvents="none"
            >
              <Ionicons name="locate" size={48} color={colors.primary} />
            </View>

            <View
              testID="overlay-pin-banner"
              className="absolute top-4 left-4 right-4 z-20"
            >
              <View className="bg-white rounded-2xl px-5 py-3 shadow-lg">
                <Text className="text-gray-700 text-sm text-center font-sans-medium">
                  Déplacez la carte pour positionner votre ferme
                </Text>
              </View>
            </View>

            <View
              testID="overlay-pin-actions"
              className="absolute bottom-28 left-4 right-4 z-20 flex-row gap-3"
            >
              <TouchableOpacity
                onPress={() => farmSelectorRef.current?.cancelPointPin()}
                className="flex-1 bg-gray-200 rounded-xl py-3.5 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-gray-600 font-sans-semibold text-base">
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => farmSelectorRef.current?.confirmPointPin()}
                className="flex-1 bg-primary rounded-xl py-3.5 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-white font-sans-bold text-base">
                  Confirmer
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {polygonDrawMode && (
          <>
            <View
              testID="overlay-polygon-banner"
              className="absolute top-4 left-4 right-4 z-20"
            >
              <View className="bg-white rounded-2xl px-5 py-3 shadow-lg">
                <Text className="text-gray-700 text-sm text-center font-sans-medium">
                  Touchez la carte pour ajouter les points de la limite (
                  {polygonPoints.length})
                </Text>
              </View>
            </View>

            <View className="absolute bottom-28 left-4 right-4 z-20 flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  setPolygonPoints((prev) => prev.slice(0, -1));
                }}
                disabled={polygonPoints.length === 0}
                className="flex-1 bg-gray-200 rounded-xl py-3.5 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-gray-600 font-sans-semibold text-sm">
                  Retirer le dernier
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setPolygonPoints([]);
                  farmSelectorRef.current?.cancelPolygon();
                }}
                className="flex-1 bg-gray-200 rounded-xl py-3.5 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-gray-600 font-sans-semibold text-sm">
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  farmSelectorRef.current?.confirmPolygon();
                  setPolygonPoints([]);
                }}
                disabled={polygonPoints.length < 3}
                className="flex-1 bg-primary rounded-xl py-3.5 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-white font-sans-bold text-sm">
                  Terminer
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {mapMode === "farm" && (
        <FarmLocationSelector
          ref={farmSelectorRef}
          cameraRef={cameraRef}
          onPointPinModeChange={setPinMode}
          onPolygonDrawModeChange={(active) => {
            setPolygonDrawMode(active);
            if (!active) {
              setPolygonPoints([]);
            }
          }}
          onDismiss={() => setFarmSheetVisible(false)}
          mapCenter={mapCenter}
          polygonPoints={polygonPoints}
          selectedFarmId={selectedFarmId}
          onSelectFarm={(farmId) => {
            setSelectedFarmId(farmId);
            if (farmId) {
              setFarmSheetMinimizeKey((v) => v + 1);
            }
          }}
          minimizeTrigger={farmSheetMinimizeKey}
          hidden={pinMode || polygonDrawMode}
          visible={farmSheetVisible}
        />
      )}

      {mapMode === "explorer" && (
        <RegionExplorer
          selectedRegion={selectedRegion}
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedRegion(null);
          }}
          onRefocus={() => {
            if (!selectedRegion) return;
            const bounds = getRegionBounds(selectedRegion.id);
            if (bounds) {
              cameraRef.current?.fitBounds(
                bounds.ne,
                bounds.sw,
                [40, 40, 40, 40],
                800,
              );
            }
          }}
        />
      )}

      {mapMode === "incidents" && (
        <>
          {!incidentLocationPinMode && (
            <IncidentManagerSheet
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              onCameraMove={handleIncidentCameraMove}
              onDismiss={() => setIncidentSheetVisible(false)}
              visible={incidentSheetVisible}
              filteredIncidents={filteredIncidents}
              radiusKm={incidentRadiusKm}
              onChangeRadiusKm={setIncidentRadiusKm}
              radiusMode={incidentRadiusMode}
              onChangeRadiusMode={setIncidentRadiusMode}
              hasFarms={farmLocations.length > 0}
              coordinates={
                incidentCoordinates ?? {
                  longitude: mapCenter[0],
                  latitude: mapCenter[1],
                }
              }
              onEditLocation={() => {
                setIncidentSheetVisible(false);
                setIncidentLocationPinMode(true);
              }}
            />
          )}

          {incidentLocationPinMode && (
            <>
              <View
                className="absolute"
                style={styles.crosshairContainer}
                pointerEvents="none"
              >
                <Ionicons name="locate" size={48} color={colors.danger} />
              </View>

              <View className="absolute top-4 left-4 right-4 z-20">
                <View className="bg-white rounded-2xl px-5 py-3 shadow-lg">
                  <Text className="text-gray-700 text-sm text-center font-sans-medium">
                    Déplacez la carte pour localiser l&apos;incident
                  </Text>
                </View>
              </View>

              <View className="absolute bottom-28 left-4 right-4 z-20 flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setIncidentLocationPinMode(false);
                    setIncidentSheetVisible(true);
                  }}
                  className="flex-1 bg-gray-200 rounded-xl py-3.5 items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-600 font-sans-semibold text-base">
                    Annuler
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIncidentCoordinates({
                      longitude: mapCenter[0],
                      latitude: mapCenter[1],
                    });
                    setIncidentLocationPinMode(false);
                    setIncidentSheetVisible(true);
                  }}
                  className="flex-1 rounded-xl py-3.5 items-center"
                  style={{ backgroundColor: colors.danger }}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-sans-bold text-base">
                    Confirmer
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
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
