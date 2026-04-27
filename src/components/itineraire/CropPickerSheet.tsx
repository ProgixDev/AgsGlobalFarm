import React, { useEffect } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedPressable from "@/components/animated/AnimatedPressable";
import { colors } from "@/theme/colors";
import { haptic } from "@/utils/haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SPRING = { damping: 22, stiffness: 220, mass: 0.7 };

interface CropOption {
  id: string;
  cropName: string;
  emoji: string;
  tagline: string;
  cultivationNote: string;
}

interface CropPickerSheetProps {
  visible: boolean;
  options: CropOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDismiss: () => void;
}

export default function CropPickerSheet({
  visible,
  options,
  selectedId,
  onSelect,
  onDismiss,
}: CropPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.min(SCREEN_HEIGHT * 0.78, 620);
  const closedY = sheetHeight + 40;

  const translateY = useSharedValue(closedY);
  const backdropOpacity = useSharedValue(0);
  const context = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING);
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(closedY, SPRING);
      backdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible, closedY]);

  const dismissWithHaptic = () => {
    haptic.light();
    onDismiss();
  };

  const handleSelect = (id: string) => {
    haptic.selection();
    onSelect(id);
    onDismiss();
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      const next = context.value + event.translationY;
      translateY.value = Math.max(0, next);
    })
    .onEnd((event) => {
      if (event.velocityY > 700 || translateY.value > sheetHeight * 0.3) {
        translateY.value = withSpring(closedY, SPRING);
        backdropOpacity.value = withTiming(0, { duration: 180 });
        runOnJS(dismissWithHaptic)();
      } else {
        translateY.value = withSpring(0, SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      backdropOpacity.value,
      [0, 1],
      [0, 0.45],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissWithHaptic}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#000" },
              backdropStyle,
            ]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            { height: sheetHeight, paddingBottom: insets.bottom + 12 },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={pan}>
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1.5 rounded-full bg-[#d9d2bd]" />
            </View>
          </GestureDetector>

          <View className="px-5 pb-3">
            <Text className="text-xs font-sans-semibold uppercase tracking-widest text-[#8a6e2f]">
              Choisir une culture
            </Text>
            <Text className="text-xl font-heading-bold text-gray-900 mt-1">
              5 itinéraires techniques
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-1">
              Programme calibré sur 1 000 m², adapté à votre superficie.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option) => {
              const isSelected = option.id === selectedId;

              return (
                <AnimatedPressable
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  className={`flex-row items-center rounded-2xl px-4 py-3 mb-2 border ${
                    isSelected
                      ? "bg-[#eaf6ec] border-[#1f8a49]"
                      : "bg-white border-[#ece5cf]"
                  }`}
                  hapticType="none"
                >
                  <View className="w-12 h-12 rounded-xl bg-[#fdf9ea] items-center justify-center mr-3">
                    <Text className="text-2xl">{option.emoji}</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-heading-semibold text-gray-900">
                      {option.cropName}
                    </Text>
                    <Text className="text-xs font-sans text-gray-600 mt-0.5">
                      {option.tagline}
                    </Text>
                    <Text className="text-[11px] font-sans text-[#8a6e2f] mt-1">
                      {option.cultivationNote}
                    </Text>
                  </View>

                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.mutedLight}
                    />
                  )}
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fbf7e9",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 24,
  },
});
