import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { colors } from "@/theme/colors";

export default function Index() {
  const router = useRouter();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<
    boolean | null
  >(null);
  const isInitialized = useUserStore((s) => s.isInitialized);
  const currentUser = useUserStore((s) => s.currentUser);
  const hydrateFromSession = useUserStore((s) => s.hydrateFromSession);

  useEffect(() => {
    AsyncStorage.getItem("onboardingCompleted")
      .then((v) => setIsOnboardingCompleted(v === "true"))
      .catch(() => setIsOnboardingCompleted(false));
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      hydrateFromSession();
    }
  }, [isInitialized, hydrateFromSession]);

  useEffect(() => {
    if (isOnboardingCompleted === null || !isInitialized) return;

    if (!isOnboardingCompleted) {
      router.replace("/onboarding");
      return;
    }

    if (currentUser?.userType === "farm_owner") {
      router.replace("/(tabs)/map");
      return;
    }
    router.replace("/(tabs-job-seeker)/map");
  }, [isOnboardingCompleted, isInitialized, currentUser, router]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
