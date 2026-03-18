import React from "react";
import { Text, ActivityIndicator, View } from "react-native";
import AnimatedPressable from "@/components/animated/AnimatedPressable";
import { colors } from "@/theme/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "warning";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  onPress: () => void;
  title?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, { bg: string; text: string }> = {
  primary: { bg: "bg-primary", text: "text-primary-foreground" },
  secondary: { bg: "bg-muted", text: "text-foreground" },
  outline: { bg: "bg-white border border-primary", text: "text-primary" },
  danger: { bg: "bg-danger", text: "text-danger-foreground" },
  warning: { bg: "bg-warning", text: "text-warning-foreground" },
};

const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: "py-2 px-4", text: "text-sm" },
  md: { container: "py-3 px-6", text: "text-base" },
  lg: { container: "py-4 px-6", text: "text-base" },
};

const hapticMap: Record<ButtonVariant, "light" | "medium"> = {
  primary: "light",
  secondary: "light",
  outline: "light",
  danger: "medium",
  warning: "medium",
};

export default function Button({
  onPress,
  title,
  children,
  variant = "primary",
  size = "lg",
  disabled = false,
  loading = false,
  className = "",
  icon,
}: ButtonProps) {
  const { bg, text } = variantClasses[variant];
  const { container, text: textSize } = sizeClasses[size];

  const loaderColor = variant === "outline" ? colors.primary : colors.white;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      hapticType={disabled ? "none" : hapticMap[variant]}
      className={`${bg} rounded-xl items-center justify-center ${container} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          {children ? (
            typeof children === "string" ? (
              <Text className={`${text} ${textSize} font-semibold text-center`}>
                {children}
              </Text>
            ) : (
              children
            )
          ) : (
            <Text className={`${text} ${textSize} font-semibold text-center`}>
              {title}
            </Text>
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}
