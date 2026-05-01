import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/stores/userStore";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { useTabBarInset } from "@/components/ui/FloatingTabBar";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const currentUser = useUserStore((state) => state.currentUser);
  const logout = useUserStore((state) => state.logout);
  const uploadAvatar = useUserStore((state) => state.uploadAvatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handlePickAvatar = async () => {
    if (uploadingAvatar) return;
    haptic.selection();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission requise",
        "Autorisez l'accès aux photos pour changer votre avatar.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;
    const uri = result.assets[0].uri;
    setUploadingAvatar(true);
    const upload = await uploadAvatar(uri);
    setUploadingAvatar(false);
    if (!upload.success) {
      Alert.alert(
        "Échec de l'upload",
        upload.error ?? "Impossible d'envoyer la photo. Réessayez.",
      );
    } else {
      haptic.success();
    }
  };

  const handleLogout = async () => {
    haptic.warning();
    await logout();
    router.replace(__DEV__ ? "/(auth)/dev-login" : "/(auth)/login");
  };

  const handleResetOnboarding = async () => {
    haptic.medium();
    await AsyncStorage.removeItem("onboardingCompleted");
    await logout();
    router.replace("/");
  };

  const isRecruiter = currentUser?.userType === "farm_owner";

  const initials =
    `${currentUser?.firstName?.[0] ?? "U"}${currentUser?.lastName?.[0] ?? ""}`.toUpperCase();

  if (!currentUser) {
    return (
      <View
        className="flex-1 bg-gray-50 items-center justify-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: tabBarInset }}
      >
        <View className="bg-primary/10 rounded-full p-4 mb-4">
          <Ionicons
            name="person-circle-outline"
            size={48}
            color={colors.primary}
          />
        </View>
        <Text className="text-xl font-heading-bold text-gray-900 mb-2 text-center">
          Connectez-vous
        </Text>
        <Text className="text-sm font-sans text-gray-600 mb-6 text-center">
          Accédez à votre profil, vos candidatures et vos commandes.
        </Text>
        <AnimatedPressable
          className="rounded-2xl py-3.5 px-8 items-center mb-2 w-full"
          style={{ backgroundColor: colors.primary }}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-white font-sans-bold text-base">
            Se connecter
          </Text>
        </AnimatedPressable>
        <AnimatedPressable
          className="rounded-2xl py-3.5 px-8 items-center border w-full"
          style={{ borderColor: colors.primary }}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text
            className="font-sans-semibold text-base"
            style={{ color: colors.primary }}
          >
            Créer un compte
          </Text>
        </AnimatedPressable>
      </View>
    );
  }

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
      contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset }}
    >
      <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-3">
        <Text className="text-xs font-sans-semibold uppercase tracking-wider text-gray-500 mb-2">
          Profil
        </Text>

        <View className="bg-white border border-gray-100 rounded-3xl p-4 flex-row items-center">
          <AnimatedPressable
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
            className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mr-3 overflow-hidden"
          >
            {uploadingAvatar ? (
              <ActivityIndicator color={colors.white} />
            ) : currentUser?.image ? (
              <Image
                source={{ uri: currentUser.image }}
                style={{ width: 56, height: 56 }}
              />
            ) : (
              <Text className="text-white text-lg font-heading-bold">
                {initials}
              </Text>
            )}
            <View className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 border border-gray-200">
              <Ionicons name="camera" size={10} color={colors.primary} />
            </View>
          </AnimatedPressable>

          <View className="flex-1">
            <Text
              className="text-lg font-heading-bold text-gray-900"
              numberOfLines={1}
            >
              {currentUser
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : "Utilisateur"}
            </Text>
            <Text className="text-xs font-sans text-gray-500" numberOfLines={1}>
              {currentUser?.email ?? "utilisateur@email.com"}
            </Text>
            <View className="self-start mt-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <Text className="text-[11px] font-sans-semibold text-emerald-700">
                {isRecruiter ? "Compte recruteur" : "Compte candidat"}
              </Text>
            </View>
          </View>

          <AnimatedPressable
            onPress={() => {
              haptic.selection();
              router.push("/account/personal-info");
            }}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="create-outline" size={18} color={colors.muted} />
          </AnimatedPressable>
        </View>
      </View>

      <FadeInView className="flex-1 px-5 py-2">
        <View className="bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3 mb-5">
          <Text className="text-sm font-sans-semibold text-primary">
            {isRecruiter
              ? "Suivez vos offres et candidatures depuis votre espace"
              : "Suivez vos candidatures et votre progression facilement"}
          </Text>
        </View>

        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {isRecruiter ? "Pilotage" : "Mon espace"}
        </Text>
        <View className="bg-white rounded-3xl border border-gray-100 mb-6 overflow-hidden">
          {isRecruiter ? (
            <>
              <MenuItem
                icon="briefcase-outline"
                label="Mes offres"
                onPress={() => router.push("/(tabs)/jobs")}
              />
              <MenuItem
                icon="people-outline"
                label="Candidatures recues"
                onPress={() => router.push("/(tabs)/jobs")}
              />
              <MenuItem
                icon="receipt-outline"
                label="Mes commandes"
                onPress={() => router.push("/orders" as any)}
              />
              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                onPress={() => router.push("/account/notifications")}
                isLast
              />
            </>
          ) : (
            <>
              <MenuItem
                icon="document-text-outline"
                label="Mes candidatures"
                onPress={() => router.push("/(tabs-job-seeker)/jobs")}
              />
              <MenuItem
                icon="school-outline"
                label="Mes formations"
                onPress={() => router.push("/(tabs)/training")}
              />
              <MenuItem
                icon="receipt-outline"
                label="Mes commandes"
                onPress={() => router.push("/orders" as any)}
              />
              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                onPress={() => router.push("/account/notifications")}
                isLast
              />
            </>
          )}
        </View>

        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Compte
        </Text>
        <View className="bg-white rounded-3xl border border-gray-100 mb-6 overflow-hidden">
          <MenuItem
            icon="person-outline"
            label="Informations personnelles"
            onPress={() => router.push("/account/personal-info")}
            isLast
          />
        </View>

        {/* Support Section */}
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Support
        </Text>
        <View className="bg-white rounded-3xl border border-gray-100 mb-6 overflow-hidden">
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
