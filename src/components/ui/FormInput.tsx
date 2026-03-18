import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { colors } from "@/theme/colors";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

export default function FormInput({
  label,
  error,
  required = false,
  containerClassName = "",
  ...props
}: FormInputProps) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      <Text className="text-sm font-medium text-foreground mb-2">
        {label}
        {required && <Text className="text-danger"> *</Text>}
      </Text>
      <TextInput
        className={`bg-gray-50 border rounded-xl px-4 py-3 text-base text-foreground ${
          error ? "border-danger" : "border-border"
        }`}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
      {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
    </View>
  );
}
