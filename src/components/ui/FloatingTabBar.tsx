import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";

const INDICATOR_SPRING = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
};

const SLIDE_SPRING = {
  damping: 20,
  stiffness: 180,
  mass: 0.9,
};

// Total space the tab bar occupies from the bottom of the screen
export const TAB_BAR_HEIGHT = 90;

export default function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>(
    [],
  );

  // Indicator animation (pill sliding between tabs)
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  // Visibility animation (slide in/out from bottom)
  const visibility = useSharedValue(1);
  const bottomOffset = useSharedValue(0);

  const allTabsMeasured = tabLayouts.length === state.routes.length;
  const bottomPadding = insets.bottom + 12;

  // Check if the focused screen wants the tab bar hidden
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const tabBarStyle = focusedOptions.tabBarStyle as any;
  const shouldHide = tabBarStyle?.display === "none";

  // Animate indicator when tab changes
  useEffect(() => {
    if (!allTabsMeasured) return;
    const layout = tabLayouts[state.index];
    if (!layout) return;

    indicatorX.value = withSpring(layout.x, INDICATOR_SPRING);
    indicatorWidth.value = withSpring(layout.width, INDICATOR_SPRING);
  }, [state.index, allTabsMeasured, tabLayouts]);

  // Animate visibility (overlay dismiss/appear)
  useEffect(() => {
    if (shouldHide) {
      visibility.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      visibility.value = withSpring(1, SLIDE_SPRING);
    }
  }, [shouldHide]);

  // Animate when safe area insets change (system nav bar show/hide)
  useEffect(() => {
    bottomOffset.value = withSpring(bottomPadding, SLIDE_SPRING);
  }, [bottomPadding]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const wrapperStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      visibility.value,
      [0, 1],
      [TAB_BAR_HEIGHT + 40, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }],
      opacity: interpolate(
        visibility.value,
        [0, 0.5, 1],
        [0, 0.8, 1],
        Extrapolation.CLAMP,
      ),
      paddingBottom: bottomOffset.value,
    };
  });

  const onTabLayout = useCallback((index: number, x: number, width: number) => {
    setTabLayouts((prev) => {
      const next = [...prev];
      next[index] = { x, width };
      return next;
    });
  }, []);

  return (
    <Animated.View
      style={[styles.wrapper, wrapperStyle]}
      pointerEvents={shouldHide ? "none" : "box-none"}
    >
      <Animated.View style={styles.container}>
        {allTabsMeasured && (
          <Animated.View style={[styles.indicator, indicatorStyle]} />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const iconColor = isFocused ? colors.primary : colors.muted;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.7}
              style={styles.tab}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                onTabLayout(index, x, width);
              }}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: iconColor,
                size: 22,
              })}
              <Text
                style={[
                  styles.label,
                  { color: iconColor },
                  isFocused && styles.activeLabel,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  indicator: {
    position: "absolute",
    top: 6,
    bottom: 6,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontFamily: "Figtree-Medium",
  },
  activeLabel: {
    fontFamily: "Figtree-SemiBold",
    color: colors.primary,
  },
});
