import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { forgotPasswordSchema } from "@/schemas/validation";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable, FadeInView } from "@/components/animated";
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        {/* Content */}
        <View className="flex-1 justify-center items-center px-6 py-12">
          <FadeInView direction="up">
            <View className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
              {/* Back Button */}
              <AnimatedPressable
                onPress={() => router.back()}
                className="flex-row items-center mb-6"
              >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
                <Text className="text-primary font-medium ml-2">Retour</Text>
              </AnimatedPressable>

              {!isSubmitted ? (
                <>
                  {/* Title */}
                  <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
                      <Ionicons name="lock-closed" size={32} color="#f97316" />
                    </View>
                    <Text className="text-2xl font-bold text-primary text-center mb-2">
                      Mot de passe oublié ?
                    </Text>
                    <Text className="text-base text-muted-foreground text-center">
                      Entrez votre adresse email et nous vous enverrons un lien
                      pour réinitialiser votre mot de passe
                    </Text>
                  </View>

                  {/* Email Input */}
                  <View className="mb-8">
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Email <Text className="text-red-500">*</Text>
                    </Text>
                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <TextInput
                        ref={emailRef}
                        className="flex-1 ml-3 text-base text-foreground"
                        placeholder="votre@email.com"
                        placeholderTextColor="#9ca3af"
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
                      <Text className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </Text>
                    ) : null}
                  </View>

                  {/* Submit Button */}
                  <AnimatedPressable
                    onPress={handleSubmit}
                    className="bg-primary rounded-xl py-4 items-center justify-center mb-6"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="send-outline" size={20} color="white" />
                      <Text className="text-white text-base font-semibold ml-2">
                        Envoyer le lien
                      </Text>
                    </View>
                  </AnimatedPressable>
                </>
              ) : (
                <>
                  {/* Success Message */}
                  <View className="items-center">
                    <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                      <Ionicons
                        name="checkmark-circle"
                        size={48}
                        color={colors.primary}
                      />
                    </View>
                    <Text className="text-2xl font-bold text-foreground text-center mb-4">
                      Email envoyé !
                    </Text>
                    <Text className="text-base text-muted-foreground text-center mb-8">
                      Nous avons envoyé un lien de réinitialisation à{" "}
                      <Text className="font-semibold text-foreground">
                        {formData.email}
                      </Text>
                      . Veuillez vérifier votre boîte de réception.
                    </Text>

                    <AnimatedPressable
                      onPress={() => router.push("/login")}
                      className="bg-primary rounded-xl py-4 px-8 items-center justify-center mb-4"
                    >
                      <Text className="text-white text-base font-semibold">
                        Retour à la connexion
                      </Text>
                    </AnimatedPressable>

                    <AnimatedPressable onPress={() => setIsSubmitted(false)}>
                      <Text className="text-sm text-primary font-medium">
                        Renvoyer l&apos;email
                      </Text>
                    </AnimatedPressable>
                  </View>
                </>
              )}

              {/* Login Link */}
              {!isSubmitted && (
                <View className="flex-row justify-center items-center">
                  <Text className="text-sm text-muted-foreground">
                    Vous vous souvenez de votre mot de passe ?{" "}
                  </Text>
                  <Link replace href="/login" asChild>
                    <AnimatedPressable>
                      <Text className="text-sm text-primary font-semibold">
                        Se connecter
                      </Text>
                    </AnimatedPressable>
                  </Link>
                </View>
              )}
            </View>
          </FadeInView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
