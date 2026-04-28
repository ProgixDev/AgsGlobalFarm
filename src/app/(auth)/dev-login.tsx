import React, { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DEV_ACCOUNTS, useUserStore } from "@/stores/userStore";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { colors } from "@/theme/colors";

type UserTypeTab = "job_seeker" | "farm_owner";

export default function DevLogin() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);
  const [activeTab, setActiveTab] = useState<UserTypeTab>("job_seeker");
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!__DEV__) {
    router.replace("/(auth)/login");
    return null;
  }

  const displayedUsers = DEV_ACCOUNTS.filter((u) => u.userType === activeTab);
  const jobSeekers = DEV_ACCOUNTS.filter((u) => u.userType === "job_seeker");
  const farmOwners = DEV_ACCOUNTS.filter((u) => u.userType === "farm_owner");

  const handleSelectAccount = async (account: (typeof DEV_ACCOUNTS)[number]) => {
    setError("");
    setLoadingEmail(account.email);
    const result = await login(account.email, account.password);
    setLoadingEmail(null);

    if (!result.success) {
      haptic.error();
      setError(
        result.error ||
          "Connexion impossible. Avez-vous lancé le seed des comptes de test ?",
      );
      return;
    }

    haptic.success();
    router.replace(
      account.userType === "job_seeker"
        ? "/(tabs-job-seeker)/map"
        : "/(tabs)/map",
    );
  };

  const userTypeLabel: Record<UserTypeTab, string> = {
    job_seeker: "Chercheur d'emploi",
    farm_owner: "Propriétaire de ferme / Recruteur",
  };

  const userTypeColor: Record<UserTypeTab, string> = {
    job_seeker: colors.success,
    farm_owner: colors.warning,
  };

  const userTypeIcon: Record<UserTypeTab, keyof typeof Ionicons.glyphMap> = {
    job_seeker: "person-outline",
    farm_owner: "leaf-outline",
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 px-6 py-16">
        <View className="mb-10">
          <View className="flex-row items-center mb-2">
            <View className="bg-yellow-400 rounded-lg px-2 py-0.5 mr-3">
              <Text className="text-yellow-900 text-xs font-sans-bold uppercase tracking-wider">
                DEV
              </Text>
            </View>
            <Text className="text-2xl font-heading-bold text-foreground">
              Connexion rapide
            </Text>
          </View>
          <Text className="text-muted-foreground text-sm font-sans">
            Comptes de test seedés sur le backend. Lancez{" "}
            <Text className="font-sans-semibold">
              bun run scripts/seed-test-users.ts
            </Text>{" "}
            côté API si la connexion échoue.
          </Text>
        </View>

        {error ? (
          <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.danger}
            />
            <Text className="text-red-600 text-sm font-sans ml-2 flex-1">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="flex-row gap-2 mb-6">
          <AnimatedPressable
            onPress={() => {
              haptic.selection();
              setActiveTab("job_seeker");
            }}
            className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center ${
              activeTab === "job_seeker"
                ? "bg-emerald-500"
                : "bg-white border border-gray-200"
            }`}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={activeTab === "job_seeker" ? colors.white : colors.muted}
            />
            <Text
              className={`ml-2 font-sans-medium ${
                activeTab === "job_seeker" ? "text-white" : "text-gray-600"
              }`}
            >
              Chercheurs d&apos;emploi
            </Text>
            <View
              className={`ml-2 px-2 py-0.5 rounded-full ${
                activeTab === "job_seeker" ? "bg-white/20" : "bg-emerald-100"
              }`}
            >
              <Text
                className={`text-xs font-sans-semibold ${
                  activeTab === "job_seeker" ? "text-white" : "text-emerald-600"
                }`}
              >
                {jobSeekers.length}
              </Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => {
              haptic.selection();
              setActiveTab("farm_owner");
            }}
            className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center ${
              activeTab === "farm_owner"
                ? "bg-amber-500"
                : "bg-white border border-gray-200"
            }`}
          >
            <Ionicons
              name="leaf-outline"
              size={18}
              color={activeTab === "farm_owner" ? colors.white : colors.muted}
            />
            <Text
              className={`ml-2 font-sans-medium ${
                activeTab === "farm_owner" ? "text-white" : "text-gray-600"
              }`}
            >
              Recruteurs
            </Text>
            <View
              className={`ml-2 px-2 py-0.5 rounded-full ${
                activeTab === "farm_owner" ? "bg-white/20" : "bg-amber-100"
              }`}
            >
              <Text
                className={`text-xs font-sans-semibold ${
                  activeTab === "farm_owner" ? "text-white" : "text-amber-600"
                }`}
              >
                {farmOwners.length}
              </Text>
            </View>
          </AnimatedPressable>
        </View>

        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {userTypeLabel[activeTab]}
        </Text>
        <FadeInView>
          <View className="gap-4 mb-10">
            {displayedUsers.length === 0 ? (
              <View className="bg-gray-50 rounded-2xl p-8 items-center">
                <Ionicons
                  name="people-outline"
                  size={40}
                  color={colors.mutedLighter}
                />
                <Text className="text-gray-500 mt-2 text-center font-sans">
                  Aucun compte de test pour ce rôle.
                </Text>
              </View>
            ) : (
              displayedUsers.map((account) => {
                const isLoading = loadingEmail === account.email;
                return (
                  <AnimatedPressable
                    key={account.email}
                    onPress={() => handleSelectAccount(account)}
                    disabled={isLoading}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-14 h-14 rounded-full items-center justify-center mr-4"
                        style={{
                          backgroundColor:
                            userTypeColor[account.userType] + "20",
                        }}
                      >
                        <Ionicons
                          name={userTypeIcon[account.userType]}
                          size={26}
                          color={userTypeColor[account.userType]}
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-base font-sans-semibold text-foreground">
                          {account.firstName} {account.lastName}
                        </Text>
                        <Text className="text-sm font-sans text-muted-foreground mb-1">
                          {account.email}
                        </Text>
                        <View
                          className="self-start rounded-full px-2 py-0.5"
                          style={{
                            backgroundColor:
                              userTypeColor[account.userType] + "20",
                          }}
                        >
                          <Text
                            className="text-xs font-sans-medium"
                            style={{ color: userTypeColor[account.userType] }}
                          >
                            {userTypeLabel[account.userType]}
                          </Text>
                        </View>
                      </View>

                      {isLoading ? (
                        <ActivityIndicator
                          size="small"
                          color={userTypeColor[account.userType]}
                        />
                      ) : (
                        <Ionicons
                          name="arrow-forward-circle"
                          size={28}
                          color={userTypeColor[account.userType]}
                        />
                      )}
                    </View>
                  </AnimatedPressable>
                );
              })
            )}
          </View>
        </FadeInView>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-xs font-sans text-muted-foreground mx-3">
            ou
          </Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        <AnimatedPressable
          onPress={() => router.replace("/(auth)/login")}
          className="flex-row items-center justify-center border border-gray-200 rounded-2xl py-4"
        >
          <Ionicons name="log-in-outline" size={18} color={colors.muted} />
          <Text className="text-muted-foreground font-sans-medium ml-2">
            Aller à la page de connexion
          </Text>
        </AnimatedPressable>
      </View>
    </ScrollView>
  );
}
