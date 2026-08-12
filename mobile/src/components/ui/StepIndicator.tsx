import React from "react";
import { View, Text } from "react-native";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: StepIndicatorProps) {
  return (
    <View className="px-4 py-6">
      <View className="flex-row items-center mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <View className="items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  index < currentStep
                    ? "bg-primary"
                    : index === currentStep
                      ? "bg-primary"
                      : "bg-gray-300"
                }`}
              >
                {index < currentStep ? (
                  <Text className="text-white font-heading-bold text-lg">
                    ✓
                  </Text>
                ) : (
                  <Text
                    className={`font-heading-bold ${
                      index === currentStep ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {stepLabels && stepLabels[index] && (
                <Text
                  className={`text-xs mt-1 text-center ${
                    index === currentStep
                      ? "text-primary font-sans-semibold"
                      : "text-muted-foreground font-sans"
                  }`}
                  numberOfLines={2}
                  style={{ maxWidth: 70 }}
                >
                  {stepLabels[index]}
                </Text>
              )}
            </View>

            {index < totalSteps - 1 && (
              <View
                className={`flex-1 h-1 mx-1 ${
                  index < currentStep ? "bg-primary" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <Text className="text-center text-muted-foreground text-sm font-sans">
        Étape {currentStep + 1} sur {totalSteps}
      </Text>
    </View>
  );
}
