import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthGateStore } from "@/stores/authGateStore";
import { colors } from "@/theme/colors";
import { haptic } from "@/utils/haptics";

const DEFAULT_MESSAGE =
  "Connectez-vous pour continuer cette action.";

export default function AuthGateModal() {
  const visible = useAuthGateStore((s) => s.visible);
  const message = useAuthGateStore((s) => s.message);
  const close = useAuthGateStore((s) => s.close);

  const handleLogin = () => {
    haptic.selection();
    close();
    router.push("/(auth)/login");
  };

  const handleSignup = () => {
    haptic.selection();
    close();
    router.push("/(auth)/signup");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-md">
          <View className="bg-primary/10 self-start rounded-full p-3 mb-4">
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color={colors.primary}
            />
          </View>
          <Text className="text-xl font-heading-bold text-gray-900 mb-2">
            Connexion requise
          </Text>
          <Text className="text-sm font-sans text-gray-600 mb-6">
            {message ?? DEFAULT_MESSAGE}
          </Text>

          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.85}
            className="rounded-2xl py-3.5 items-center mb-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-sans-bold text-base">
              Se connecter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignup}
            activeOpacity={0.85}
            className="rounded-2xl py-3.5 items-center mb-2 border"
            style={{ borderColor: colors.primary }}
          >
            <Text
              className="font-sans-semibold text-base"
              style={{ color: colors.primary }}
            >
              Créer un compte
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={close}
            activeOpacity={0.85}
            className="py-3 items-center"
          >
            <Text className="text-sm font-sans text-gray-500">Plus tard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
