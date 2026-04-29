import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/animated";
import { useOrdersStore } from "@/stores/ordersStore";
import { colors } from "@/theme/colors";
import { formatFcfa } from "@/utils/currency";

function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function statusBadge(status: Order["paymentStatus"]) {
  switch (status) {
    case "paid":
      return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Payée" };
    case "pending":
      return { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente" };
    case "failed":
      return { bg: "bg-red-100", text: "text-red-700", label: "Échouée" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-700", label: status };
  }
}

export default function OrdersListScreen() {
  const router = useRouter();
  const orders = useOrdersStore((state) => state.orders);
  const ordersStatus = useOrdersStore((state) => state.ordersStatus);
  const ordersError = useOrdersStore((state) => state.ordersError);
  const loadOrders = useOrdersStore((state) => state.loadOrders);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const isLoading = ordersStatus === "loading";
  const hasError = ordersStatus === "error";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-3 border-b border-gray-100 bg-white flex-row items-center">
        <AnimatedPressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color={colors.muted} />
        </AnimatedPressable>
        <Text className="ml-3 text-base font-heading-bold text-gray-900">
          Mes commandes
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {isLoading && (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-sm font-sans text-gray-500 mt-3">
              Chargement des commandes...
            </Text>
          </View>
        )}

        {hasError && !isLoading && (
          <View className="items-center py-16">
            <Ionicons
              name="cloud-offline-outline"
              size={60}
              color={colors.mutedLight}
            />
            <Text className="text-base font-heading-bold text-gray-700 mt-3">
              Impossible de charger les commandes
            </Text>
            {ordersError && (
              <Text className="text-xs font-sans text-gray-500 mt-1 text-center">
                {ordersError}
              </Text>
            )}
            <AnimatedPressable
              className="mt-4 px-5 py-2.5 rounded-full bg-primary"
              onPress={loadOrders}
            >
              <Text className="text-sm font-sans-semibold text-white">
                Réessayer
              </Text>
            </AnimatedPressable>
          </View>
        )}

        {!isLoading && !hasError && orders.length === 0 && (
          <View className="items-center py-16">
            <Ionicons
              name="receipt-outline"
              size={60}
              color={colors.mutedLight}
            />
            <Text className="text-base font-heading-bold text-gray-700 mt-3">
              Aucune commande
            </Text>
            <Text className="text-sm font-sans text-gray-500 mt-1 text-center">
              Vos commandes apparaîtront ici après paiement.
            </Text>
          </View>
        )}

        {!isLoading &&
          !hasError &&
          orders.map((order) => {
            const badge = statusBadge(order.paymentStatus);
            const itemsCount = order.items.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0,
            );
            return (
              <AnimatedPressable
                key={order._id}
                className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
                onPress={() =>
                  router.push(`/orders/${order._id}` as any)
                }
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs font-sans text-gray-500">
                      Commande #{order._id.slice(-8)}
                    </Text>
                    <Text className="text-sm font-sans-semibold text-gray-800 mt-0.5">
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                  <View
                    className={`${badge.bg} px-2.5 py-1 rounded-full`}
                  >
                    <Text
                      className={`${badge.text} text-xs font-sans-bold`}
                    >
                      {badge.label}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-sans text-gray-600">
                    {itemsCount} article{itemsCount > 1 ? "s" : ""}
                  </Text>
                  <Text className="text-base font-heading-bold text-primary">
                    {formatFcfa(order.totalAmount)}
                  </Text>
                </View>
              </AnimatedPressable>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}
