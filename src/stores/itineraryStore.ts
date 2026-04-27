import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ItineraryStore {
  history: ItineraryHistoryEntry[];
  addHistory: (entry: Omit<ItineraryHistoryEntry, "id" | "generatedAt">) => ItineraryHistoryEntry;
  updateHistoryPdf: (
    entryId: string,
    pdfUri: string,
    savedToDownloads: boolean,
  ) => void;
  removeHistory: (entryId: string) => void;
  clearHistory: () => void;
  getEntryById: (entryId: string) => ItineraryHistoryEntry | undefined;
}

export const useItineraryStore = create<ItineraryStore>()(
  persist(
    (set, get) => ({
      history: [],
      addHistory: (entry) => {
        const newEntry: ItineraryHistoryEntry = {
          ...entry,
          id: `itinerary-${Date.now()}`,
          generatedAt: new Date().toISOString(),
        };

        set((state) => ({
          history: [newEntry, ...state.history].slice(0, 30),
        }));

        return newEntry;
      },
      updateHistoryPdf: (entryId, pdfUri, savedToDownloads) => {
        set((state) => ({
          history: state.history.map((entry) =>
            entry.id === entryId
              ? { ...entry, pdfUri, savedToDownloads }
              : entry,
          ),
        }));
      },
      removeHistory: (entryId) => {
        set((state) => ({
          history: state.history.filter((entry) => entry.id !== entryId),
        }));
      },
      clearHistory: () => set({ history: [] }),
      getEntryById: (entryId) =>
        get().history.find((entry) => entry.id === entryId),
    }),
    {
      name: "@ags_itinerary_storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState: unknown, version) => {
        if (version < 2) {
          return { history: [] };
        }
        return persistedState as ItineraryStore;
      },
    },
  ),
);
