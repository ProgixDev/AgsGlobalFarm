import React from "react";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AnimatedPressable from "@/components/animated/AnimatedPressable";
import { colors } from "@/theme/colors";

interface BackButtonProps {
  onPress?: () => void;
  variant?: "light" | "dark";
  label?: string;
}

export default function BackButton({
  onPress,
  variant = "light",
  label = "Retour",
}: BackButtonProps) {
  const router = useRouter();
  const isLight = variant === "light";
  const tint = isLight ? colors.white : colors.textSecondary;
  const bg = isLight ? "bg-white/20" : "bg-black/5";

  return (
    <AnimatedPressable
      onPress={onPress ?? (() => router.back())}
      hapticType="light"
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-row items-center gap-2 px-3 py-2 rounded-full ${bg}`}
    >
      <Ionicons name="arrow-back" size={20} color={tint} />
      <Text
        className="font-sans-bold text-base"
        style={{ color: tint }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
