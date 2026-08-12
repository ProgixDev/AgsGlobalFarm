import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { forgotPasswordSchema } from "@/schemas/validation";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable } from "@/components/animated";
import AuthShell from "@/components/auth/AuthShell";
import { colors } from "@/theme/colors";
import { useUserStore } from "@/stores/userStore";

type Stage = "request" | "verify" | "done";

export default function ForgotPassword() {
  const requestPasswordResetOtp = useUserStore(
    (s) => s.requestPasswordResetOtp,
  );
  const resetPasswordWithOtp = useUserStore((s) => s.resetPasswordWithOtp);

  const [stage, setStage] = useState<Stage>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const emailRef = useRef<TextInput>(null);
  const otpRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleSendCode = async () => {
    setError("");
    setEmailError("");
    try {
      forgotPasswordSchema.parse({ email });
    } catch (err: any) {
      setEmailError(err.issues?.[0]?.message || "Email invalide.");
      haptic.error();
      return;
    }

    setIsLoading(true);
    const result = await requestPasswordResetOtp(email);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Impossible d'envoyer le code.");
      haptic.error();
      return;
    }

    haptic.success();
    setStage("verify");
  };

  const handleResetPassword = async () => {
    setError("");
    if (otp.trim().length < 4) {
      setError("Veuillez entrer le code reçu par email.");
      haptic.error();
      return;
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      haptic.error();
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      haptic.error();
      return;
    }

    setIsLoading(true);
    const result = await resetPasswordWithOtp(email, otp.trim(), newPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Code invalide ou expiré.");
      haptic.error();
      return;
    }

    haptic.success();
    setStage("done");
  };

  return (
    <AuthShell
      showBack
      onBackPress={() => router.back()}
      showsVerticalScrollIndicator={false}
    >
      {stage === "request" && (
        <>
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="lock-closed" size={32} color={colors.warning} />
            </View>
            <Text className="text-2xl font-heading-bold text-primary text-center mb-2">
              Mot de passe oublié ?
            </Text>
            <Text className="text-base font-sans text-muted-foreground text-center">
              Entrez votre email pour recevoir un code de réinitialisation.
            </Text>
          </View>

          {error ? (
            <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.danger}
              />
              <Text className="text-red-600 text-sm font-sans ml-2 flex-1">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="mb-6">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Email <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${
                emailError ? "border-red-400" : "border-gray-200"
              }`}
            >
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <TextInput
                ref={emailRef}
                className="flex-1 ml-3 text-base text-foreground"
                placeholder="votre@email.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleSendCode}
              />
            </View>
            {emailError ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {emailError}
              </Text>
            ) : null}
          </View>

          <AnimatedPressable
            onPress={handleSendCode}
            disabled={isLoading}
            className={`bg-primary rounded-xl py-4 items-center justify-center mb-6 ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="send-outline" size={20} color="white" />
                <Text className="text-white text-base font-sans-semibold ml-2">
                  Envoyer le code
                </Text>
              </View>
            )}
          </AnimatedPressable>

          <View className="flex-row justify-center items-center">
            <Text className="text-sm font-sans text-muted-foreground">
              Vous vous souvenez de votre mot de passe ?{" "}
            </Text>
            <Link replace href="/login" asChild>
              <AnimatedPressable>
                <Text className="text-sm text-primary font-sans-semibold">
                  Se connecter
                </Text>
              </AnimatedPressable>
            </Link>
          </View>
        </>
      )}

      {stage === "verify" && (
        <>
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="key-outline" size={32} color={colors.primary} />
            </View>
            <Text className="text-2xl font-heading-bold text-primary text-center mb-2">
              Vérifiez votre email
            </Text>
            <Text className="text-base font-sans text-muted-foreground text-center">
              Nous avons envoyé un code à{" "}
              <Text className="font-sans-semibold text-foreground">
                {email}
              </Text>
              . Saisissez-le ci-dessous avec votre nouveau mot de passe.
            </Text>
          </View>

          {error ? (
            <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.danger}
              />
              <Text className="text-red-600 text-sm font-sans ml-2 flex-1">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Code reçu <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.primary}
              />
              <TextInput
                ref={otpRef}
                className="flex-1 ml-3 text-base text-foreground tracking-widest"
                placeholder="123456"
                placeholderTextColor={colors.placeholder}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                autoCapitalize="none"
                maxLength={8}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Nouveau mot de passe{" "}
              <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.primary}
              />
              <TextInput
                ref={passwordRef}
                className="flex-1 ml-3 text-base text-foreground"
                placeholder="Au moins 8 caractères"
                placeholderTextColor={colors.placeholder}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Confirmer le mot de passe{" "}
              <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.primary}
              />
              <TextInput
                className="flex-1 ml-3 text-base text-foreground"
                placeholder="Répétez le mot de passe"
                placeholderTextColor={colors.placeholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
            </View>
          </View>

          <AnimatedPressable
            onPress={handleResetPassword}
            disabled={isLoading}
            className={`bg-primary rounded-xl py-4 items-center justify-center mb-4 ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-done" size={20} color="white" />
                <Text className="text-white text-base font-sans-semibold ml-2">
                  Réinitialiser
                </Text>
              </View>
            )}
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleSendCode}
            disabled={isLoading}
            className="items-center mb-2"
          >
            <Text className="text-sm text-primary font-sans-medium">
              Renvoyer le code
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => {
              setStage("request");
              setOtp("");
              setNewPassword("");
              setConfirmPassword("");
              setError("");
            }}
            className="items-center"
          >
            <Text className="text-sm text-muted-foreground font-sans">
              Modifier l&apos;email
            </Text>
          </AnimatedPressable>
        </>
      )}

      {stage === "done" && (
        <View className="items-center">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text className="text-2xl font-heading-bold text-foreground text-center mb-4">
            Mot de passe réinitialisé !
          </Text>
          <Text className="text-base font-sans text-muted-foreground text-center mb-8">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de
            passe.
          </Text>
          <AnimatedPressable
            onPress={() => router.replace("/login")}
            className="bg-primary rounded-xl py-4 px-8 items-center justify-center"
          >
            <Text className="text-white text-base font-sans-semibold">
              Se connecter
            </Text>
          </AnimatedPressable>
        </View>
      )}
    </AuthShell>
  );
}
