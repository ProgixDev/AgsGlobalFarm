import React from "react";
import { useLocalSearchParams } from "expo-router";
import ShopDetailScreen from "@/components/shop/ShopDetailScreen";

export default function OwnerShopDetailRoute() {
  const params = useLocalSearchParams<{ id?: string; origin?: string }>();
  const productId = params.id ?? "";
  const origin: ShopOrigin =
    params.origin === "tabs-job-seeker" ? "tabs-job-seeker" : "tabs";

  return <ShopDetailScreen productId={productId} origin={origin} />;
}
