import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DEV_ACCOUNTS, useUserStore } from "@/stores/userStore";

export default function DevLogin() {
  const router = useRouter();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const registeredUsers = useUserStore((state) => state.registeredUsers);

  // Combine dev accounts and registered users
  const allUsers: UserProfile[] = [
    ...DEV_ACCOUNTS.map(({ password, ...user }) => user),
    ...registeredUsers,
  ];

  if (!__DEV__) {
    router.replace("/(auth)/login");
    return null;
  }

  const handleSelectAccount = (account: UserProfile) => {
    setCurrentUser(account);
    router.replace("/(tabs)/map");
  };

  const userTypeLabel: Record<UserProfile["userType"], string> = {
    job_seeker: "Chercheur d'emploi",
    farm_owner: "Propriétaire de ferme / Recruteur",
  };

  const userTypeColor: Record<UserProfile["userType"], string> = {
    job_seeker: "#10b981",
    farm_owner: "#f59e0b",
  };

  const userTypeIcon: Record<
    UserProfile["userType"],
    keyof typeof Ionicons.glyphMap
  > = {
    job_seeker: "person-outline",
    farm_owner: "leaf-outline",
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 px-6 py-16">
        {/* Header */}
        <View className="mb-10">
          <View className="flex-row items-center mb-2">
            <View className="bg-yellow-400 rounded-lg px-2 py-0.5 mr-3">
              <Text className="text-yellow-900 text-xs font-bold uppercase tracking-wider">
                DEV
              </Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">
              Connexion rapide
            </Text>
          </View>
          <Text className="text-muted-foreground text-sm">
            Sélectionnez un compte prédéfini pour tester l&apos;application.
            Cette page n&apos;est disponible qu&apos;en mode développement.
          </Text>
        </View>

        {/* Account Cards */}
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Comptes disponibles
        </Text>
        <View className="gap-4 mb-10">
          {allUsers.map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => handleSelectAccount(account)}
              activeOpacity={0.85}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <View className="flex-row items-center">
                {/* Avatar */}
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{
                    backgroundColor: userTypeColor[account.userType] + "20",
                  }}
                >
                  <Ionicons
                    name={userTypeIcon[account.userType]}
                    size={26}
                    color={userTypeColor[account.userType]}
                  />
                </View>

                {/* Info */}
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {account.firstName} {account.lastName}
                  </Text>
                  <Text className="text-sm text-muted-foreground mb-1">
                    {account.email}
                  </Text>
                  <View
                    className="self-start rounded-full px-2 py-0.5"
                    style={{
                      backgroundColor: userTypeColor[account.userType] + "20",
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: userTypeColor[account.userType] }}
                    >
                      {userTypeLabel[account.userType]}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name="arrow-forward-circle"
                  size={28}
                  color={userTypeColor[account.userType]}
                />
              </View>

              {/* Extra details */}
              <View className="flex-row mt-4 pt-4 border-t border-gray-100 gap-4">
                <View className="flex-row items-center">
                  <Ionicons name="call-outline" size={14} color="#9ca3af" />
                  <Text className="text-xs text-muted-foreground ml-1">
                    +221 {account.phone}
                  </Text>
                </View>
                {account.gender && (
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={14} color="#9ca3af" />
                    <Text className="text-xs text-muted-foreground ml-1">
                      {account.gender === "male"
                        ? "Homme"
                        : account.gender === "female"
                          ? "Femme"
                          : "Autre"}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-xs text-muted-foreground mx-3">ou</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Go to real login */}
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          activeOpacity={0.7}
          className="flex-row items-center justify-center border border-gray-200 rounded-2xl py-4"
        >
          <Ionicons name="log-in-outline" size={18} color="#6b7280" />
          <Text className="text-muted-foreground font-medium ml-2">
            Aller à la page de connexion
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
