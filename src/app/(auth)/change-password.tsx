import React, { useState, useRef } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable } from "@/components/animated";
import AuthShell from "@/components/auth/AuthShell";
import { colors } from "@/theme/colors";
import { useUserStore } from "@/stores/userStore";

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordErrors {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const changePassword = useUserStore((s) => s.changePassword);
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ChangePasswordErrors>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const validate = (): boolean => {
    const newErrors: ChangePasswordErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Le mot de passe actuel est requis.";
      isValid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Le nouveau mot de passe est requis.";
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword =
        "Le mot de passe doit contenir au moins 8 caractères.";
      isValid = false;
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword =
        "Le nouveau mot de passe doit être différent de l'actuel.";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe.";
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const hasErrors = !!(
    errors.currentPassword ||
    errors.newPassword ||
    errors.confirmPassword
  );

  const handleSubmit = async () => {
    setSubmitError("");
    if (!validate()) {
      haptic.error();
      return;
    }

    setIsLoading(true);
    const result = await changePassword(
      formData.currentPassword,
      formData.newPassword,
    );
    setIsLoading(false);

    if (!result.success) {
      setSubmitError(
        result.error || "Impossible de changer le mot de passe.",
      );
      haptic.error();
      return;
    }

    haptic.success();
    Alert.alert(
      "Mot de passe mis à jour",
      "Votre mot de passe a été modifié avec succès.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  const checks = [
    {
      label: "Au moins 8 caractères",
      ok: formData.newPassword.length >= 8,
    },
    {
      label: "Différent du mot de passe actuel",
      ok:
        formData.newPassword.length > 0 &&
        formData.newPassword !== formData.currentPassword,
    },
    {
      label: "Confirmation identique",
      ok:
        formData.confirmPassword.length > 0 &&
        formData.newPassword === formData.confirmPassword,
    },
  ];

  const passedChecks = checks.filter((item) => item.ok).length;
  const strengthPct = (passedChecks / checks.length) * 100;
  const strengthLabel =
    passedChecks <= 1 ? "Faible" : passedChecks === 2 ? "Moyen" : "Fort";
  const strengthColor =
    passedChecks <= 1 ? "#EF4444" : passedChecks === 2 ? "#F59E0B" : "#16A34A";

  return (
    <AuthShell
      title="Changer le mot de passe"
      subtitle="Mettez à jour votre mot de passe en toute sécurité."
      showBack
      onBackPress={() => router.back()}
    >
      <View className="gap-4">
        <View className="bg-white/70 border border-[#e3ecd8] rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-foreground">
            Sécurité du compte
          </Text>
          <Text className="text-xs font-sans text-muted-foreground mt-1">
            Pour confirmer ce changement, saisissez d&apos;abord votre mot de
            passe actuel.
          </Text>
        </View>

        {/* Error Summary */}
        {hasErrors || !!submitError ? (
          <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.danger}
            />
            <Text className="text-red-600 text-sm font-sans ml-2 flex-1">
              {submitError ||
                "Veuillez corriger les erreurs ci-dessous avant de continuer."}
            </Text>
          </View>
        ) : null}

        {/* Form card */}
        <View className="bg-white rounded-2xl border border-[#e3ecd8] overflow-hidden">
          {/* Current password */}
          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs font-sans text-muted-foreground mb-2">
              Mot de passe actuel{" "}
              <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-3 py-2.5 ${
                errors.currentPassword ? "border-red-400" : "border-gray-200"
              }`}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.primary}
              />
              <TextInput
                className="flex-1 ml-2 text-base text-foreground"
                placeholder="Votre mot de passe actuel"
                placeholderTextColor={colors.placeholder}
                value={formData.currentPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, currentPassword: text });
                  if (errors.currentPassword)
                    setErrors({ ...errors, currentPassword: "" });
                }}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={() => setShowCurrent(!showCurrent)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showCurrent ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.currentPassword}
              </Text>
            ) : null}
          </View>

          {/* New password */}
          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <Text className="text-xs font-sans text-muted-foreground mb-2">
              Nouveau mot de passe{" "}
              <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-3 py-2.5 ${
                errors.newPassword ? "border-red-400" : "border-gray-200"
              }`}
            >
              <Ionicons name="key-outline" size={18} color={colors.primary} />
              <TextInput
                ref={newPasswordRef}
                className="flex-1 ml-2 text-base text-foreground"
                placeholder="8 caractères minimum"
                placeholderTextColor={colors.placeholder}
                value={formData.newPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, newPassword: text });
                  if (errors.newPassword)
                    setErrors({ ...errors, newPassword: "" });
                }}
                secureTextEntry={!showNew}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showNew ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {errors.newPassword}
              </Text>
            ) : null}
          </View>

          {/* Confirm new password */}
          <View className="px-4 pt-4 pb-3">
            <Text className="text-xs font-sans text-muted-foreground mb-2">
              Confirmer le nouveau mot de passe{" "}
              <Text className="text-red-500 font-sans">*</Text>
            </Text>
            <View
              className={`flex-row items-center bg-gray-50 border rounded-xl px-3 py-2.5 ${
                errors.confirmPassword ? "border-red-400" : "border-gray-200"
              }`}
            >
              <Ionicons name="key-outline" size={18} color={colors.primary} />
              <TextInput
                ref={confirmPasswordRef}
                className="flex-1 ml-2 text-base text-foreground"
                placeholder="Confirmez votre nouveau mot de passe"
                placeholderTextColor={colors.placeholder}
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: "" });
                }}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={18}
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
        </View>

        <View className="bg-white/70 border border-[#e3ecd8] rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-sans text-muted-foreground">
              Robustesse du mot de passe
            </Text>
            <Text
              className="text-xs font-sans-semibold"
              style={{ color: strengthColor }}
            >
              {strengthLabel}
            </Text>
          </View>
          <View className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
            <View
              style={{
                width: `${strengthPct}%`,
                backgroundColor: strengthColor,
              }}
              className="h-full"
            />
          </View>

          {checks.map((rule) => (
            <View key={rule.label} className="flex-row items-center mb-1.5">
              <Ionicons
                name={rule.ok ? "checkmark-circle" : "ellipse-outline"}
                size={14}
                color={rule.ok ? "#16A34A" : colors.mutedLight}
              />
              <Text
                className="text-xs font-sans ml-2"
                style={{ color: rule.ok ? "#166534" : colors.muted }}
              >
                {rule.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Submit */}
        <AnimatedPressable
          onPress={handleSubmit}
          disabled={isLoading}
          className={`bg-primary rounded-2xl py-4 items-center justify-center ${
            isLoading ? "opacity-70" : ""
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View className="flex-row items-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="white"
              />
              <Text className="text-white text-base font-sans-semibold ml-2">
                Mettre à jour le mot de passe
              </Text>
            </View>
          )}
        </AnimatedPressable>
      </View>
    </AuthShell>
  );
}
