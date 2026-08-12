import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { colors } from "@/theme/colors";

interface AuthShellProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  backLabel?: string;
  onBackPress?: () => void;
  showsVerticalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
}

export default function AuthShell({
  title,
  subtitle,
  children,
  showBack = false,
  backLabel = "Retour",
  onBackPress,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = "handled",
}: AuthShellProps) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      >
        <View className="flex-1 justify-center px-6 py-10">
          <FadeInView direction="up">
            <View className="w-full max-w-md self-center rounded-3xl border border-[#dbe8d5] bg-[#fcfdf8] px-6 py-7 shadow-sm">
              {showBack && onBackPress ? (
                <AnimatedPressable
                  onPress={onBackPress}
                  className="flex-row items-center mb-6"
                >
                  <Ionicons
                    name="arrow-back"
                    size={22}
                    color={colors.primary}
                  />
                  <Text className="text-primary font-sans-medium ml-2">
                    {backLabel}
                  </Text>
                </AnimatedPressable>
              ) : null}

              {title ? (
                <Text className="text-[30px] font-heading-bold text-primary text-center mb-2">
                  {title}
                </Text>
              ) : null}

              {subtitle ? (
                <Text className="text-base font-sans text-muted-foreground text-center mb-7">
                  {subtitle}
                </Text>
              ) : null}

              {children}
            </View>
          </FadeInView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
