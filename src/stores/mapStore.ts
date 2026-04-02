import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const mockIncidents: IncidentReport[] = [
  {
    id: "incident-seed-1",
    reporterId: "mock-1",
    reporterName: "Moussa Diallo",
    category: "crop_disease",
    title: "Mildiou sur cultures maraîchères",
    description:
      "Le mildiou a été détecté sur plusieurs parcelles de tomates et de pommes de terre dans la zone de Ziguinchor. Les feuilles présentent des taches brunes et un flétrissement rapide. Environ 3 hectares sont touchés.",
    severity: "high",
    coordinates: { longitude: -16.27, latitude: 12.56 },
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "incident-seed-2",
    reporterId: "mock-2",
    reporterName: "Awa Ndiaye",
    category: "locusts",
    title: "Invasion de criquets pèlerins",
    description:
      "Des essaims de criquets pèlerins ont été observés dans les champs de mil et de sorgho au nord de Saint-Louis. Les cultures sur environ 15 hectares ont été partiellement détruites.",
    severity: "high",
    coordinates: { longitude: -16.02, latitude: 16.02 },
    images: [
      "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=400",
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "incident-seed-3",
    reporterId: "mock-3",
    reporterName: "Ibrahima Sow",
    category: "flood",
    title: "Inondation des rizières",
    description:
      "Les fortes pluies ont provoqué l'inondation de plusieurs rizières dans le département de Fatick. Les plants de riz sont submergés depuis 3 jours.",
    severity: "medium",
    coordinates: { longitude: -16.41, latitude: 14.33 },
    images: ["https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "incident-seed-4",
    reporterId: "mock-4",
    reporterName: "Ousmane Ba",
    category: "fire",
    title: "Feu de brousse",
    description:
      "Un feu de brousse s'est déclaré à l'est de Tambacounda, menaçant les plantations d'anacardiers et les pâturages. Les pompiers sont sur place.",
    severity: "high",
    coordinates: { longitude: -13.68, latitude: 13.77 },
    images: [
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400",
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "incident-seed-5",
    reporterId: "mock-5",
    reporterName: "Fatou Sarr",
    category: "pests",
    title: "Pucerons sur arachide",
    description:
      "Une forte infestation de pucerons a été constatée sur les cultures d'arachide dans le bassin arachidier. Les rendements risquent d'être affectés de 30%.",
    severity: "medium",
    coordinates: { longitude: -16.07, latitude: 14.15 },
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    ],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "incident-seed-6",
    reporterId: "mock-6",
    reporterName: "Abdoulaye Fall",
    category: "drought",
    title: "Sécheresse prolongée",
    description:
      "La saison des pluies est en retard de 3 semaines dans la région de Louga. Les cultures pluviales n'ont pas encore pu être semées.",
    severity: "low",
    coordinates: { longitude: -15.62, latitude: 15.62 },
    images: [
      "https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=400",
    ],
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "incident-seed-7",
    reporterId: "mock-7",
    reporterName: "Mariama Diop",
    category: "pests",
    title: "Chenilles légionnaires d'automne",
    description:
      "Des chenilles légionnaires d'automne ont été identifiées dans les champs de maïs. Les larves se nourrissent des feuilles et des épis en formation.",
    severity: "medium",
    coordinates: { longitude: -15.55, latitude: 14.1 },
    images: [
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400",
    ],
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
];

interface MapStore {
  // Farm
  farmLocations: FarmLocation[];

  // Incidents
  incidents: IncidentReport[];

  // Farm actions
  addFarmLocation: (farm: FarmLocation) => void;
  updateFarmLocation: (farm: FarmLocation) => void;
  deleteFarmLocation: (id: string) => void;

  // Incident actions
  addIncident: (
    incident: Omit<IncidentReport, "id" | "createdAt" | "status">,
  ) => void;
  resolveIncident: (id: string) => void;
  deleteIncident: (id: string) => void;
  getActiveIncidents: () => IncidentReport[];
  getIncidentsByCategory: (category: IncidentCategory) => IncidentReport[];
}

export const useMapStore = create<MapStore>()(
  persist(
    (set, get) => ({
      farmLocations: [],
      incidents: mockIncidents,

      addFarmLocation: (farm: FarmLocation) =>
        set((state) => ({ farmLocations: [farm, ...state.farmLocations] })),

      updateFarmLocation: (farm: FarmLocation) => {
        set((state) => ({
          farmLocations: state.farmLocations.map((existing) =>
            existing.id === farm.id
              ? { ...farm, updatedAt: new Date().toISOString() }
              : existing,
          ),
        }));
      },

      deleteFarmLocation: (id: string) =>
        set((state) => ({
          farmLocations: state.farmLocations.filter((farm) => farm.id !== id),
        })),

      addIncident: (incidentData) => {
        const newIncident: IncidentReport = {
          ...incidentData,
          id: `incident-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
          status: "active",
        };
        set((state) => ({
          incidents: [newIncident, ...state.incidents],
        }));
      },

      resolveIncident: (id: string) => {
        set((state) => ({
          incidents: state.incidents.map((incident) =>
            incident.id === id
              ? { ...incident, status: "resolved" as const }
              : incident,
          ),
        }));
      },

      deleteIncident: (id: string) => {
        set((state) => ({
          incidents: state.incidents.filter((incident) => incident.id !== id),
        }));
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
