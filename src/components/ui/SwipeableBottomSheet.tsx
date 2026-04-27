import React, { useCallback, useEffect } from "react";
import { View, Dimensions, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import { TAB_BAR_HEIGHT } from "@/components/ui/FloatingTabBar";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.5 };

type SheetState = "expanded" | "minimized" | "dismissed";

interface SwipeableBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  /** Height when expanded as fraction of screen (default 0.85) */
  expandedHeight?: number;
  /** Height when minimized in pixels (default 80) */
  minimizedHeight?: number;
  /** Bottom inset to account for tab bar (default TAB_BAR_HEIGHT) */
  bottomInset?: number;
  /** Show backdrop overlay (default true) */
  showBackdrop?: boolean;
  /** Header content shown always (handle area + preview) */
  minimizedContent?: React.ReactNode;
  /** When this value changes while visible, the sheet re-expands */
  expandTrigger?: string | number | null;
  /** When this value changes while visible, the sheet minimizes */
  minimizeTrigger?: string | number | null;
  /** Initial state when becoming visible (default "expanded") */
  initialState?: "expanded" | "minimized";
  /** Called when the sheet state changes */
  onStateChange?: (state: SheetState) => void;
  /** Skip minimized snap — swipe down goes straight to dismissed */
  noMinimize?: boolean;
}

export default function SwipeableBottomSheet({
  visible,
  onDismiss,
  children,
  expandedHeight = 0.85,
  minimizedHeight = 80,
  bottomInset: bottomInsetProp,
  showBackdrop = true,
  minimizedContent,
  expandTrigger,
  minimizeTrigger,
  initialState = "expanded",
  onStateChange,
  noMinimize = false,
}: SwipeableBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = bottomInsetProp ?? TAB_BAR_HEIGHT + insets.bottom;

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
      const targetState = initialState;
      const targetY = targetState === "minimized" ? minimizedY : expandedY;
      sheetState.value = targetState;
      translateY.value = withSpring(targetY, SPRING_CONFIG);
      onStateChange?.(targetState);
    } else {
      sheetState.value = "dismissed";
      translateY.value = withSpring(dismissedY, SPRING_CONFIG);
      onStateChange?.("dismissed");
    }
  }, [visible, expandedY, minimizedY, dismissedY, translateY, sheetState]);

  useEffect(() => {
    if (visible && expandTrigger != null) {
      sheetState.value = "expanded";
      translateY.value = withSpring(expandedY, SPRING_CONFIG);
      onStateChange?.("expanded");
    }
  }, [expandTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (visible && minimizeTrigger != null) {
      sheetState.value = "minimized";
      translateY.value = withSpring(minimizedY, SPRING_CONFIG);
      onStateChange?.("minimized");
    }
  }, [minimizeTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const fireHaptic = useCallback(() => {
    haptic.light();
  }, []);

  const fireStateChange = useCallback(
    (s: SheetState) => {
      onStateChange?.(s);
    },
    [onStateChange],
  );

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
        if (!noMinimize && sheetState.value === "expanded") {
          sheetState.value = "minimized";
          translateY.value = withSpring(minimizedY, SPRING_CONFIG);
          runOnJS(fireHaptic)();
          runOnJS(fireStateChange)("minimized");
        } else {
          sheetState.value = "dismissed";
          translateY.value = withSpring(dismissedY, SPRING_CONFIG);
          runOnJS(fireHaptic)();
          runOnJS(fireStateChange)("dismissed");
          runOnJS(fireDismiss)();
        }
        return;
      }

      if (velocity < -800) {
        sheetState.value = "expanded";
        translateY.value = withSpring(expandedY, SPRING_CONFIG);
        runOnJS(fireHaptic)();
        runOnJS(fireStateChange)("expanded");
        return;
      }

      const midExpMin = (expandedY + minimizedY) / 2;
      const midMinDis = (minimizedY + dismissedY) / 2;

      if (noMinimize) {
        const midExpDis = (expandedY + dismissedY) / 2;
        if (currentY < midExpDis) {
          sheetState.value = "expanded";
          translateY.value = withSpring(expandedY, SPRING_CONFIG);
          runOnJS(fireStateChange)("expanded");
        } else {
          sheetState.value = "dismissed";
          translateY.value = withSpring(dismissedY, SPRING_CONFIG);
          runOnJS(fireHaptic)();
          runOnJS(fireStateChange)("dismissed");
          runOnJS(fireDismiss)();
        }
      } else if (currentY < midExpMin) {
        sheetState.value = "expanded";
        translateY.value = withSpring(expandedY, SPRING_CONFIG);
        runOnJS(fireStateChange)("expanded");
      } else if (currentY < midMinDis) {
        sheetState.value = "minimized";
        translateY.value = withSpring(minimizedY, SPRING_CONFIG);
        runOnJS(fireHaptic)();
        runOnJS(fireStateChange)("minimized");
      } else {
        sheetState.value = "dismissed";
        translateY.value = withSpring(dismissedY, SPRING_CONFIG);
        runOnJS(fireHaptic)();
        runOnJS(fireStateChange)("dismissed");
        runOnJS(fireDismiss)();
      }
    });

  const tapToExpand = Gesture.Tap().onEnd(() => {
    if (sheetState.value === "minimized") {
      sheetState.value = "expanded";
      translateY.value = withSpring(expandedY, SPRING_CONFIG);
      runOnJS(fireHaptic)();
      runOnJS(fireStateChange)("expanded");
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
    <>
      {/* Backdrop — only blocks touches when visible */}
      {showBackdrop && (
        <Animated.View
          style={[StyleSheet.absoluteFill, backdropStyle]}
          pointerEvents="box-none"
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              haptic.light();
              sheetState.value = "minimized";
              translateY.value = withSpring(minimizedY, SPRING_CONFIG);
              onStateChange?.("minimized");
            }}
          >
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: "black" }]}
            />
          </Pressable>
        </Animated.View>
      )}

      {/* Sheet — positioned at bottom, doesn't cover the whole screen */}
      <Animated.View
        style={[styles.sheet, { height: sheetContentHeight }, sheetStyle]}
        pointerEvents="box-none"
      >
        <GestureDetector gesture={Gesture.Race(panGesture, tapToExpand)}>
          <Animated.View>
            <View
              className="items-center justify-center"
              style={{ minHeight: 44 }}
            >
              <View className="w-10 h-1.5 rounded-full bg-gray-300" />
            </View>

            {minimizedContent && (
              <View className="px-5 pb-2">{minimizedContent}</View>
            )}
          </Animated.View>
        </GestureDetector>

        <View
          style={{ flex: 1, paddingBottom: insets.bottom }}
          pointerEvents="auto"
        >
          {children}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundMuted,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    overflow: "hidden",
  },
});
