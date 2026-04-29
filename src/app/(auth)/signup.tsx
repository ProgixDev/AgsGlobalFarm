import React, { useState, useRef } from "react";
import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import {
  signupStep1Schema,
  signupStep2Schema,
  signupStep3Schema,
} from "@/schemas/validation";
import { ZodError } from "zod";
import { useUserStore } from "@/stores/userStore";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable } from "@/components/animated";
import AuthShell from "@/components/auth/AuthShell";
import { colors } from "@/theme/colors";

export default function Signup() {
  const router = useRouter();
  const register = useUserStore((state) => state.register);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    gender: "",
    userType: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const countryCode = "+221";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<SignupFormErrors>({
    firstName: "",
    lastName: "",
    userType: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });

  // Refs for form inputs
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const validateStep = (step: number): boolean => {
    let newErrors: SignupFormErrors = {
      firstName: "",
      lastName: "",
      userType: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: "",
    };
    let isValid = true;

    try {
      switch (step) {
        case 1:
          signupStep1Schema.parse({
            firstName: formData.firstName,
            lastName: formData.lastName,
            gender: formData.gender,
            userType: formData.userType,
          });
          break;

        case 2:
          signupStep2Schema.parse({
            email: formData.email,
            phone: formData.phone,
          });
          break;

        case 3:
          signupStep3Schema.parse({
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            acceptTerms: formData.acceptTerms,
          });
          break;

        default:
          return true;
      }
    } catch (error: any) {
      if (error instanceof ZodError) {
        error.issues.forEach((err: any) => {
          const field = err.path[0] as keyof SignupFormErrors;
          if (field === "terms") {
            newErrors.terms = err.message;
          } else if (field in newErrors) {
            newErrors[field] = err.message;
          }
        });
      }
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      haptic.selection();
      setCurrentStep(currentStep + 1);
    } else {
      haptic.error();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      haptic.selection();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignup = async () => {
    // Clear previous errors
    setGeneralError("");

    if (!validateStep(currentStep)) {
      haptic.error();
      return;
    }

    setIsLoading(true);

    try {
      // Remove leading zeros from phone number
      const cleanedPhone = formData.phone.replace(/^0+/, "");

      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: countryCode + cleanedPhone,
        userType: formData.userType as "job_seeker" | "farm_owner",
        gender: formData.gender,
        password: formData.password,
      });

      if (!result.success) {
        setGeneralError(
          result.error || "Une erreur s'est produite lors de l'inscription.",
        );
        return;
      }

      // Registration successful - route to email verification
      haptic.success();
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email: formData.email, userType: formData.userType },
      });
    } catch {
      setGeneralError(
        "Une erreur inattendue s'est produite. Veuillez réessayer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Inscription"
      subtitle="Créez votre compte pour accéder à nos services"
      showsVerticalScrollIndicator={false}
    >
      {/* Progress Indicator */}
      <View className="flex-row justify-center mb-6">
        <View className="flex-row items-center">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              currentStep >= 1 ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-sans-bold text-sm">1</Text>
          </View>
          <View
            className={`w-12 h-1 ${
              currentStep >= 2 ? "bg-primary" : "bg-gray-300"
            }`}
          />
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              currentStep >= 2 ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-sans-bold text-sm">2</Text>
          </View>
          <View
            className={`w-12 h-1 ${
              currentStep >= 3 ? "bg-primary" : "bg-gray-300"
            }`}
          />
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              currentStep >= 3 ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-sans-bold text-sm">3</Text>
          </View>
        </View>
      </View>

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
      {((currentStep === 1 &&
        (errors.firstName || errors.lastName || errors.userType)) ||
        (currentStep === 2 && (errors.email || errors.phone)) ||
        (currentStep === 3 &&
          (errors.password || errors.confirmPassword || errors.terms))) &&
      !generalError ? (
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

      {/* Section 1: Personal Information */}
      {currentStep === 1 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
              <Text className="text-white font-sans-bold text-sm">1</Text>
            </View>
            <Text className="text-lg font-heading-semibold text-foreground">
              Informations personnelles
            </Text>
          </View>

          {/* First Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Prénom <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.primary}
              />
              <TextInput
                ref={firstNameRef}
                className="flex-1 ml-3 text-base text-foreground"
                placeholder="Votre prénom"
                placeholderTextColor={colors.placeholder}
                value={formData.firstName}
                onChangeText={(text) => {
                  setFormData({ ...formData, firstName: text });
                  if (errors.firstName) {
                    setErrors({ ...errors, firstName: "" });
                  }
                }}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
            {errors.firstName ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.firstName}
              </Text>
            ) : null}
          </View>

          {/* Last Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Nom de famille <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.primary}
              />
              <TextInput
                ref={lastNameRef}
                className="flex-1 ml-3 text-base text-foreground"
                placeholder="Votre nom de famille"
                placeholderTextColor={colors.placeholder}
                value={formData.lastName}
                onChangeText={(text) => {
                  setFormData({ ...formData, lastName: text });
                  if (errors.lastName) {
                    setErrors({ ...errors, lastName: "" });
                  }
                }}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </View>
            {errors.lastName ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.lastName}
              </Text>
            ) : null}
          </View>

          {/* Gender Select */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Genre
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-xl">
              <Picker
                selectedValue={formData.gender}
                onValueChange={(itemValue) =>
                  setFormData({ ...formData, gender: itemValue })
                }
                style={{ height: 50, color: colors.black }}
              >
                <Picker.Item label="Sélectionnez votre genre" value="" />
                <Picker.Item label="Homme" value="male" />
                <Picker.Item label="Femme" value="female" />
                <Picker.Item label="Autre" value="other" />
              </Picker>
            </View>
          </View>

          {/* User Type Select */}
          <View className="mb-0">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Type de compte <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`bg-gray-50 border rounded-xl ${errors.userType ? "border-red-400" : "border-gray-200"}`}
            >
              <Picker
                selectedValue={formData.userType}
                onValueChange={(itemValue) => {
                  setFormData({
                    ...formData,
                    userType: itemValue as "job_seeker" | "farm_owner" | "",
                  });
                  if (errors.userType) {
                    setErrors({ ...errors, userType: "" });
                  }
                }}
                style={{ height: 50, color: colors.black }}
              >
                <Picker.Item
                  label="Sélectionnez votre type de compte"
                  value=""
                />
                <Picker.Item label="Chercheur d'emploi" value="job_seeker" />
                <Picker.Item
                  label="Propriétaire de ferme / Recruteur"
                  value="farm_owner"
                />
              </Picker>
            </View>
            {errors.userType ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.userType}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Section 2: Contact Information */}
      {currentStep === 2 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
              <Text className="text-white font-sans-bold text-sm">2</Text>
            </View>
            <Text className="text-lg font-heading-semibold text-foreground">
              Coordonnées
            </Text>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Email <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.email ? "border-red-400" : "border-gray-200"}`}
            >
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
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
            {errors.email ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.email}
              </Text>
            ) : null}
          </View>

          {/* Phone Input */}
          <View className="mb-0">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Téléphone
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.phone ? "border-red-400" : "border-gray-200"}`}
            >
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <View className="ml-3 flex-row items-center border-r border-gray-300 pr-3">
                <Text className="text-2xl mr-1">🇸🇳</Text>
                <Text className="text-base text-foreground font-sans-medium">
                  {countryCode}
                </Text>
              </View>
              <TextInput
                ref={phoneRef}
                className="flex-1 ml-3 text-base text-foreground"
                placeholder="Votre numéro de téléphone"
                placeholderTextColor={colors.placeholder}
                value={formData.phone}
                onChangeText={(text) => {
                  setFormData({ ...formData, phone: text });
                  if (errors.phone) {
                    setErrors({ ...errors, phone: "" });
                  }
                }}
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </View>
            {errors.phone ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.phone}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Section 3: Password & Terms */}
      {currentStep === 3 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
              <Text className="text-white font-sans-bold text-sm">3</Text>
            </View>
            <Text className="text-lg font-heading-semibold text-foreground">
              Mot de passe et conditions
            </Text>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Mot de passe <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.password ? "border-red-400" : "border-gray-200"}`}
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
                  if (errors.password) {
                    setErrors({ ...errors, password: "" });
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
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

          {/* Confirm Password Input */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-foreground mb-2">
              Confirmer le mot de passe{" "}
              <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.primary}
              />
              <TextInput
                ref={confirmPasswordRef}
                className="flex-1 ml-3 text-base text-foreground"
                placeholder="Confirmez votre mot de passe"
                placeholderTextColor={colors.placeholder}
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: "" });
                  }
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.confirmPassword}
              </Text>
            ) : null}
          </View>

          {/* Terms & Conditions */}
          <View className="mb-0">
            <AnimatedPressable
              onPress={() => {
                setFormData({
                  ...formData,
                  acceptTerms: !formData.acceptTerms,
                });
                if (errors.terms) {
                  setErrors({ ...errors, terms: "" });
                }
              }}
              className={`flex-row items-start p-3 rounded-xl border ${errors.terms ? "border-red-300 bg-red-50" : "border-transparent"}`}
            >
              <View
                className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 items-center justify-center ${
                  formData.acceptTerms
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-300"
                }`}
              >
                {formData.acceptTerms && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text className="flex-1 text-sm font-sans text-foreground">
                J&apos;accepte les{" "}
                <Text className="text-primary font-sans-medium">
                  conditions d&apos;utilisation
                </Text>{" "}
                et la{" "}
                <Text className="text-primary font-sans-medium">
                  politique de confidentialité
                </Text>
              </Text>
            </AnimatedPressable>
            {errors.terms ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.terms}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Navigation Buttons */}
      <View className="flex-row justify-between items-center mb-6">
        {currentStep > 1 ? (
          <AnimatedPressable
            onPress={handlePrevious}
            className="flex-1 mr-2 bg-gray-200 rounded-xl py-3.5 items-center justify-center"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="arrow-back"
                size={20}
                color={colors.textSecondary}
              />
              <Text className="text-gray-700 text-base font-sans-semibold ml-2">
                Précédent
              </Text>
            </View>
          </AnimatedPressable>
        ) : (
          <View className="flex-1 mr-2" />
        )}

        {currentStep < 3 ? (
          <AnimatedPressable
            onPress={handleNext}
            className="flex-1 ml-2 bg-primary rounded-xl py-3.5 items-center justify-center"
          >
            <View className="flex-row items-center">
              <Text className="text-white text-base font-sans-semibold mr-2">
                Suivant
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          </AnimatedPressable>
        ) : (
          <AnimatedPressable
            onPress={handleSignup}
            disabled={isLoading}
            className={`flex-1 ml-2 bg-primary rounded-xl py-3.5 items-center justify-center ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="person-add-outline" size={20} color="white" />
                <Text className="text-white text-base font-sans-semibold ml-2">
                  S&apos;inscrire
                </Text>
              </View>
            )}
          </AnimatedPressable>
        )}
      </View>

      {/* Login Link */}
      <View className="flex-row justify-center items-center">
        <Text className="text-sm font-sans text-muted-foreground">
          Vous avez déjà un compte ?{" "}
        </Text>
        <Link replace href="/login" asChild>
          <AnimatedPressable>
            <Text className="text-sm text-primary font-sans-semibold">
              Se connecter
            </Text>
          </AnimatedPressable>
        </Link>
      </View>
    </AuthShell>
  );
}
