import { create } from "zustand";
import { authClient } from "@/lib/auth-client";

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: UserType;
  gender?: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface UserStore {
  userType: UserType;
  currentUser: UserProfile | null;
  isInitialized: boolean;
  isAuthenticating: boolean;

  setUserType: (type: UserType) => void;
  toggleUserType: () => void;
  setCurrentUser: (user: UserProfile | null) => void;

  hydrateFromSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<AuthResult>;
  requestPasswordResetOtp: (email: string) => Promise<AuthResult>;
  resetPasswordWithOtp: (
    email: string,
    otp: string,
    newPassword: string,
  ) => Promise<AuthResult>;
}

type SessionUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  role?: string;
};

function mapSessionUserToProfile(user: SessionUser): UserProfile {
  const role = user.role === "farm_owner" ? "farm_owner" : "job_seeker";
  return {
    id: user.id,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
    phone: user.phone ?? "",
    userType: role,
    gender: user.gender,
  };
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const e = error as { message?: string; code?: string; statusText?: string };
    return e.message || e.statusText || e.code || fallback;
  }
  return fallback;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  userType: "job_seeker",
  currentUser: null,
  isInitialized: false,
  isAuthenticating: false,

  setUserType: (type) => set({ userType: type }),

  toggleUserType: () =>
    set((state) => ({
      userType: state.userType === "job_seeker" ? "farm_owner" : "job_seeker",
    })),

  setCurrentUser: (user) =>
    set((state) => ({
      currentUser: user,
      userType: user?.userType ?? state.userType,
    })),

  hydrateFromSession: async () => {
    try {
      const { data, error } = await authClient.getSession();
      if (error || !data?.user) {
        set({ currentUser: null, isInitialized: true });
        return;
      }
      const profile = mapSessionUserToProfile(data.user as SessionUser);
      set({
        currentUser: profile,
        userType: profile.userType,
        isInitialized: true,
      });
    } catch {
      set({ currentUser: null, isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isAuthenticating: true });
    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error || !data?.user) {
        return {
          success: false,
          error: extractErrorMessage(
            error,
            "Email ou mot de passe incorrect.",
          ),
        };
      }
      const profile = mapSessionUserToProfile(data.user as SessionUser);
      set({ currentUser: profile, userType: profile.userType });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(
          err,
          "Une erreur réseau est survenue. Réessayez.",
        ),
      };
    } finally {
      set({ isAuthenticating: false });
    }
  },

  register: async (data) => {
    set({ isAuthenticating: true });
    try {
      const role = data.userType === "farm_owner" ? "farm_owner" : "job_seeker";
      const { data: result, error } = await authClient.signUp.email({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        name: `${data.firstName} ${data.lastName}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        gender: data.gender || undefined,
        role,
      } as Parameters<typeof authClient.signUp.email>[0]);

      if (error || !result?.user) {
        return {
          success: false,
          error: extractErrorMessage(
            error,
            "Inscription impossible. Vérifiez vos informations.",
          ),
        };
      }
      const profile = mapSessionUserToProfile(result.user as SessionUser);
      set({ currentUser: profile, userType: profile.userType });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(
          err,
          "Une erreur réseau est survenue. Réessayez.",
        ),
      };
    } finally {
      set({ isAuthenticating: false });
    }
  },

  logout: async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore network errors on signout, clear local state regardless
    } finally {
      set({ currentUser: null });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        return {
          success: false,
          error: extractErrorMessage(error, "Mot de passe actuel incorrect."),
        };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(
          err,
          "Une erreur réseau est survenue. Réessayez.",
        ),
      };
    }
  },

  requestPasswordResetOtp: async (email) => {
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "forget-password",
      });
      if (error) {
        return {
          success: false,
          error: extractErrorMessage(
            error,
            "Impossible d'envoyer le code. Réessayez.",
          ),
        };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(
          err,
          "Une erreur réseau est survenue. Réessayez.",
        ),
      };
    }
  },

  resetPasswordWithOtp: async (email, otp, newPassword) => {
    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email: email.trim().toLowerCase(),
        otp,
        password: newPassword,
      });
      if (error) {
        return {
          success: false,
          error: extractErrorMessage(error, "Code invalide ou expiré."),
        };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(
          err,
          "Une erreur réseau est survenue. Réessayez.",
        ),
      };
    }
  },
}));

// Backwards-compat: dev-login screen imports DEV_ACCOUNTS to prefill creds.
// They now correspond to seeded server accounts (see scripts/seed-test-users.ts).
export const DEV_ACCOUNTS: Array<{
  email: string;
  password: string;
  userType: UserType;
  firstName: string;
  lastName: string;
}> = [
  {
    email: "amadou.diallo@example.com",
    password: "password123",
    userType: "job_seeker",
    firstName: "Amadou",
    lastName: "Diallo",
  },
  {
    email: "fatou.ndiaye@example.com",
    password: "password123",
    userType: "farm_owner",
    firstName: "Fatou",
    lastName: "Ndiaye",
  },
];
