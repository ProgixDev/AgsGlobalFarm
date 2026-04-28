import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/animated";
import { useTabBarInset } from "@/components/ui/FloatingTabBar";
import { useShopStore } from "@/stores/shopStore";
import { colors } from "@/theme/colors";
import { formatFcfa } from "@/utils/currency";
import { haptic } from "@/utils/haptics";
import { useHideTabBar } from "@/hooks/useHideTabBar";

type Props = {
  productId: string;
  origin: ShopOrigin;
};

function getOriginShopPath(
  origin: ShopOrigin,
): "/(tabs)/shop" | "/(tabs-job-seeker)/shop" {
  return origin === "tabs" ? "/(tabs)/shop" : "/(tabs-job-seeker)/shop";
}

function navigateToOriginShop(
  router: ReturnType<typeof useRouter>,
  origin: ShopOrigin,
) {
  router.replace(getOriginShopPath(origin) as any);
}

export default function ShopDetailScreen({ productId, origin }: Props) {
  const router = useRouter();
  useHideTabBar();
  const tabBarInset = useTabBarInset();
  const [hasImageError, setHasImageError] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 1800);
  };

  const product = useShopStore((state) => state.getProductById(productId));
  const refreshProductById = useShopStore((state) => state.refreshProductById);
  const addToCart = useShopStore((state) => state.addToCart);
  const getCartQuantityForProduct = useShopStore(
    (state) => state.getCartQuantityForProduct,
  );

  const [fetchStatus, setFetchStatus] = useState<
    "idle" | "loading" | "missing"
  >("idle");

  useEffect(() => {
    if (!product && fetchStatus === "idle") {
      setFetchStatus("loading");
      refreshProductById(productId).then((p) => {
        setFetchStatus(p ? "idle" : "missing");
      });
    }
  }, [product, productId, refreshProductById, fetchStatus]);

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
          <AnimatedPressable
            onPress={() => navigateToOriginShop(router, origin)}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color={colors.muted} />
          </AnimatedPressable>
          <Text className="ml-3 text-base font-heading-bold text-gray-900">
            Boutique
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          {fetchStatus === "loading" ? (
            <>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="mt-3 text-gray-500 font-sans">
                Chargement...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="alert-circle-outline"
                size={60}
                color={colors.mutedLight}
              />
              <Text className="mt-3 text-gray-500 font-sans">
                Produit introuvable.
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const currentQty = getCartQuantityForProduct(product.id);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <AnimatedPressable
          onPress={() => navigateToOriginShop(router, origin)}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color={colors.muted} />
        </AnimatedPressable>
        <Text
          className="text-base font-heading-bold text-gray-900 flex-1 ml-3"
          numberOfLines={1}
        >
          {product.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: tabBarInset }}>
        <Image
          source={
            hasImageError
              ? require("../../../assets/images/formation.jpg")
              : { uri: product.imageUrl }
          }
          onError={() => setHasImageError(true)}
          className="w-full h-72"
          resizeMode="cover"
        />

        <View className="px-5 pt-4">
          <View className="flex-row items-start justify-between">
            <Text className="text-xl font-heading-bold text-gray-900 flex-1 mr-3">
              {product.name}
            </Text>
            <Text className="text-primary font-heading-bold text-lg">
              {formatFcfa(product.priceTTC)}
            </Text>
          </View>

          <Text className="text-gray-500 font-sans mt-1">{product.unit}</Text>

          <View className="mt-3">
            <View
              className={`self-start px-2.5 py-1 rounded-full ${
                product.isInStock ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-sans-semibold ${
                  product.isInStock ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {product.isInStock ? "En stock" : "Rupture de stock"}
              </Text>
            </View>
          </View>

          <Text className="mt-5 text-sm font-sans text-gray-700 leading-6">
            {product.longDescription}
          </Text>

          <View className="mt-5 bg-gray-50 rounded-2xl p-4 border border-gray-100">
            {product.brand ? (
              <Text className="text-sm font-sans text-gray-700 mb-1">
                Marque: {product.brand}
              </Text>
            ) : null}
            {product.origin ? (
              <Text className="text-sm font-sans text-gray-700 mb-1">
                Origine: {product.origin}
              </Text>
            ) : null}
            {product.usage ? (
              <Text className="text-sm font-sans text-gray-700 mb-1">
                Usage: {product.usage}
              </Text>
            ) : null}
            {product.dosage ? (
              <Text className="text-sm font-sans text-gray-700 mb-1">
                Dosage: {product.dosage}
              </Text>
            ) : null}
            {product.safety ? (
              <Text className="text-sm font-sans text-gray-700">
                Securite: {product.safety}
              </Text>
            ) : null}
          </View>

          {currentQty > 0 ? (
            <Text className="mt-2 text-xs font-sans text-gray-500">
              Dans votre panier: {currentQty}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View className="px-5 py-4 bg-white border-t border-gray-200">
        <AnimatedPressable
          onPress={() => {
            haptic.selection();
            const result = addToCart(product.id);
            if (result.ok) {
              showFeedback("Produit ajoute au panier.");
              return;
            }
            showFeedback(result.message ?? "Impossible d'ajouter ce produit.");
          }}
          className={`rounded-xl py-4 items-center ${
            product.isInStock ? "bg-primary" : "bg-gray-200"
          }`}
          disabled={!product.isInStock}
        >
          <Text
            className={`text-base font-sans-bold ${
              product.isInStock ? "text-white" : "text-gray-500"
            }`}
          >
            {product.isInStock ? "Ajouter au panier" : "Rupture de stock"}
          </Text>
        </AnimatedPressable>
      </View>

      {feedback ? (
        <View className="absolute left-5 right-5 bottom-24 bg-gray-900/90 px-4 py-3 rounded-xl">
          <Text className="text-white text-sm font-sans-semibold text-center">
            {feedback}
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
