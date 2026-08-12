import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createFarmApi,
  deleteFarmApi,
  fetchMyFarms,
  updateFarmApi,
  type FarmDTO,
  type FarmInput,
} from "@/lib/api/farms";
import {
  createIncidentApi,
  deleteIncidentApi,
  fetchIncidents,
  fetchMyIncidents,
  updateIncidentApi,
  type IncidentDTO,
  type IncidentInput,
} from "@/lib/api/incidents";

function farmFromDTO(dto: FarmDTO): FarmLocation {
  return {
    id: dto._id,
    remoteId: dto._id,
    userId: dto.userId,
    name: dto.name,
    geometryType: dto.geometryType,
    coordinates: dto.coordinates,
    boundaryCoordinates: dto.boundaryCoordinates,
    surfaceHectares: dto.surfaceHectares,
    area: dto.area,
    farmType: dto.farmType,
    currentCrops: dto.currentCrops,
    contact: dto.contact,
    hidePersonalInfo: dto.hidePersonalInfo,
    gpsCaptured: dto.gpsCaptured,
    syncStatus: "synced",
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function farmToInput(farm: FarmLocation): FarmInput {
  return {
    name: farm.name,
    geometryType: farm.geometryType,
    coordinates: farm.coordinates,
    boundaryCoordinates: farm.boundaryCoordinates,
    surfaceHectares: farm.surfaceHectares,
    area: farm.area,
    farmType: farm.farmType,
    currentCrops: farm.currentCrops,
    contact: farm.contact,
    hidePersonalInfo: farm.hidePersonalInfo,
    gpsCaptured: farm.gpsCaptured,
  };
}

function incidentFromDTO(dto: IncidentDTO): IncidentReport {
  return {
    id: dto._id,
    remoteId: dto._id,
    reporterId: dto.reporterId,
    reporterName: dto.reporterName,
    category: dto.category,
    customCategory: dto.customCategory,
    title: dto.title,
    description: dto.description,
    severity: dto.severity,
    coordinates: dto.coordinates,
    region: dto.region,
    images: dto.images ?? [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    status: dto.status,
    syncStatus: "synced",
  };
}

function incidentToInput(incident: IncidentReport): IncidentInput {
  return {
    category: incident.category,
    customCategory: incident.customCategory,
    title: incident.title,
    description: incident.description,
    severity: incident.severity,
    coordinates: incident.coordinates,
    region: incident.region,
    images: incident.images,
  };
}

interface MapStore {
  // Farm
  farmLocations: FarmLocation[];
  farmsLoading: boolean;
  farmsError: string | null;

  // Incidents
  incidents: IncidentReport[];
  incidentsLoading: boolean;
  incidentsError: string | null;

  // Farm actions
  addFarmLocation: (farm: FarmLocation) => Promise<void>;
  updateFarmLocation: (farm: FarmLocation) => Promise<void>;
  deleteFarmLocation: (id: string) => Promise<void>;
  loadFarmsFromBackend: () => Promise<void>;
  retryFarmSync: (id: string) => Promise<void>;

  // Incident actions
  loadIncidentsFromBackend: () => Promise<void>;
  addIncident: (
    incident: Omit<
      IncidentReport,
      "id" | "createdAt" | "status" | "syncStatus"
    >,
  ) => Promise<void>;
  resolveIncident: (id: string) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  retryIncidentSync: (id: string) => Promise<void>;
  getActiveIncidents: () => IncidentReport[];
  getIncidentsByCategory: (category: IncidentCategory) => IncidentReport[];

  // Clear local state on logout (also wipes AsyncStorage-persisted data)
  clearLocalData: () => void;
}

export const useMapStore = create<MapStore>()(
  persist(
    (set, get) => ({
      farmLocations: [],
      farmsLoading: false,
      farmsError: null,
      incidents: [],
      incidentsLoading: false,
      incidentsError: null,

      loadFarmsFromBackend: async () => {
        set({ farmsLoading: true, farmsError: null });
        try {
          const remoteFarms = await fetchMyFarms();
          const remote = remoteFarms.map(farmFromDTO);
          const remoteIds = new Set(remote.map((f) => f.remoteId));
          const localPending = get().farmLocations.filter(
            (f) => f.syncStatus !== "synced" && !remoteIds.has(f.remoteId),
          );
          set({
            farmLocations: [...remote, ...localPending],
            farmsLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sync error";
          set({ farmsLoading: false, farmsError: message });
        }
      },

      addFarmLocation: async (farm: FarmLocation) => {
        const optimistic: FarmLocation = { ...farm, syncStatus: "pending" };
        set((state) => ({
          farmLocations: [optimistic, ...state.farmLocations],
        }));
        try {
          const dto = await createFarmApi(farmToInput(farm));
          const synced = farmFromDTO(dto);
          set((state) => ({
            farmLocations: state.farmLocations.map((f) =>
              f.id === farm.id ? { ...synced, id: synced.remoteId! } : f,
            ),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sync error";
          set((state) => ({
            farmLocations: state.farmLocations.map((f) =>
              f.id === farm.id ? { ...f, syncStatus: "error" } : f,
            ),
            farmsError: message,
          }));
        }
      },

      updateFarmLocation: async (farm: FarmLocation) => {
        const updatedAt = new Date().toISOString();
        const optimistic: FarmLocation = {
          ...farm,
          updatedAt,
          syncStatus: "pending",
        };
        set((state) => ({
          farmLocations: state.farmLocations.map((existing) =>
            existing.id === farm.id ? optimistic : existing,
          ),
        }));
        if (!farm.remoteId) {
          try {
            const dto = await createFarmApi(farmToInput(farm));
            const synced = farmFromDTO(dto);
            set((state) => ({
              farmLocations: state.farmLocations.map((f) =>
                f.id === farm.id ? { ...synced, id: synced.remoteId! } : f,
              ),
            }));
          } catch (err) {
            const message = err instanceof Error ? err.message : "Sync error";
            set((state) => ({
              farmLocations: state.farmLocations.map((f) =>
                f.id === farm.id ? { ...f, syncStatus: "error" } : f,
              ),
              farmsError: message,
            }));
          }
          return;
        }
        try {
          const dto = await updateFarmApi(farm.remoteId, farmToInput(farm));
          const synced = farmFromDTO(dto);
          set((state) => ({
            farmLocations: state.farmLocations.map((f) =>
              f.id === farm.id ? { ...synced, id: synced.remoteId! } : f,
            ),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sync error";
          set((state) => ({
            farmLocations: state.farmLocations.map((f) =>
              f.id === farm.id ? { ...f, syncStatus: "error" } : f,
            ),
            farmsError: message,
          }));
        }
      },

      deleteFarmLocation: async (id: string) => {
        const target = get().farmLocations.find((f) => f.id === id);
        set((state) => ({
          farmLocations: state.farmLocations.filter((farm) => farm.id !== id),
        }));
        if (!target?.remoteId) return;
        try {
          await deleteFarmApi(target.remoteId);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sync error";
          set({ farmsError: message });
        }
      },

      retryFarmSync: async (id: string) => {
        const target = get().farmLocations.find((f) => f.id === id);
        if (!target) return;
        if (target.remoteId) {
          await get().updateFarmLocation(target);
        } else {
          await get().addFarmLocation(target);
        }
      },

      loadIncidentsFromBackend: async () => {
        set({ incidentsLoading: true, incidentsError: null });
        try {
          const result = await fetchIncidents({ limit: 500 });
          const remote = result.incidents.map(incidentFromDTO);
          const remoteIds = new Set(remote.map((i) => i.remoteId));
          const localPending = get().incidents.filter(
            (i) => i.syncStatus !== "synced" && !remoteIds.has(i.remoteId),
          );
          set({
            incidents: [...remote, ...localPending],
            incidentsLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sync error";
          set({ incidentsLoading: false, incidentsError: message });
        }
      },

      addIncident: async (incidentData) => {
        const localId = `incident-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const now = new Date().toISOString();
        const optimistic: IncidentReport = {
          ...incidentData,
          id: localId,
          createdAt: now,
          updatedAt: now,
          status: "active",
          syncStatus: "pending",
        };
        set((state) => ({
          incidents: [optimistic, ...state.incidents],
        }));
        try {
          const dto = await createIncidentApi(incidentToInput(optimistic));
          const synced = incidentFromDTO(dto);
          set((state) => ({
            incidents: state.incidents.map((i) =>
              i.id === localId ? synced : i,
            ),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sync error";
          set((state) => ({
            incidents: state.incidents.map((i) =>
              i.id === localId ? { ...i, syncStatus: "error" } : i,
            ),
            incidentsError: message,
          }));
        }
      },

      resolveIncident: async (id: string) => {
        const target = get().incidents.find((i) => i.id === id);
        if (!target) return;
        set((state) => ({
          incidents: state.incidents.map((incident) =>
            incident.id === id
              ? {
                  ...incident,
                  status: "resolved" as const,
                  syncStatus: "pending",
                }
              : incident,
          ),
        }));
        if (!target.remoteId) return;
        try {
          const dto = await updateIncidentApi(target.remoteId, {
            status: "resolved",
          });
          const synced = incidentFromDTO(dto);
          set((state) => ({
            incidents: state.incidents.map((i) =>
              i.id === id ? synced : i,
            ),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sync error";
          set((state) => ({
            incidents: state.incidents.map((i) =>
              i.id === id ? { ...i, syncStatus: "error" } : i,
            ),
            incidentsError: message,
          }));
        }
      },

      deleteIncident: async (id: string) => {
        const target = get().incidents.find((i) => i.id === id);
        set((state) => ({
          incidents: state.incidents.filter((incident) => incident.id !== id),
        }));
        if (!target?.remoteId) return;
        try {
          await deleteIncidentApi(target.remoteId);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sync error";
          set({ incidentsError: message });
        }
      },

      retryIncidentSync: async (id: string) => {
        const target = get().incidents.find((i) => i.id === id);
        if (!target) return;
        if (!target.remoteId) {
          // Re-create
          set((state) => ({
            incidents: state.incidents.filter((i) => i.id !== id),
          }));
          await get().addIncident(target);
        } else {
          await get().resolveIncident(id);
        }
      },

      getActiveIncidents: () => {
        return get().incidents.filter(
          (incident) => incident.status === "active",
        );
      },

      getIncidentsByCategory: (category: IncidentCategory) => {
        return get().incidents.filter(
          (incident) => incident.category === category,
        );
      },

      clearLocalData: () => {
        set({
          farmLocations: [],
          farmsLoading: false,
          farmsError: null,
          incidents: [],
          incidentsLoading: false,
          incidentsError: null,
        });
      },
    }),
    {
      name: "@ags_map_storage",
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: any) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }

        if (Array.isArray((persistedState as MapStore).farmLocations)) {
          return {
            ...persistedState,
            farmLocations: (persistedState.farmLocations as FarmLocation[]).map(
              (farm) => ({
                ...farm,
                geometryType:
                  farm.geometryType ??
                  ((farm.boundaryCoordinates?.length ?? 0) >= 3
                    ? "polygon"
                    : "point"),
              }),
            ),
          };
        }

        const legacyFarmLocation = persistedState.farmLocation as
          | FarmLocation
          | null
          | undefined;

        const migratedFarmLocations = legacyFarmLocation
          ? [
              {
                ...legacyFarmLocation,
                geometryType: legacyFarmLocation.geometryType ?? "point",
              },
            ]
          : [];

        return {
          ...persistedState,
          farmLocations: migratedFarmLocations,
        };
      },
      partialize: (state) => ({
        farmLocations: state.farmLocations,
        incidents: state.incidents,
      }),
    },
  ),
);
