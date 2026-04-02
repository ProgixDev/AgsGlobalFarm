import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEV_ACCOUNTS: (UserProfile & { password: string })[] = [
  {
    id: "dev-job-seeker",
    firstName: "Amadou",
    lastName: "Diallo",
    email: "amadou.diallo@example.com",
    phone: "771234567",
    userType: "job_seeker",
    gender: "male",
    password: "password123",
  },
  {
    id: "dev-farm-owner",
    firstName: "Fatou",
    lastName: "Ndiaye",
    email: "fatou.ndiaye@example.com",
    phone: "781234567",
    userType: "farm_owner",
    gender: "female",
    password: "password123",
  },
];

export { DEV_ACCOUNTS };

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: UserType;
  gender?: string;
  password: string;
}

interface UserStore {
  userType: UserType;
  currentUser: UserProfile | null;
  registeredUsers: (UserProfile & { password: string })[];
  devPasswordOverrides: Record<string, string>;
  setUserType: (type: UserType) => void;
  toggleUserType: () => void;
  setCurrentUser: (user: UserProfile | null) => void;
  login: (
    email: string,
    password: string,
  ) => { success: boolean; error?: string };
  register: (data: RegisterData) => { success: boolean; error?: string };
  changePassword: (
    email: string,
    currentPassword: string,
    newPassword: string,
  ) => { success: boolean; error?: string };
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userType: "job_seeker",
      currentUser: null,
      registeredUsers: [],
      devPasswordOverrides: {},

      setUserType: (type: UserType) => set({ userType: type }),

      toggleUserType: () =>
        set((state) => ({
          userType:
            state.userType === "job_seeker" ? "farm_owner" : "job_seeker",
        })),

      setCurrentUser: (user: UserProfile | null) =>
        set((state) => ({
          currentUser: user,
          userType: user?.userType ?? state.userType,
        })),

      login: (email: string, password: string) => {
        const { registeredUsers, devPasswordOverrides } = get();

        // Check dev accounts first
        const devUser = DEV_ACCOUNTS.find(
          (account) => account.email.toLowerCase() === email.toLowerCase(),
        );

        // Check registered users
        const registeredUser = registeredUsers.find(
          (account) => account.email.toLowerCase() === email.toLowerCase(),
        );

        const user = devUser || registeredUser;

        if (!user) {
          return {
            success: false,
            error: "Aucun compte trouvé avec cet email.",
          };
        }

        const effectivePassword = devUser
          ? (devPasswordOverrides[devUser.email.toLowerCase()] ??
            devUser.password)
          : user.password;

        if (effectivePassword !== password) {
          return { success: false, error: "Mot de passe incorrect." };
        }

        // Extract user profile without password
        const { password: _, ...userProfile } = user;
        set({ currentUser: userProfile, userType: userProfile.userType });
        return { success: true };
      },

      register: (data: RegisterData) => {
        const { registeredUsers } = get();

        // Check if email already exists in dev accounts
        const devExists = DEV_ACCOUNTS.some(
          (account) => account.email.toLowerCase() === data.email.toLowerCase(),
        );

        // Check if email already exists in registered users
        const registeredExists = registeredUsers.some(
          (account) => account.email.toLowerCase() === data.email.toLowerCase(),
        );

        if (devExists || registeredExists) {
          return {
            success: false,
            error: "Un compte avec cet email existe déjà.",
          };
        }

        // Create new user
        const newUser: UserProfile & { password: string } = {
          id: `user-${Date.now()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          userType: data.userType,
          gender: data.gender,
          password: data.password,
        };

        // Add to registered users
        set({ registeredUsers: [...registeredUsers, newUser] });

        // Set as current user (without password)
        const { password: _, ...userProfile } = newUser;
        set({ currentUser: userProfile, userType: userProfile.userType });

        return { success: true };
      },

      changePassword: (
        email: string,
        currentPassword: string,
        newPassword: string,
      ) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
          return { success: false, error: "Compte introuvable." };
        }

        const devAccount = DEV_ACCOUNTS.find(
          (account) => account.email.toLowerCase() === normalizedEmail,
        );

        if (devAccount) {
          const { devPasswordOverrides } = get();
          const currentEffectivePassword =
            devPasswordOverrides[normalizedEmail] ?? devAccount.password;

          if (currentEffectivePassword !== currentPassword) {
            return { success: false, error: "Mot de passe actuel incorrect." };
          }

          set((state) => ({
            devPasswordOverrides: {
              ...state.devPasswordOverrides,
              [normalizedEmail]: newPassword,
            },
          }));

          return { success: true };
        }

        const { registeredUsers } = get();
        const userIndex = registeredUsers.findIndex(
          (account) => account.email.toLowerCase() === normalizedEmail,
        );

        if (userIndex === -1) {
          return { success: false, error: "Compte introuvable." };
        }

        if (registeredUsers[userIndex].password !== currentPassword) {
          return { success: false, error: "Mot de passe actuel incorrect." };
        }

        const updatedUsers = [...registeredUsers];
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          password: newPassword,
        };

        set({ registeredUsers: updatedUsers });
        return { success: true };
      },
    }),
    {
      name: "@ags_user_storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
