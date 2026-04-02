import React from "react";
import { View, Text, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from "@/theme/colors";

interface FormPickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
  enabled?: boolean;
  containerClassName?: string;
}

export default function FormPicker({
  label,
  value,
  onValueChange,
  items,
  error,
  required = false,
  placeholder = "Sélectionner...",
  enabled = true,
  containerClassName = "",
}: FormPickerProps) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      <Text className="text-sm font-sans-medium text-foreground mb-2">
        {label}
        {required && <Text className="text-danger font-sans"> *</Text>}
      </Text>
      <View
        className={`bg-gray-50 border rounded-xl overflow-hidden ${
          error ? "border-danger" : "border-border"
        } ${!enabled ? "opacity-50" : ""}`}
      >
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={enabled}
          style={{
            height: Platform.OS === "ios" ? 180 : 50,
          }}
        >
          <Picker.Item
            label={placeholder}
            value=""
            color={colors.placeholder}
          />
          {items.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
      {error && (
        <Text className="text-danger text-xs font-sans mt-1">{error}</Text>
      )}
    </View>
  );
}
