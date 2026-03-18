import React from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

interface FadeInViewProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "fade" | "up";
  duration?: number;
}

export default function FadeInView({
  children,
  className,
  delay = 0,
  direction = "fade",
  duration = 250,
}: FadeInViewProps) {
  const entering =
    direction === "up"
      ? FadeInDown.duration(duration).delay(delay)
      : FadeIn.duration(duration).delay(delay);

  return (
    <Animated.View entering={entering} className={className}>
      {children}
    </Animated.View>
  );
}
