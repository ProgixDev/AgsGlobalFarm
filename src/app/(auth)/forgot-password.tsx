import React, { useState, useRef } from "react";
import { View, Text, TextInput } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { forgotPasswordSchema } from "@/schemas/validation";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable } from "@/components/animated";
import AuthShell from "@/components/auth/AuthShell";
import { colors } from "@/theme/colors";

export default function ForgotPassword() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Refs for form inputs
  const emailRef = useRef<TextInput>(null);

  const validateForm = (): boolean => {
    let newErrors: ForgotPasswordFormErrors = {
      email: "",
    };
    let isValid = true;

    try {
      forgotPasswordSchema.parse({
        email: formData.email,
      });
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof ForgotPasswordFormErrors;
          if (field in newErrors) {
            newErrors[field] = err.message;
          }
        });
      }
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // TODO: Implement forgot password logic
    console.log("Forgot password for:", formData.email);
    haptic.success();
    setIsSubmitted(true);
  };

  return (
    <AuthShell
      showBack
      onBackPress={() => router.back()}
      showsVerticalScrollIndicator={false}
    >
      {!isSubmitted ? (
        <>
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="lock-closed" size={32} color={colors.warning} />
            </View>
            <Text className="text-2xl font-heading-bold text-primary text-center mb-2">
              Mot de passe oublié ?
            </Text>
            <Text className="text-base font-sans text-muted-foreground text-center">
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Email <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <TextInput
                ref={emailRef}
                className="flex-1 ml-3 text-base text-foreground"
                placeholder="votre@email.com"
                placeholderTextColor={colors.placeholder}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) {
                    setErrors({ ...errors, email: "" });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
            {errors.email ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.email}
              </Text>
            ) : null}
          </View>

          <AnimatedPressable
            onPress={handleSubmit}
            className="bg-primary rounded-xl py-4 items-center justify-center mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="send-outline" size={20} color="white" />
              <Text className="text-white text-base font-sans-semibold ml-2">
                Envoyer le lien
              </Text>
            </View>
          </AnimatedPressable>
        </>
      ) : (
        <>
          <View className="items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={colors.primary}
              />
            </View>
            <Text className="text-2xl font-heading-bold text-foreground text-center mb-4">
              Email envoyé !
            </Text>
            <Text className="text-base font-sans text-muted-foreground text-center mb-8">
              Nous avons envoyé un lien de réinitialisation à{" "}
              <Text className="font-sans-semibold text-foreground">
                {formData.email}
              </Text>
              . Veuillez vérifier votre boîte de réception.
            </Text>

            <AnimatedPressable
              onPress={() => router.push("/login")}
              className="bg-primary rounded-xl py-4 px-8 items-center justify-center mb-4"
            >
              <Text className="text-white text-base font-sans-semibold">
                Retour à la connexion
              </Text>
            </AnimatedPressable>

            <AnimatedPressable onPress={() => setIsSubmitted(false)}>
              <Text className="text-sm text-primary font-sans-medium">
                Renvoyer l&apos;email
              </Text>
            </AnimatedPressable>
          </View>
        </>
      )}

      {!isSubmitted && (
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
      )}
    </AuthShell>
  );
}
