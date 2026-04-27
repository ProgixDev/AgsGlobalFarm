import React, { useMemo, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/animated";
import { useTabBarInset } from "@/components/ui/FloatingTabBar";
import { useShopStore } from "@/stores/shopStore";
import { colors } from "@/theme/colors";
import { formatFcfa } from "@/utils/currency";
import { haptic } from "@/utils/haptics";

type Props = {
  origin: ShopOrigin;
};

const CATEGORY_OPTIONS: { key: "all" | ShopCategory; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "engrais", label: "Engrais" },
  { key: "phyto", label: "Phyto" },
  { key: "semence", label: "Semence" },
  { key: "petit_materiel", label: "Petit materiel" },
];

const SORT_OPTIONS: { key: ShopSortOption; label: string }[] = [
  { key: "none", label: "Aucun" },
  { key: "price_asc", label: "Prix croissant" },
  { key: "price_desc", label: "Prix decroissant" },
];

function ProductCard({
  product,
  onPress,
}: {
  product: ShopProduct;
  onPress: () => void;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <AnimatedPressable
      className="bg-white rounded-3xl border border-gray-100 mb-3 p-3"
      onPress={onPress}
    >
      <View className="flex-row items-start">
        <Image
          source={
            hasImageError
              ? require("../../../assets/images/formation.jpg")
              : { uri: product.imageUrl }
          }
          onError={() => setHasImageError(true)}
          className="w-24 h-24 rounded-2xl"
          resizeMode="cover"
        />
        <View className="flex-1 pl-3">
          <View className="flex-row items-start justify-between mb-1.5">
            <Text
              className="text-base font-heading-bold text-gray-900 flex-1 mr-2"
              numberOfLines={2}
            >
              {product.name}
            </Text>
          </View>

          <Text
            className="text-xs font-sans text-muted-foreground mb-3"
            numberOfLines={2}
          >
            {product.shortDescription}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-primary font-sans-bold text-base">
              {formatFcfa(product.priceTTC)}
            </Text>
            <View
              className={`px-2.5 py-1 rounded-full ${
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
          <Text className="text-xs font-sans text-gray-500 mt-1">
            {product.unit}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function ShopListScreen({ origin }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const selectedCategory = useShopStore((state) => state.selectedCategory);
  const sortOption = useShopStore((state) => state.sortOption);
  const setCategory = useShopStore((state) => state.setCategory);
  const setSortOption = useShopStore((state) => state.setSortOption);
  const getVisibleProducts = useShopStore((state) => state.getVisibleProducts);
  const getCartCount = useShopStore((state) => state.getCartCount);

  const [isSortOpen, setIsSortOpen] = useState(false);

  const products = getVisibleProducts();
  const cartCount = getCartCount();
  const currentSortLabel = useMemo(
    () => SORT_OPTIONS.find((opt) => opt.key === sortOption)?.label ?? "Aucun",
    [sortOption],
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: tabBarInset }}
    >
      <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-sans-semibold uppercase tracking-wider text-gray-500">
            Boutique
          </Text>
          <AnimatedPressable
            className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
            onPress={() =>
              router.push({ pathname: "/shop/cart" as any, params: { origin } })
            }
          >
            <Ionicons name="cart-outline" size={18} color={colors.primary} />
            {cartCount > 0 && (
              <View className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 items-center justify-center">
                <Text className="text-[10px] font-sans-bold text-white">
                  {cartCount}
                </Text>
              </View>
            )}
          </AnimatedPressable>
        </View>

        <View className="bg-white border border-gray-100 rounded-3xl p-4">
          <Text className="text-lg font-heading-bold text-gray-900">
            Intrants agricoles
          </Text>
          <Text className="text-xs font-sans text-gray-500 mt-0.5">
            Semences, engrais, produits phyto et petit materiel
          </Text>
        </View>
      </View>

      <View className="px-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {CATEGORY_OPTIONS.map((option) => {
            const isActive = option.key === selectedCategory;
            return (
              <AnimatedPressable
                key={option.key}
                className={`mr-2 px-3 py-2 rounded-full border ${
                  isActive
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-200"
                }`}
                onPress={() => {
                  haptic.selection();
                  setCategory(option.key);
                }}
              >
                <Text
                  className={`text-xs font-sans-semibold ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        <View className="items-end mb-3">
          <AnimatedPressable
            className="px-3 py-2 rounded-full bg-white border border-gray-200 flex-row items-center"
            onPress={() => setIsSortOpen((prev) => !prev)}
          >
            <Text className="text-xs font-sans-semibold text-gray-700 mr-1">
              {currentSortLabel}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.muted} />
          </AnimatedPressable>

          {isSortOpen && (
            <View className="mt-2 bg-white border border-gray-200 rounded-2xl p-1 w-44">
              {SORT_OPTIONS.map((opt) => (
                <AnimatedPressable
                  key={opt.key}
                  className="px-3 py-2 rounded-xl"
                  onPress={() => {
                    haptic.selection();
                    setSortOption(opt.key);
                    setIsSortOpen(false);
                  }}
                >
                  <Text
                    className={`text-xs font-sans ${
                      sortOption === opt.key
                        ? "text-primary font-sans-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          )}
        </View>

        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() =>
              router.push({
                pathname: "/shop/[id]",
                params: { id: product.id, origin },
              } as any)
            }
          />
        ))}

        {products.length === 0 && (
          <View className="items-center px-6 py-16">
            <Ionicons
              name="bag-handle-outline"
              size={64}
              color={colors.mutedLight}
            />
            <Text className="text-lg font-heading-bold text-gray-400 mt-4">
              Aucun produit disponible
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
