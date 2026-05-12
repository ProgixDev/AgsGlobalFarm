import React, { useState, useRef } from "react";
import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import {
  signupStep1Schema,
  signupStep2Schema,
  signupStep3Schema,
} from "@/schemas/validation";
import { ZodError } from "zod";
import { useUserStore } from "@/stores/userStore";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { colors } from "@/theme/colors";

const STEP_TITLES: Record<number, string> = {
  1: "Informations personnelles",
  2: "Coordonnées",
  3: "Mot de passe et conditions",
};

export default function Signup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    setGeneralError("");

    if (!validateStep(currentStep)) {
      haptic.error();
      return;
    }

    setIsLoading(true);

    try {
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

  const stepHasErrors =
    (currentStep === 1 &&
      (errors.firstName || errors.lastName || errors.userType)) ||
    (currentStep === 2 && (errors.email || errors.phone)) ||
    (currentStep === 3 &&
      (errors.password || errors.confirmPassword || errors.terms));

  const bannerMessage = generalError
    ? generalError
    : stepHasErrors
      ? "Veuillez corriger les erreurs ci-dessous avant de continuer."
      : "";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FadeInView direction="up">
          {/* Header */}
          <View className="items-center mb-8">
            <Image
              source={require("../../../assets/images/Logo.png")}
              style={{ width: 72, height: 72, marginBottom: 16 }}
              resizeMode="contain"
            />
            <Text className="text-[26px] font-heading-bold text-primary text-center">
              Créer un compte
            </Text>
            <Text className="text-sm font-sans text-muted-foreground text-center mt-1.5">
              Étape {currentStep} sur 3 — {STEP_TITLES[currentStep]}
            </Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    currentStep >= step ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  {currentStep > step ? (
                    <Ionicons name="checkmark" size={18} color="white" />
                  ) : (
                    <Text
                      className={`font-sans-bold text-sm ${
                        currentStep >= step ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {step}
                    </Text>
                  )}
                </View>
                {step < 3 && (
                  <View
                    className={`h-1 w-12 rounded-full mx-1 ${
                      currentStep > step ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Error Banner */}
          {bannerMessage ? (
            <View className="flex-row items-center bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-6">
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.danger}
              />
              <Text className="text-red-600 text-sm font-sans ml-2 flex-1">
                {bannerMessage}
              </Text>
            </View>
          ) : null}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <View>
              {/* First Name */}
              <View className="mb-5">
                <Text className="text-sm font-sans-medium text-foreground mb-2">
                  Prénom
                </Text>
                <View
                  className={`flex-row items-center bg-white border rounded-2xl px-4 py-1 ${
                    errors.firstName ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <TextInput
                    ref={firstNameRef}
                    className="flex-1 ml-3 text-base text-foreground py-3"
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
                  <Text className="text-red-500 text-xs font-sans mt-1.5 ml-1">
                    {errors.firstName}
                  </Text>
                ) : null}
              </View>

              {/* Last Name */}
              <View className="mb-5">
                <Text className="text-sm font-sans-medium text-foreground mb-2">
                  Nom de famille
                </Text>
                <View
                  className={`flex-row items-center bg-white border rounded-2xl px-4 py-1 ${
                    errors.lastName ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <TextInput
                    ref={lastNameRef}
                    className="flex-1 ml-3 text-base text-foreground py-3"
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
                  <Text className="text-red-500 text-xs font-sans mt-1.5 ml-1">
                    {errors.lastName}
                  </Text>
                ) : null}
              </View>

              {/* Gender */}
              <View className="mb-5">
                <Text className="text-sm font-sans-medium text-foreground mb-2">
                  Genre
                </Text>
                <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <Picker
                    selectedValue={formData.gender}
                    onValueChange={(itemValue) =>
                      setFormData({ ...formData, gender: itemValue })
                    }
                    style={{ height: 54, color: colors.black }}
                  >
                    <Picker.Item label="Sélectionnez votre genre" value="" />
                    <Picker.Item label="Homme" value="male" />
                    <Picker.Item label="Femme" value="female" />
                    <Picker.Item label="Autre" value="other" />
                  </Picker>
                </View>
              </View>

              {/* User Type */}
              <View>
                <Text className="text-sm font-sans-medium text-foreground mb-2">
                  Type de compte
                </Text>
                <View
                  className={`bg-white border rounded-2xl overflow-hidden ${
                    errors.userType ? "border-red-400" : "border-gray-200"
                  }`}
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
                    style={{ height: 54, color: colors.black }}
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
                  <Text className="text-red-500 text-xs font-sans mt-1.5 ml-1">
                    {errors.userType}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <View>
              {/* Email */}
              <View className="mb-5">
                <Text className="text-sm font-sans-medium text-foreground mb-2">
                  Email
                </Text>
                <View
                  className={`flex-row items-center bg-white border rounded-2xl px-4 py-1 ${
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
                    className="flex-1 ml-3 text-base text-foreground py-3"
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
                  <Text className="text-red-500 text-xs font-sans mt-1.5 ml-1">
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              {/* Phone */}
              <View>
                <Text className="text-sm font-sans-medium text-foreground mb-2">
                  Téléphone
                </Text>
                <View
                  className={`flex-row items-center bg-white border rounded-2xl px-4 py-1 ${
                    errors.phone ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <View className="ml-3 flex-row items-center border-r border-gray-300 pr-3">
                    <Text className="text-2xl mr-1">🇸🇳</Text>
                    <Text className="text-base text-foreground font-sans-medium">
                      {countryCode}
                    </Text>
                  </View>
                  <TextInput
                    ref={phoneRef}
                    className="flex-1 ml-3 text-base text-foreground py-3"
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
                  <Text className="text-red-500 text-xs font-sans mt-1.5 ml-1">
                    {errors.phone}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {/* Step 3: Password & Terms */}
          {currentStep === 3 && (
            <View>
              {/* Password */}
              <View className="mb-5">
                <Text className="text-sm font-sans-medium text-foreground mb-2">
                  Mot de passe
                </Text>
                <View
                  className={`flex-row items-center bg-white border rounded-2xl px-4 py-1 ${
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
                    className="flex-1 ml-3 text-base text-foreground py-3"
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
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.placeholder}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text className="text-red-500 text-xs font-sans mt-1.5 ml-1">
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              {/* Confirm Password */}
              <View className="mb-6">
                <Text className="text-sm font-sans-medium text-foreground mb-2">
                  Confirmer le mot de passe
                </Text>
                <View
                  className={`flex-row items-center bg-white border rounded-2xl px-4 py-1 ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <TextInput
                    ref={confirmPasswordRef}
                    className="flex-1 ml-3 text-base text-foreground py-3"
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
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    activeOpacity={0.7}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={colors.placeholder}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <Text className="text-red-500 text-xs font-sans mt-1.5 ml-1">
                    {errors.confirmPassword}
                  </Text>
                ) : null}
              </View>

              {/* Terms */}
              <View>
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
                  className={`flex-row items-start p-4 rounded-2xl border ${
                    errors.terms
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
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
                  <Text className="text-red-500 text-xs font-sans mt-1.5 ml-1">
                    {errors.terms}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          <View className="flex-row items-center mt-8 mb-8">
            {currentStep > 1 ? (
              <AnimatedPressable
                onPress={handlePrevious}
                className="flex-1 mr-3 bg-white border border-gray-200 rounded-2xl py-4 items-center justify-center"
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
            ) : null}

            {currentStep < 3 ? (
              <AnimatedPressable
                onPress={handleNext}
                className={`${currentStep > 1 ? "flex-1" : "w-full"} bg-primary rounded-2xl py-4 items-center justify-center`}
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
                className={`flex-1 bg-primary rounded-2xl py-4 items-center justify-center ${
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
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
