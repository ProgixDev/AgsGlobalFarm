import React, { useCallback, useEffect } from "react";
import { View, Dimensions, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { haptic } from "@/utils/haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.5 };
const TAB_BAR_HEIGHT = 60;

type SheetState = "expanded" | "minimized" | "dismissed";

interface SwipeableBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  /** Height when expanded as fraction of screen (default 0.85) */
  expandedHeight?: number;
  /** Height when minimized in pixels (default 80) */
  minimizedHeight?: number;
  /** Bottom inset to account for tab bar (default 60) */
  bottomInset?: number;
  /** Show backdrop overlay (default true) */
  showBackdrop?: boolean;
  /** Header content shown always (handle area + preview) */
  minimizedContent?: React.ReactNode;
  /** When this value changes while visible, the sheet re-expands */
  expandTrigger?: string | number | null;
}

export default function SwipeableBottomSheet({
  visible,
  onDismiss,
  children,
  expandedHeight = 0.85,
  minimizedHeight = 80,
  bottomInset = TAB_BAR_HEIGHT,
  showBackdrop = true,
  minimizedContent,
  expandTrigger,
}: SwipeableBottomSheetProps) {
  // The sheet content height when expanded
  const sheetContentHeight = SCREEN_HEIGHT * expandedHeight;
  // Y positions are absolute from top of screen
  const expandedY = SCREEN_HEIGHT - sheetContentHeight;
  const minimizedY = SCREEN_HEIGHT - minimizedHeight - bottomInset;
  const dismissedY = SCREEN_HEIGHT + 20;

  const translateY = useSharedValue(dismissedY);
  const sheetState = useSharedValue<SheetState>("dismissed");
  const context = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      sheetState.value = "expanded";
      translateY.value = withSpring(expandedY, SPRING_CONFIG);
    } else {
      sheetState.value = "dismissed";
      translateY.value = withSpring(dismissedY, SPRING_CONFIG);
    }
  }, [visible, expandedY, dismissedY, translateY, sheetState]);

  useEffect(() => {
    if (visible && expandTrigger != null) {
      sheetState.value = "expanded";
      translateY.value = withSpring(expandedY, SPRING_CONFIG);
    }
  }, [expandTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const fireHaptic = useCallback(() => {
    haptic.light();
  }, []);

  const fireDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      const newY = context.value + event.translationY;
      translateY.value = Math.max(expandedY, newY);
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      const velocity = event.velocityY;

      if (velocity > 800) {
        if (sheetState.value === "expanded") {
          sheetState.value = "minimized";
          translateY.value = withSpring(minimizedY, SPRING_CONFIG);
          runOnJS(fireHaptic)();
        } else {
          sheetState.value = "dismissed";
          translateY.value = withSpring(dismissedY, SPRING_CONFIG);
          runOnJS(fireHaptic)();
          runOnJS(fireDismiss)();
        }
        return;
      }

      if (velocity < -800) {
        sheetState.value = "expanded";
        translateY.value = withSpring(expandedY, SPRING_CONFIG);
        runOnJS(fireHaptic)();
        return;
      }

      const midExpMin = (expandedY + minimizedY) / 2;
      const midMinDis = (minimizedY + dismissedY) / 2;

      if (currentY < midExpMin) {
        sheetState.value = "expanded";
        translateY.value = withSpring(expandedY, SPRING_CONFIG);
      } else if (currentY < midMinDis) {
        sheetState.value = "minimized";
        translateY.value = withSpring(minimizedY, SPRING_CONFIG);
        runOnJS(fireHaptic)();
      } else {
        sheetState.value = "dismissed";
        translateY.value = withSpring(dismissedY, SPRING_CONFIG);
        runOnJS(fireHaptic)();
        runOnJS(fireDismiss)();
      }
    });

  const tapToExpand = Gesture.Tap().onEnd(() => {
    if (sheetState.value === "minimized") {
      sheetState.value = "expanded";
      translateY.value = withSpring(expandedY, SPRING_CONFIG);
      runOnJS(fireHaptic)();
    }
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const progress =
      1 - (translateY.value - expandedY) / (dismissedY - expandedY);
    return {
      opacity: Math.max(0, Math.min(0.45, progress * 0.45)),
      pointerEvents: progress > 0.05 ? ("auto" as const) : ("none" as const),
    };
  });

  if (!visible && translateY.value >= dismissedY - 5) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      {showBackdrop && (
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              haptic.light();
              sheetState.value = "minimized";
              translateY.value = withSpring(minimizedY, SPRING_CONFIG);
            }}
          >
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: "black" }]}
            />
          </Pressable>
        </Animated.View>
      )}

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { height: sheetContentHeight }, sheetStyle]}
        pointerEvents="box-none"
      >
        <GestureDetector gesture={Gesture.Race(panGesture, tapToExpand)}>
          <Animated.View>
            {/* Drag handle */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1.5 rounded-full bg-gray-300" />
            </View>

            {/* Header / minimized preview content */}
            {minimizedContent && (
              <View className="px-5 pb-2">{minimizedContent}</View>
            )}
          </Animated.View>
        </GestureDetector>

        {/* Full content */}
        <View style={{ flex: 1 }} pointerEvents="auto">
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    overflow: "hidden",
  },
});
