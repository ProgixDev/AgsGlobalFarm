import { useCallback } from "react";
import { useUserStore } from "@/stores/userStore";
import { useAuthGateStore } from "@/stores/authGateStore";

interface RequireAuthOptions {
  message?: string;
  returnPath?: string;
}

export function useRequireAuth() {
  const currentUser = useUserStore((s) => s.currentUser);
  const open = useAuthGateStore((s) => s.open);

  const isAuthenticated = !!currentUser;

  const requireAuth = useCallback(
    (action: () => void, opts: RequireAuthOptions = {}) => {
      if (currentUser) {
        action();
        return;
      }
      open(opts);
    },
    [currentUser, open],
  );

  const ensureAuth = useCallback(
    (opts: RequireAuthOptions = {}): boolean => {
      if (currentUser) return true;
      open(opts);
      return false;
    },
    [currentUser, open],
  );

  return { requireAuth, ensureAuth, isAuthenticated };
}
