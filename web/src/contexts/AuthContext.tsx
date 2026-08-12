"use client";

import { createContext, useContext, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { User } from "@/types";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    gender: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user ? (session.user as User) : null;
  const isLoading = isPending;

  const login = async (email: string, password: string): Promise<void> => {
    await authClient.signIn.email({
      email,
      password,
    });
  };

  const register = async (
    firstName: string,
    lastName: string,
    gender: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<void> => {
    const result = await (authClient.signUp.email as any)({
      provider: "email",
      email,
      password,
      name: firstName + " " + lastName,
      firstName,
      lastName,
      gender: gender || undefined,
      phone: phone || undefined,
    });

    if (result.error) {
      throw new Error(result.error.message || "Erreur d'inscription");
    }
  };

  const logout = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
