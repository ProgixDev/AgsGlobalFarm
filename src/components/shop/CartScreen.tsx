import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { AnimatedPressable } from "@/components/animated";
import { useTabBarInset } from "@/components/ui/FloatingTabBar";
import { useShopStore } from "@/stores/shopStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { colors } from "@/theme/colors";
import { formatFcfa } from "@/utils/currency";
import { haptic } from "@/utils/haptics";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import {
  buildMobileCheckoutUrl,
  generateOneTimeToken,
} from "@/lib/api/payment";

type Props = {
  origin: ShopOrigin;
};

function getOriginPathname(
  origin: ShopOrigin,
): "/(tabs)/shop" | "/(tabs-job-seeker)/shop" {
  return origin === "tabs" ? "/(tabs)/shop" : "/(tabs-job-seeker)/shop";
}

function goToOriginShop(
  router: ReturnType<typeof useRouter>,
  origin: ShopOrigin,
) {
  router.replace(getOriginPathname(origin) as any);
}

export default function CartScreen({ origin }: Props) {
  const router = useRouter();
  useHideTabBar();
  const tabBarInset = useTabBarInset();
  const cart = useShopStore((state) => state.cart);
  const getProductById = useShopStore((state) => state.getProductById);
  const incrementItem = useShopStore((state) => state.incrementItem);
  const decrementItem = useShopStore((state) => state.decrementItem);
  const removeItem = useShopStore((state) => state.removeItem);
  const clearCart = useShopStore((state) => state.clearCart);
  const getCartTotals = useShopStore((state) => state.getCartTotals);
  const productsStatus = useShopStore((state) => state.productsStatus);
  const loadProducts = useShopStore((state) => state.loadProducts);
  const loadOrders = useOrdersStore((state) => state.loadOrders);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (productsStatus === "idle") {
      loadProducts();
    }
  }, [productsStatus, loadProducts]);
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>(
    {},
  );

  const cartDetails = useMemo(
    () =>
      cart
        .map((line) => ({
          line,
          product: getProductById(line.productId),
        }))
        .filter((entry) => !!entry.product),
    [cart, getProductById],
  );

  const totals = getCartTotals();

  const handlePay = async () => {
    if (cart.length === 0 || paying) return;
    setPaying(true);
    haptic.selection();
    try {
      const token = await generateOneTimeToken();
      const url = buildMobileCheckoutUrl(
        token,
        cart.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      );
      const returnUrl = Linking.createURL("payment/return");
      const result = await WebBrowser.openAuthSessionAsync(url, returnUrl);
      // Refresh orders to reflect any new paid order
      await loadOrders();
      if (result.type === "success" || result.type === "dismiss") {
        // Treat any close as completion; backend IPN is source of truth
        clearCart();
        router.replace("/payment/return" as any);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du paiement";
      Alert.alert("Paiement impossible", message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-3 border-b border-gray-100 bg-white flex-row items-center">
        <AnimatedPressable
          onPress={() => goToOriginShop(router, origin)}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color={colors.muted} />
        </AnimatedPressable>
        <Text className="ml-3 text-base font-heading-bold text-gray-900">
          Mon panier
        </Text>
      </View>

      {cartDetails.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cart-outline" size={64} color={colors.mutedLight} />
          <Text className="text-lg font-heading-bold text-gray-700 mt-4">
            Votre panier est vide
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1">
            Ajoutez des intrants pour preparer votre prochaine campagne.
          </Text>
          <AnimatedPressable
            className="mt-5 bg-primary px-5 py-3 rounded-xl"
            onPress={() => goToOriginShop(router, origin)}
          >
            <Text className="text-white font-sans-semibold">
              Retour a la boutique
            </Text>
          </AnimatedPressable>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingBottom: tabBarInset }}
            className="px-5 pt-4"
          >
            {cartDetails.map(({ line, product }) => {
              if (!product) return null;

              return (
                <View
                  key={line.productId}
                  className="bg-white border border-gray-100 rounded-2xl p-3 mb-3"
                >
                  <View className="flex-row">
                    <Image
                      source={
                        imageErrors[line.productId]
                          ? require("../../../assets/images/formation.jpg")
                          : { uri: product.imageUrl }
                      }
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [line.productId]: true,
                        }))
                      }
                      className="w-20 h-20 rounded-xl"
                      resizeMode="cover"
                    />
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-sm font-heading-bold text-gray-900"
                        numberOfLines={2}
                      >
                        {product.name}
                      </Text>
                      <Text className="text-xs text-gray-500 font-sans mt-0.5">
                        {product.unit}
                      </Text>
                      <Text className="text-sm font-sans-bold text-primary mt-1">
                        {formatFcfa(product.priceTTC)}
                      </Text>

                      <View className="mt-2 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <AnimatedPressable
                            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                            onPress={() => {
                              haptic.selection();
                              decrementItem(line.productId);
                            }}
                          >
                            <Ionicons
                              name="remove"
                              size={18}
                              color={colors.muted}
                            />
                          </AnimatedPressable>

                          <Text className="mx-3 text-sm font-sans-semibold text-gray-800">
                            {line.quantity}
                          </Text>

                          <AnimatedPressable
                            className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center"
                            onPress={() => {
                              haptic.selection();
                              incrementItem(line.productId);
                            }}
                          >
                            <Ionicons
                              name="add"
                              size={18}
                              color={colors.primary}
                            />
                          </AnimatedPressable>
                        </View>

                        <AnimatedPressable
                          onPress={() => removeItem(line.productId)}
                        >
                          <Text className="text-xs font-sans-semibold text-red-600">
                            Retirer
                          </Text>
                        </AnimatedPressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            <View className="bg-white border border-gray-100 rounded-2xl p-4 mt-1">
              <Text className="text-sm font-heading-semibold text-gray-900 mb-3">
                Resume
              </Text>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-sans text-gray-600">
                  Sous-total
                </Text>
                <Text className="text-sm font-sans-semibold text-gray-900">
                  {formatFcfa(totals.subtotal)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-sans text-gray-600">
                  TVA (18%)
                </Text>
                <Text className="text-sm font-sans-semibold text-gray-900">
                  {formatFcfa(totals.tax)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-sans text-gray-600">
                  Livraison
                </Text>
                <Text className="text-sm font-sans-semibold text-gray-900">
                  {formatFcfa(totals.shipping)}
                </Text>
              </View>
              <View className="h-px bg-gray-100 my-2" />
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-sans-bold text-gray-900">
                  Total
                </Text>
                <Text className="text-base font-sans-bold text-primary">
                  {formatFcfa(totals.total)}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View className="bg-white border-t border-gray-200 px-5 py-4">
            <AnimatedPressable
              className={`rounded-xl py-4 items-center ${
                paying ? "bg-primary/60" : "bg-primary"
              }`}
              disabled={paying}
              onPress={handlePay}
            >
              {paying ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text className="text-white font-sans-bold">
                  Payer · {formatFcfa(totals.total)}
                </Text>
              )}
            </AnimatedPressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
