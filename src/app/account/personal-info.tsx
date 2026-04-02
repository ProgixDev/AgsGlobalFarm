import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "@/stores/userStore";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import Button from "@/components/ui/Button";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName ?? "",
    lastName: currentUser?.lastName ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
    gender: currentUser?.gender ?? "",
  });

  const userTypeLabel: Record<string, string> = {
    job_seeker: "Chercheur d'emploi",
    farm_owner: "Propriétaire de ferme / Recruteur",
  };

  const genderLabel: Record<string, string> = {
    male: "Homme",
    female: "Femme",
    other: "Autre",
  };

  const handleSave = () => {
    if (!currentUser) return;
    haptic.success();
    setCurrentUser({ ...currentUser, ...formData });
    router.back();
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ScreenHeader
        title="Informations personnelles"
        subtitle="Consultez et modifiez vos informations"
        showBack
      />

      <FadeInView className="px-6 py-6 gap-4">
        <View className="bg-white border border-gray-100 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-foreground">
            Mon identite
          </Text>
          <Text className="text-xs font-sans text-muted-foreground mt-1">
            Verifiez et mettez a jour vos informations de compte.
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-sans text-muted-foreground mb-0.5">
              Type de compte
            </Text>
            <Text className="text-sm font-sans-semibold text-foreground">
              {userTypeLabel[currentUser?.userType ?? ""] ?? "—"}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs font-sans text-muted-foreground mb-1">
              Prénom
            </Text>
            <TextInput
              className="text-base text-foreground"
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              autoCapitalize="words"
              placeholder="Votre prénom"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs font-sans text-muted-foreground mb-1">
              Nom de famille
            </Text>
            <TextInput
              className="text-base text-foreground"
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              autoCapitalize="words"
              placeholder="Votre nom"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs font-sans text-muted-foreground mb-1">
              Email
            </Text>
            <TextInput
              className="text-base text-foreground"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="votre@email.com"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs font-sans text-muted-foreground mb-1">
              Téléphone
            </Text>
            <View className="flex-row items-center">
              <Text className="text-base font-sans text-muted-foreground mr-2">
                +221
              </Text>
              <TextInput
                className="flex-1 text-base text-foreground"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
                placeholder="Votre numéro"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>

          <View className="px-4 pt-4 pb-3">
            <Text className="text-xs font-sans text-muted-foreground mb-1">
              Genre
            </Text>
            <Text className="text-base font-sans text-foreground">
              {genderLabel[formData.gender] ?? "—"}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <AnimatedPressable
            onPress={() => {
              haptic.selection();
              router.push("/account/change-password");
            }}
            className="flex-row items-center px-4 py-4"
          >
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-semibold text-foreground">
                Changer le mot de passe
              </Text>
              <Text className="text-xs font-sans text-muted-foreground mt-0.5">
                Mettre a jour la securite de votre compte
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.mutedLight}
            />
          </AnimatedPressable>
        </View>

        <Button onPress={handleSave} title="Enregistrer" className="mt-1" />
      </FadeInView>
    </ScrollView>
  );
}
