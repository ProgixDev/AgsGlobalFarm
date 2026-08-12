import { create } from "zustand";

interface AuthGateState {
  visible: boolean;
  message: string | null;
  returnPath: string | null;
  open: (opts?: { message?: string; returnPath?: string }) => void;
  close: () => void;
  consumeReturnPath: () => string | null;
}

export const useAuthGateStore = create<AuthGateState>((set, get) => ({
  visible: false,
  message: null,
  returnPath: null,
  open: ({ message, returnPath } = {}) =>
    set({
      visible: true,
      message: message ?? null,
      returnPath: returnPath ?? null,
    }),
  close: () => set({ visible: false }),
  consumeReturnPath: () => {
    const path = get().returnPath;
    set({ returnPath: null });
    return path;
  },
}));
