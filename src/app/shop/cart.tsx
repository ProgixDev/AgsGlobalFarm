import React from "react";
import { useLocalSearchParams } from "expo-router";
import CartScreen from "@/components/shop/CartScreen";

export default function ShopCartRoute() {
  const params = useLocalSearchParams<{ origin?: string }>();
  const origin: ShopOrigin =
    params.origin === "tabs-job-seeker" ? "tabs-job-seeker" : "tabs";

  return <CartScreen origin={origin} />;
}
