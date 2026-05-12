import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/animated";
import BackButton from "@/components/ui/BackButton";
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

function getItemPrice(item: OrderItem): number {
  return item.priceTTC ?? item.price ?? 0;
}

function getItemName(item: OrderItem): string {
  return item.name ?? item.title ?? "Article";
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const detailById = useOrdersStore((state) => state.detailById);
  const orders = useOrdersStore((state) => state.orders);
  const loadOrderById = useOrdersStore((state) => state.loadOrderById);
  const [status, setStatus] = useState<"idle" | "loading" | "missing">("idle");

  const order = detailById[id] || orders.find((o) => o._id === id);

  useEffect(() => {
    if (!id) return;
    if (order) return;
    setStatus("loading");
    (async () => {
      const result = await loadOrderById(id);
      setStatus(result ? "idle" : "missing");
    })();
  }, [id, order, loadOrderById]);

  if (status === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-sm font-sans text-gray-500 mt-3">
          Chargement de la commande...
        </Text>
      </SafeAreaView>
    );
  }

  if (!order || status === "missing") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.mutedLight}
        />
        <Text className="text-xl font-heading-bold text-gray-400 mt-4">
          Commande introuvable
        </Text>
        <AnimatedPressable
          className="bg-primary px-6 py-3 rounded-2xl mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-sans-semibold">Retour</Text>
        </AnimatedPressable>
      </SafeAreaView>
    );
  }

  const badge = statusBadge(order.paymentStatus);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-3 border-b border-gray-100 bg-white flex-row items-center">
        <BackButton variant="dark" />
        <Text className="ml-3 text-base font-heading-bold text-gray-900">
          Commande #{order._id.slice(-8)}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-sans text-gray-500">Statut</Text>
            <View className={`${badge.bg} px-2.5 py-1 rounded-full`}>
              <Text className={`${badge.text} text-xs font-sans-bold`}>
                {badge.label}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm font-sans text-gray-500">Date</Text>
            <Text className="text-sm font-sans-semibold text-gray-800">
              {formatDate(order.createdAt)}
            </Text>
          </View>
          {order.paymentMethod && (
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-sans text-gray-500">
                Paiement
              </Text>
              <Text className="text-sm font-sans-semibold text-gray-800 capitalize">
                {order.paymentMethod}
              </Text>
            </View>
          )}
          {order.paydunyaFailReason && (
            <View className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <Text className="text-xs font-sans text-red-700">
                {order.paydunyaFailReason}
              </Text>
            </View>
          )}
        </View>

        <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
          <Text className="text-sm font-sans-semibold text-gray-700 mb-2">
            Articles
          </Text>
          {order.items.map((item, idx) => {
            const itemPrice = getItemPrice(item);
            const lineTotal = itemPrice * (item.quantity || 0);
            return (
              <View
                key={`${item._id || item.id || idx}-${idx}`}
                className={`flex-row items-start justify-between py-2 ${
                  idx < order.items.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-sans-semibold text-gray-800">
                    {getItemName(item)}
                  </Text>
                  <Text className="text-xs font-sans text-gray-500 mt-0.5">
                    Qté: {item.quantity}
                    {item.unit ? ` · ${item.unit}` : ""}
                  </Text>
                </View>
                <Text className="text-sm font-sans-semibold text-gray-800">
                  {formatFcfa(lineTotal)}
                </Text>
              </View>
            );
          })}

          <View className="border-t border-gray-200 mt-3 pt-3 flex-row items-center justify-between">
            <Text className="text-base font-sans-bold text-gray-800">
              Total
            </Text>
            <Text className="text-lg font-heading-bold text-primary">
              {formatFcfa(order.totalAmount)}
            </Text>
          </View>
        </View>

        {order.address && (
          <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
            <Text className="text-sm font-sans-semibold text-gray-700 mb-2">
              Adresse de livraison
            </Text>
            <Text className="text-sm font-sans text-gray-700">
              {order.address.street}
            </Text>
            <Text className="text-sm font-sans text-gray-700">
              {order.address.city} {order.address.postalCode}
            </Text>
            <Text className="text-sm font-sans text-gray-700">
              {order.address.country}
            </Text>
          </View>
        )}

        {order.paydunyaReceiptUrl && (
          <AnimatedPressable
            className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex-row items-center justify-center"
            onPress={() => Linking.openURL(order.paydunyaReceiptUrl!)}
          >
            <Ionicons
              name="receipt-outline"
              size={18}
              color={colors.primary}
            />
            <Text className="text-primary font-sans-semibold ml-2">
              Voir le reçu PayDunya
            </Text>
          </AnimatedPressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
