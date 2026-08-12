import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/animated";
import { useOrdersStore } from "@/stores/ordersStore";
import { colors } from "@/theme/colors";

export default function PaymentReturnScreen() {
  const router = useRouter();
  const loadOrders = useOrdersStore((state) => state.loadOrders);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
      <View className="bg-white border border-gray-100 rounded-3xl p-8 w-full max-w-sm items-center">
        <View className="bg-emerald-100 rounded-full p-4 mb-4">
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={colors.primary}
          />
        </View>
        <Text className="text-xl font-heading-bold text-gray-900 mb-2 text-center">
          Merci pour votre commande
        </Text>
        <Text className="text-sm font-sans text-gray-600 mb-6 text-center">
          Si le paiement a réussi, vous le verrez dans vos commandes. La
          confirmation arrivera également par email.
        </Text>
        <AnimatedPressable
          className="bg-primary px-6 py-3 rounded-2xl w-full items-center"
          onPress={() => router.replace("/orders" as any)}
        >
          <Text className="text-white font-sans-bold">Voir mes commandes</Text>
        </AnimatedPressable>
        <AnimatedPressable
          className="mt-3 px-6 py-3 rounded-2xl w-full items-center border border-gray-200"
          onPress={() => router.replace("/" as any)}
        >
          <Text className="text-gray-700 font-sans-semibold">
            Retour à l&apos;accueil
          </Text>
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
}
