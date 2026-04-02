import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { loginSchema } from "@/schemas/validation";
import { ZodError } from "zod";
import { useUserStore } from "@/stores/userStore";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { colors } from "@/theme/colors";

export default function Login() {
  const router = useRouter();
  const login = useUserStore((state) => state.login);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const validateForm = (): boolean => {
    let newErrors: LoginFormErrors = {
      email: "",
      password: "",
    };
    let isValid = true;

    try {
      loginSchema.parse({
        email: formData.email,
        password: formData.password,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        error.issues.forEach((err: any) => {
          const field = err.path[0] as keyof LoginFormErrors;
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

  const handleLogin = async () => {
    // Clear previous errors
    setGeneralError("");
    setErrors({ email: "", password: "" });

    if (!validateForm()) {
      haptic.error();
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = login(formData.email, formData.password);

      if (!result.success) {
        haptic.error();
        // Set error for email or password based on the error message
        if (result.error?.includes("email")) {
          setErrors((prev) => ({ ...prev, email: result.error! }));
          emailRef.current?.focus();
        } else if (result.error?.includes("Mot de passe")) {
          setErrors((prev) => ({ ...prev, password: result.error! }));
          passwordRef.current?.focus();
        } else {
          setGeneralError(
            result.error || "Une erreur s'est produite. Veuillez réessayer.",
          );
        }
        return;
      }

      // Login successful - navigate to map
      haptic.success();
      router.replace("/(tabs)/map");
    } catch {
      setGeneralError(
        "Une erreur inattendue s'est produite. Veuillez réessayer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      bottomOffset={20}
      contentContainerStyle={{ flexGrow: 1 }}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center px-6 py-12">
        <FadeInView direction="up">
          <View className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            {/* Title */}
            <Text className="text-3xl font-heading-bold text-primary text-center mb-2">
              Connexion
            </Text>
            <Text className="text-base font-sans text-muted-foreground text-center mb-8">
              Connectez-vous pour accéder à votre espace personnel
            </Text>

            {/* General Error */}
            {generalError ? (
              <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text className="text-red-600 text-sm font-sans ml-2 flex-1">
                  {generalError}
                </Text>
              </View>
            ) : null}

            {/* Field Errors Summary */}
            {(errors.email || errors.password) && !generalError ? (
              <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text className="text-red-600 text-sm font-sans ml-2 flex-1">
                  Veuillez corriger les erreurs ci-dessous avant de continuer.
                </Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-sm font-sans-medium text-foreground mb-2">
                Email <Text className="text-red-500 font-sans">*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${
                  errors.email ? "border-red-400" : "border-gray-200"
                }`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.primary}
                />
                <TextInput
                  ref={emailRef}
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="votre@email.com"
                  placeholderTextColor={colors.placeholder}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email || generalError) {
                      setErrors((prev) => ({ ...prev, email: "" }));
                      setGeneralError("");
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              {errors.email ? (
                <Text className="text-red-500 text-xs font-sans mt-1">
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-sans-medium text-foreground mb-2">
                Mot de passe <Text className="text-red-500 font-sans">*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.primary}
                />
                <TextInput
                  ref={passwordRef}
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="Votre mot de passe"
                  placeholderTextColor={colors.placeholder}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    if (errors.password || generalError) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                      setGeneralError("");
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.placeholder}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text className="text-red-500 text-xs font-sans mt-1">
                  {errors.password}
                </Text>
              ) : null}
            </View>

            {/* Remember Me & Forgot Password */}
            <View className="flex-row justify-between items-center mb-8">
              <AnimatedPressable
                onPress={() =>
                  setFormData({
                    ...formData,
                    rememberMe: !formData.rememberMe,
                  })
                }
                className="flex-row items-center"
              >
                <View
                  className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
                    formData.rememberMe
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {formData.rememberMe && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text className="text-sm font-sans text-foreground">
                  Se souvenir de moi
                </Text>
              </AnimatedPressable>

              <Link href="/(auth)/forgot-password" asChild>
                <AnimatedPressable>
                  <Text className="text-sm text-primary font-sans-medium">
                    Mot de passe oublié ?
                  </Text>
                </AnimatedPressable>
              </Link>
            </View>

            {/* Login Button */}
            <AnimatedPressable
              onPress={handleLogin}
              disabled={isLoading}
              className={`bg-primary rounded-xl py-4 items-center justify-center mb-6 ${
                isLoading ? "opacity-70" : ""
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="log-in-outline" size={20} color="white" />
                  <Text className="text-white text-base font-sans-semibold ml-2">
                    Se connecter
                  </Text>
                </View>
              )}
            </AnimatedPressable>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-sm font-sans text-muted-foreground">
                Vous n&apos;avez pas de compte ?{" "}
              </Text>
              <Link replace href="/(auth)/signup" asChild>
                <AnimatedPressable>
                  <Text className="text-sm text-primary font-sans-semibold">
                    Créer un compte
                  </Text>
                </AnimatedPressable>
              </Link>
            </View>
          </View>
        </FadeInView>
      </View>
    </KeyboardAwareScrollView>
  );
}
