import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "@/stores/userStore";

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
    setCurrentUser({ ...currentUser, ...formData });
    router.back();
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Header */}
      <View className="bg-primary px-6 pt-14 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text className="text-white text-base ml-2">Retour</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">
          Informations personnelles
        </Text>
        <Text className="text-white/70 text-sm mt-1">
          Consultez et modifiez vos informations
        </Text>
      </View>

      <View className="px-6 py-6 gap-4">
        {/* Account type badge (read-only) */}
        <View className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#10b981"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted-foreground mb-0.5">
              Type de compte
            </Text>
            <Text className="text-sm font-semibold text-foreground">
              {userTypeLabel[currentUser?.userType ?? ""] ?? "—"}
            </Text>
          </View>
        </View>

        {/* Form fields */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* First Name */}
          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs text-muted-foreground mb-1">Prénom</Text>
            <TextInput
              className="text-base text-foreground"
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              autoCapitalize="words"
              placeholder="Votre prénom"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Last Name */}
          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs text-muted-foreground mb-1">
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
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Email */}
          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs text-muted-foreground mb-1">Email</Text>
            <TextInput
              className="text-base text-foreground"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="votre@email.com"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Phone */}
          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs text-muted-foreground mb-1">
              Téléphone
            </Text>
            <View className="flex-row items-center">
              <Text className="text-base text-muted-foreground mr-2">
                🇸🇳 +221
              </Text>
              <TextInput
                className="flex-1 text-base text-foreground"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
                placeholder="Votre numéro"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Genre (read-only) */}
          <View className="px-4 pt-4 pb-3">
            <Text className="text-xs text-muted-foreground mb-1">Genre</Text>
            <Text className="text-base text-foreground">
              {genderLabel[formData.gender] ?? "—"}
            </Text>
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          className="bg-primary rounded-2xl py-4 items-center justify-center mt-2"
        >
          <Text className="text-white text-base font-semibold">
            Enregistrer
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
