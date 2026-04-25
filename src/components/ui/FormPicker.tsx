import React from "react";
import { View, Text, Platform, useColorScheme } from "react-native";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const pickerTextColor = isDark ? colors.white : colors.black;
  const placeholderColor = isDark ? colors.mutedLighter : colors.textSecondary;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <Text className="text-sm font-sans-medium text-gray-700 mb-2">
        {label}
        {required && <Text className="text-danger font-sans"> *</Text>}
      </Text>
      <View
        className={`${isDark ? "bg-[#1f2937]" : "bg-white"} border rounded-xl overflow-hidden ${
          error ? "border-danger" : isDark ? "border-[#374151]" : "border-border"
        } ${!enabled ? "opacity-50" : ""}`}
      >
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={enabled}
          mode={Platform.OS === "android" ? "dropdown" : undefined}
          dropdownIconColor={pickerTextColor}
          style={{
            height: Platform.OS === "ios" ? 180 : 50,
            color: pickerTextColor,
            backgroundColor: "transparent",
            fontSize: 16,
          }}
        >
          <Picker.Item
            label={placeholder}
            value=""
            color={placeholderColor}
          />
          {items.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
              color={pickerTextColor}
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
