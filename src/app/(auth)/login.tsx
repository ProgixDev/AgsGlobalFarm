import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { loginSchema } from "@/schemas/validation";
import { ZodError } from "zod";
import { useUserStore } from "@/stores/userStore";

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
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = login(formData.email, formData.password);

      if (!result.success) {
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center items-center px-6 py-12">
          <View className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            {/* Title */}
            <Text className="text-3xl font-bold text-orange-600 text-center mb-2">
              Connexion
            </Text>
            <Text className="text-base text-muted-foreground text-center mb-8">
              Connectez-vous pour accéder à votre espace personnel
            </Text>

            {/* General Error */}
            {generalError ? (
              <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#ef4444"
                />
                <Text className="text-red-600 text-sm ml-2 flex-1">
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
                  color="#ef4444"
                />
                <Text className="text-red-600 text-sm ml-2 flex-1">
                  Veuillez corriger les erreurs ci-dessous avant de continuer.
                </Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-2">
                Email <Text className="text-red-500">*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${
                  errors.email ? "border-red-400" : "border-gray-200"
                }`}
              >
                <Ionicons name="mail-outline" size={20} color="#10b981" />
                <TextInput
                  ref={emailRef}
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="votre@email.com"
                  placeholderTextColor="#9ca3af"
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
                <Text className="text-red-500 text-xs mt-1">
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                Mot de passe <Text className="text-red-500">*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#10b981"
                />
                <TextInput
                  ref={passwordRef}
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#9ca3af"
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
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.password}
                </Text>
              ) : null}
            </View>

            {/* Remember Me & Forgot Password */}
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity
                onPress={() =>
                  setFormData({ ...formData, rememberMe: !formData.rememberMe })
                }
                activeOpacity={0.7}
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
                <Text className="text-sm text-foreground">
                  Se souvenir de moi
                </Text>
              </TouchableOpacity>

              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-sm text-primary font-medium">
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
              className={`bg-primary rounded-xl py-4 items-center justify-center mb-6 ${
                isLoading ? "opacity-70" : ""
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="log-in-outline" size={20} color="white" />
                  <Text className="text-white text-base font-semibold ml-2">
                    Se connecter
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-sm text-muted-foreground">
                Vous n&apos;avez pas de compte ?{" "}
              </Text>
              <Link replace href="/(auth)/signup" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-sm text-primary font-semibold">
                    Créer un compte
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
