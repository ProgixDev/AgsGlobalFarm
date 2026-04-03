import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";

export default function AuthLayout() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser && router) {
      router.replace("/map");
    }
  }, [currentUser, router]);

  return (
    <>
      <View className="absolute inset-0 bg-[#edf6e7]">
        <View className="absolute -top-28 -left-24 h-96 w-96 rounded-full bg-[#cfe7bf]" />
        <View className="absolute -right-24 top-28 h-80 w-80 rounded-full bg-[#dbeccd]" />
        <View className="absolute -bottom-40 left-1/4 h-[420px] w-[420px] rounded-full bg-[#c5dfb1]" />
        <View className="absolute inset-0 bg-[#f6fbf1]/70" />
      </View>

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="change-password" />
        {__DEV__ && <Stack.Screen name="dev-login" />}
      </Stack>
    </>
  );
}
