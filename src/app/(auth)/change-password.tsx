import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { haptic } from "@/utils/haptics";
import { AnimatedPressable } from "@/components/animated";
import { colors } from "@/theme/colors";
import ScreenHeader from "@/components/ui/ScreenHeader";

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

  const handleSubmit = () => {
    if (!validate()) return;
    // TODO: implement password change with Supabase
    console.log("Change password", formData);
    haptic.success();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <ScreenHeader title="Changer le mot de passe" showBack />

        <View className="px-6 py-6 gap-4">
          {/* Error Summary */}
          {hasErrors ? (
            <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
              <Text className="text-red-600 text-sm ml-2 flex-1">
                Veuillez corriger les erreurs ci-dessous avant de continuer.
              </Text>
            </View>
          ) : null}

          {/* Form card */}
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Current password */}
            <View className="px-4 pt-4 pb-3 border-b border-gray-100">
              <Text className="text-xs text-muted-foreground mb-2">
                Mot de passe actuel <Text className="text-red-500">*</Text>
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
                  placeholderTextColor="#9ca3af"
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
                <Text className="text-red-500 text-xs mt-1">
                  {errors.currentPassword}
                </Text>
              ) : null}
            </View>

            {/* New password */}
            <View className="px-4 pt-4 pb-3 border-b border-gray-100">
              <Text className="text-xs text-muted-foreground mb-2">
                Nouveau mot de passe <Text className="text-red-500">*</Text>
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
                  placeholderTextColor="#9ca3af"
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
                <Text className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </Text>
              ) : null}
            </View>

            {/* Confirm new password */}
            <View className="px-4 pt-4 pb-3">
              <Text className="text-xs text-muted-foreground mb-2">
                Confirmer le nouveau mot de passe{" "}
                <Text className="text-red-500">*</Text>
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
                  placeholderTextColor="#9ca3af"
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
                <Text className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Password rules hint */}
          <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4 gap-2">
            <Text className="text-xs font-semibold text-primary mb-1">
              Règles du mot de passe
            </Text>
            {[
              "Au moins 8 caractères",
              "Différent de votre mot de passe actuel",
              "Utilisez des lettres, chiffres et symboles pour plus de sécurité",
            ].map((rule) => (
              <View key={rule} className="flex-row items-start">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={14}
                  color={colors.primary}
                  style={{ marginTop: 1 }}
                />
                <Text className="text-xs text-muted-foreground ml-2 flex-1">
                  {rule}
                </Text>
              </View>
            ))}
          </View>

          {/* Submit */}
          <AnimatedPressable
            onPress={handleSubmit}
            className="bg-primary rounded-2xl py-4 items-center justify-center"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="white"
              />
              <Text className="text-white text-base font-semibold ml-2">
                Mettre à jour le mot de passe
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
