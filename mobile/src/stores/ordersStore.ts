import { create } from "zustand";
import { fetchOrders, fetchOrderById } from "@/lib/api/orders";

type Status = "idle" | "loading" | "ready" | "error";

interface OrdersStore {
  orders: Order[];
  ordersStatus: Status;
  ordersError: string | null;
  detailById: Record<string, Order>;
  loadOrders: () => Promise<void>;
  loadOrderById: (id: string) => Promise<Order | null>;
  reset: () => void;
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],
  ordersStatus: "idle",
  ordersError: null,
  detailById: {},

  loadOrders: async () => {
    set({ ordersStatus: "loading", ordersError: null });
    try {
      const orders = await fetchOrders();
      set({ orders, ordersStatus: "ready" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement";
      set({ ordersStatus: "error", ordersError: message });
    }
  },

  loadOrderById: async (id: string) => {
    try {
      const order = await fetchOrderById(id);
      set((state) => ({
        detailById: { ...state.detailById, [id]: order },
      }));
      return order;
    } catch (err) {
      console.warn("Failed to load order", err);
      return null;
    }
  },

  reset: () => {
    set({
      orders: [],
      ordersStatus: "idle",
      ordersError: null,
      detailById: {},
    });
  },
}));
