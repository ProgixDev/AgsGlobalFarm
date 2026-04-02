import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import Svg, { Path, Defs, Pattern, Circle } from "react-native-svg";
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
      {/* Shared Decorative Background */}
      <View className="absolute inset-0 bg-primary">
        {/* Decorative SVG Top */}
        <View className="absolute inset-0 opacity-10">
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <Path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </Svg>
        </View>

        {/* Background Pattern */}
        <View className="absolute inset-0 opacity-20">
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <Defs>
              <Pattern
                id="dots"
                x="0"
                y="0"
                width="4"
                height="4"
                patternUnits="userSpaceOnUse"
              >
                <Circle cx="0.5" cy="0.25" r="0.25" fill="white" />
              </Pattern>
            </Defs>
            <Path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#dots)" />
          </Svg>
        </View>
      </View>

      {/* Stack Navigator */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        {__DEV__ && <Stack.Screen name="dev-login" />}
      </Stack>
    </>
  );
}
