import React, { useState, useRef } from "react";
import { Link, useRouter } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import {
  signupStep1Schema,
  signupStep2Schema,
  signupStep3Schema,
} from "@/schemas/validation";
import { ZodError } from "zod";
import { useUserStore } from "@/stores/userStore";

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
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignup = async () => {
    // Clear previous errors
    setGeneralError("");

    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Remove leading zeros from phone number
      const cleanedPhone = formData.phone.replace(/^0+/, "");

      const result = register({
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

      // Registration successful - navigate to map
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Content */}
        <View className="flex-1 justify-center items-center px-6 py-12">
          <View className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            {/* Title */}
            <Text className="text-3xl font-bold text-orange-600 text-center mb-2">
              Inscription
            </Text>
            <Text className="text-base text-muted-foreground text-center mb-8">
              Créez votre compte pour accéder à nos services
            </Text>

            {/* Progress Indicator */}
            <View className="flex-row justify-center mb-6">
              <View className="flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    currentStep >= 1 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <Text className="text-white font-bold text-sm">1</Text>
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
                  <Text className="text-white font-bold text-sm">2</Text>
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
                  <Text className="text-white font-bold text-sm">3</Text>
                </View>
              </View>
            </View>

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
                  color="#ef4444"
                />
                <Text className="text-red-600 text-sm ml-2 flex-1">
                  Veuillez corriger les erreurs ci-dessous avant de continuer.
                </Text>
              </View>
            ) : null}

            {/* Section 1: Personal Information */}
            {currentStep === 1 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
                    <Text className="text-white font-bold text-sm">1</Text>
                  </View>
                  <Text className="text-lg font-semibold text-foreground">
                    Informations personnelles
                  </Text>
                </View>

                {/* First Name Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Prénom <Text className="text-red-500">*</Text>
                  </Text>
                  <View
                    className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
                  >
                    <Ionicons name="person-outline" size={20} color="#10b981" />
                    <TextInput
                      ref={firstNameRef}
                      className="flex-1 ml-3 text-base text-foreground"
                      placeholder="Votre prénom"
                      placeholderTextColor="#9ca3af"
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
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </Text>
                  ) : null}
                </View>

                {/* Last Name Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Nom de famille <Text className="text-red-500">*</Text>
                  </Text>
                  <View
                    className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
                  >
                    <Ionicons name="person-outline" size={20} color="#10b981" />
                    <TextInput
                      ref={lastNameRef}
                      className="flex-1 ml-3 text-base text-foreground"
                      placeholder="Votre nom de famille"
                      placeholderTextColor="#9ca3af"
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
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </Text>
                  ) : null}
                </View>

                {/* Gender Select */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Genre
                  </Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl">
                    <Picker
                      selectedValue={formData.gender}
                      onValueChange={(itemValue) =>
                        setFormData({ ...formData, gender: itemValue })
                      }
                      style={{ height: 50, color: "#111827" }}
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
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Type de compte <Text className="text-red-500">*</Text>
                  </Text>
                  <View
                    className={`bg-gray-50 border rounded-xl ${errors.userType ? "border-red-400" : "border-gray-200"}`}
                  >
                    <Picker
                      selectedValue={formData.userType}
                      onValueChange={(itemValue) => {
                        setFormData({
                          ...formData,
                          userType: itemValue as
                            | "job_seeker"
                            | "farm_owner"
                            | "",
                        });
                        if (errors.userType) {
                          setErrors({ ...errors, userType: "" });
                        }
                      }}
                      style={{ height: 50, color: "#111827" }}
                    >
                      <Picker.Item
                        label="Sélectionnez votre type de compte"
                        value=""
                      />
                      <Picker.Item
                        label="Chercheur d'emploi"
                        value="job_seeker"
                      />
                      <Picker.Item
                        label="Propriétaire de ferme / Recruteur"
                        value="farm_owner"
                      />
                    </Picker>
                  </View>
                  {errors.userType ? (
                    <Text className="text-red-500 text-xs mt-1">
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
                    <Text className="text-white font-bold text-sm">2</Text>
                  </View>
                  <Text className="text-lg font-semibold text-foreground">
                    Coordonnées
                  </Text>
                </View>

                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Email <Text className="text-red-500">*</Text>
                  </Text>
                  <View
                    className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.email ? "border-red-400" : "border-gray-200"}`}
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
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.email}
                    </Text>
                  ) : null}
                </View>

                {/* Phone Input */}
                <View className="mb-0">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Téléphone
                  </Text>
                  <View
                    className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                  >
                    <Ionicons name="call-outline" size={20} color="#10b981" />
                    <View className="ml-3 flex-row items-center border-r border-gray-300 pr-3">
                      <Text className="text-2xl mr-1">🇸🇳</Text>
                      <Text className="text-base text-foreground font-medium">
                        {countryCode}
                      </Text>
                    </View>
                    <TextInput
                      ref={phoneRef}
                      className="flex-1 ml-3 text-base text-foreground"
                      placeholder="Votre numéro de téléphone"
                      placeholderTextColor="#9ca3af"
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
                    <Text className="text-red-500 text-xs mt-1">
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
                    <Text className="text-white font-bold text-sm">3</Text>
                  </View>
                  <Text className="text-lg font-semibold text-foreground">
                    Mot de passe et conditions
                  </Text>
                </View>

                {/* Password Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Mot de passe <Text className="text-red-500">*</Text>
                  </Text>
                  <View
                    className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.password ? "border-red-400" : "border-gray-200"}`}
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
                        if (errors.password) {
                          setErrors({ ...errors, password: "" });
                        }
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        confirmPasswordRef.current?.focus()
                      }
                      blurOnSubmit={false}
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

                {/* Confirm Password Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Confirmer le mot de passe{" "}
                    <Text className="text-red-500">*</Text>
                  </Text>
                  <View
                    className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-2.5 ${errors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#10b981"
                    />
                    <TextInput
                      ref={confirmPasswordRef}
                      className="flex-1 ml-3 text-base text-foreground"
                      placeholder="Confirmez votre mot de passe"
                      placeholderTextColor="#9ca3af"
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
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </Text>
                  ) : null}
                </View>

                {/* Terms & Conditions */}
                <View className="mb-0">
                  <TouchableOpacity
                    onPress={() => {
                      setFormData({
                        ...formData,
                        acceptTerms: !formData.acceptTerms,
                      });
                      if (errors.terms) {
                        setErrors({ ...errors, terms: "" });
                      }
                    }}
                    activeOpacity={0.7}
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
                    <Text className="flex-1 text-sm text-foreground">
                      J&apos;accepte les{" "}
                      <Text className="text-primary font-medium">
                        conditions d&apos;utilisation
                      </Text>{" "}
                      et la{" "}
                      <Text className="text-primary font-medium">
                        politique de confidentialité
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  {errors.terms ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.terms}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}

            {/* Navigation Buttons */}
            <View className="flex-row justify-between items-center mb-6">
              {currentStep > 1 ? (
                <TouchableOpacity
                  onPress={handlePrevious}
                  activeOpacity={0.8}
                  className="flex-1 mr-2 bg-gray-200 rounded-xl py-3.5 items-center justify-center"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="arrow-back" size={20} color="#374151" />
                    <Text className="text-gray-700 text-base font-semibold ml-2">
                      Précédent
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View className="flex-1 mr-2" />
              )}

              {currentStep < 3 ? (
                <TouchableOpacity
                  onPress={handleNext}
                  activeOpacity={0.8}
                  className="flex-1 ml-2 bg-primary rounded-xl py-3.5 items-center justify-center"
                >
                  <View className="flex-row items-center">
                    <Text className="text-white text-base font-semibold mr-2">
                      Suivant
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSignup}
                  disabled={isLoading}
                  activeOpacity={0.8}
                  className={`flex-1 ml-2 bg-primary rounded-xl py-3.5 items-center justify-center ${
                    isLoading ? "opacity-70" : ""
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="person-add-outline"
                        size={20}
                        color="white"
                      />
                      <Text className="text-white text-base font-semibold ml-2">
                        S&apos;inscrire
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-sm text-muted-foreground">
                Vous avez déjà un compte ?{" "}
              </Text>
              <Link replace href="/login" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-sm text-primary font-semibold">
                    Se connecter
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
