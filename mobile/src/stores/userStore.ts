import { create } from "zustand";
import { authClient } from "@/lib/auth-client";
import { pickAndUploadImage } from "@/lib/api/upload";
import { useMapStore } from "@/stores/mapStore";

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: UserType;
  gender?: string;
  password: string;
}

interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  image?: string;
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

  updateProfile: (update: ProfileUpdate) => Promise<AuthResult>;
  uploadAvatar: (
    localUri: string,
  ) => Promise<{ success: boolean; error?: string; secureUrl?: string }>;

  requestEmailVerificationOtp: (email: string) => Promise<AuthResult>;
  verifyEmailOtp: (email: string, otp: string) => Promise<AuthResult>;
}

type SessionUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  role?: string;
  image?: string | null;
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
    image: user.image ?? undefined,
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
      // Wipe user-scoped local data so next account doesn't inherit farms/incidents
      useMapStore.getState().clearLocalData();
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

  updateProfile: async (update) => {
    try {
      const payload: Record<string, unknown> = {};
      if (update.firstName !== undefined) payload.firstName = update.firstName;
      if (update.lastName !== undefined) payload.lastName = update.lastName;
      if (update.phone !== undefined) payload.phone = update.phone;
      if (update.gender !== undefined) payload.gender = update.gender;
      if (update.image !== undefined) payload.image = update.image;

      const { error } = await authClient.updateUser(
        payload as Parameters<typeof authClient.updateUser>[0],
      );
      if (error) {
        return {
          success: false,
          error: extractErrorMessage(
            error,
            "Mise à jour impossible. Réessayez.",
          ),
        };
      }

      const current = get().currentUser;
      if (current) {
        set({
          currentUser: {
            ...current,
            firstName: update.firstName ?? current.firstName,
            lastName: update.lastName ?? current.lastName,
            phone: update.phone ?? current.phone,
            gender: update.gender ?? current.gender,
            image: update.image ?? current.image,
          },
        });
      } else {
        // Refresh from session if no local profile
        try {
          const { data } = await authClient.getSession();
          if (data?.user) {
            const profile = mapSessionUserToProfile(data.user as SessionUser);
            set({ currentUser: profile, userType: profile.userType });
          }
        } catch {}
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

  uploadAvatar: async (localUri) => {
    try {
      const { secureUrl } = await pickAndUploadImage("ags/avatars", localUri);
      const update = await get().updateProfile({ image: secureUrl });
      if (!update.success) {
        return { success: false, error: update.error };
      }
      return { success: true, secureUrl };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(
          err,
          "Échec de l'upload de l'avatar. Réessayez.",
        ),
      };
    }
  },

  requestEmailVerificationOtp: async (email) => {
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "email-verification",
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

  verifyEmailOtp: async (email, otp) => {
    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: email.trim().toLowerCase(),
        otp,
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
