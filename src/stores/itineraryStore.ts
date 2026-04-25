import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ItineraryStore {
  history: ItineraryHistoryEntry[];
  addHistory: (entry: Omit<ItineraryHistoryEntry, "id" | "generatedAt">) => void;
  clearHistory: () => void;
  removeHistory: (entryId: string) => void;
}

export const useItineraryStore = create<ItineraryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (entry) => {
        const newEntry: ItineraryHistoryEntry = {
          ...entry,
          id: `itinerary-${Date.now()}`,
          generatedAt: new Date().toISOString(),
        };

        set((state) => ({
          history: [newEntry, ...state.history].slice(0, 20),
        }));
      },
      clearHistory: () => set({ history: [] }),
      removeHistory: (entryId: string) => {
        set((state) => ({
          history: state.history.filter((entry) => entry.id !== entryId),
        }));
      },
    }),
    {
      name: "@ags_itinerary_storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
