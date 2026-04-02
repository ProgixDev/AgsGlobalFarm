import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/stores/userStore";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { TAB_BAR_HEIGHT } from "@/components/ui/FloatingTabBar";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const handleLogout = () => {
    haptic.warning();
    setCurrentUser(null);
    router.replace(__DEV__ ? "/(auth)/dev-login" : "/(auth)/login");
  };

  const handleResetOnboarding = async () => {
    haptic.medium();
    await AsyncStorage.removeItem("onboardingCompleted");
    setCurrentUser(null);
    router.replace("/");
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
    isLast = false,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    isLast?: boolean;
  }) => (
    <AnimatedPressable
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      className={`flex-row items-center px-4 py-4 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-3">
        <Ionicons name={icon as any} size={20} color={colors.primary} />
      </View>
      <Text className="flex-1 text-base font-sans text-foreground">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
    </AnimatedPressable>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: TAB_BAR_HEIGHT }}
    >
      {/* Header */}
      <View
        className="bg-primary px-6 pb-10 items-center"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-4">
          <Ionicons name="person" size={48} color={colors.white} />
        </View>
        <Text className="text-white text-2xl font-heading-bold">
          {currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : "Utilisateur"}
        </Text>
        <Text className="text-white/70 text-sm font-sans mt-1">
          {currentUser?.email ?? "utilisateur@email.com"}
        </Text>
      </View>

      <FadeInView className="flex-1 px-6 py-6">
        {/* Account Section */}
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Compte
        </Text>
        <View className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
          <MenuItem
            icon="person-outline"
            label="Informations personnelles"
            onPress={() => router.push("/account/personal-info")}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Changer le mot de passe"
            onPress={() => router.push("/(auth)/change-password")}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push("/account/notifications")}
            isLast
          />
        </View>

        {/* Support Section */}
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Support
        </Text>
        <View className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
          <MenuItem
            icon="help-circle-outline"
            label="Aide"
            onPress={() => router.push("/support/help")}
          />
          <MenuItem
            icon="document-text-outline"
            label="Conditions d'utilisation"
            onPress={() => router.push("/support/terms")}
            isLast
          />
        </View>

        {/* Logout */}
        <AnimatedPressable
          onPress={handleLogout}
          hapticType="medium"
          className="flex-row items-center justify-center bg-red-50 border border-red-200 rounded-2xl py-4"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text className="text-red-500 font-sans-semibold text-base ml-2">
            Se déconnecter
          </Text>
        </AnimatedPressable>

        {/* Dev: Reset Onboarding */}
        {__DEV__ && (
          <AnimatedPressable
            onPress={handleResetOnboarding}
            hapticType="medium"
            className="flex-row items-center justify-center bg-orange-50 border border-orange-200 rounded-2xl py-4 mt-3"
          >
            <Ionicons name="refresh-outline" size={20} color={colors.warning} />
            <Text className="text-orange-500 font-sans-semibold text-base ml-2">
              Réinitialiser l&apos;onboarding
            </Text>
          </AnimatedPressable>
        )}
      </FadeInView>
    </ScrollView>
  );
}
