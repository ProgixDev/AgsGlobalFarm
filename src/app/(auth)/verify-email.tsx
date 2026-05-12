import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable } from "@/components/animated";
import BackButton from "@/components/ui/BackButton";
import AuthShell from "@/components/auth/AuthShell";
import { colors } from "@/theme/colors";
import { useUserStore } from "@/stores/userStore";

const RESEND_COOLDOWN = 60;

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; userType?: string }>();
  const requestEmailVerificationOtp = useUserStore(
    (s) => s.requestEmailVerificationOtp,
  );
  const verifyEmailOtp = useUserStore((s) => s.verifyEmailOtp);

  const [otp, setOtp] = useState("");
  const [email] = useState(params.email ?? "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const otpRef = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    setTimeout(() => otpRef.current?.focus(), 300);
  }, []);

  const handleVerify = async () => {
    setError("");
    if (otp.trim().length < 4) {
      setError("Veuillez entrer le code reçu par email.");
      haptic.error();
      return;
    }
    if (!email) {
      setError("Email manquant. Reconnectez-vous.");
      haptic.error();
      return;
    }
    setIsLoading(true);
    const result = await verifyEmailOtp(email, otp.trim());
    setIsLoading(false);
    if (!result.success) {
      setError(result.error || "Code invalide ou expiré.");
      haptic.error();
      return;
    }
    haptic.success();
    router.replace("/(auth)/login");
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError("");
    setResending(true);
    const result = await requestEmailVerificationOtp(email);
    setResending(false);
    if (!result.success) {
      setError(result.error || "Impossible d'envoyer le code.");
      haptic.error();
      return;
    }
    haptic.success();
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <AuthShell>
      <View className="px-6 pt-2">
        <View className="mb-6 self-start">
          <BackButton variant="dark" />
        </View>

        <View className="bg-primary/10 self-start rounded-full p-3 mb-4">
          <Ionicons name="mail-open-outline" size={28} color={colors.primary} />
        </View>
        <Text className="text-2xl font-heading-bold text-gray-900 mb-2">
          Vérifiez votre email
        </Text>
        <Text className="text-sm font-sans text-gray-600 mb-6">
          Nous avons envoyé un code à 6 chiffres à{" "}
          <Text className="font-sans-semibold text-gray-800">
            {email || "votre adresse"}
          </Text>
          . Saisissez-le ci-dessous pour activer votre compte.
        </Text>

        <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-2">
          <Text className="text-xs font-sans text-gray-500 mb-1">
            Code de vérification
          </Text>
          <TextInput
            ref={otpRef}
            className="text-2xl font-sans-bold text-gray-900 tracking-widest"
            value={otp}
            onChangeText={(t) => {
              setOtp(t.replace(/\D/g, "").slice(0, 6));
              if (error) setError("");
            }}
            placeholder="000000"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
          />
        </View>

        {error ? (
          <Text className="text-xs font-sans text-red-600 mb-2">{error}</Text>
        ) : (
          <View className="h-4 mb-2" />
        )}

        <AnimatedPressable
          className={`rounded-2xl py-4 items-center mt-2 ${
            isLoading ? "bg-primary/60" : "bg-primary"
          }`}
          disabled={isLoading}
          onPress={handleVerify}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text className="text-white font-sans-bold text-base">
              Vérifier le code
            </Text>
          )}
        </AnimatedPressable>

        <View className="flex-row items-center justify-center mt-6">
          <Text className="text-sm font-sans text-gray-600">
            Pas reçu de code ?{" "}
          </Text>
          <AnimatedPressable
            disabled={cooldown > 0 || resending}
            onPress={handleResend}
          >
            <Text
              className={`text-sm font-sans-bold ${
                cooldown > 0 || resending ? "text-gray-400" : "text-primary"
              }`}
            >
              {resending
                ? "Envoi..."
                : cooldown > 0
                  ? `Renvoyer (${cooldown}s)`
                  : "Renvoyer"}
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    </AuthShell>
  );
}
