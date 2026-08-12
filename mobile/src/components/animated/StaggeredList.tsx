import React from "react";
import Animated, { FadeInUp } from "react-native-reanimated";

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

export default function StaggeredList({
  children,
  staggerDelay = 40,
  duration = 200,
  className,
}: StaggeredListProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <Animated.View
          key={index}
          entering={FadeInUp.delay(index * staggerDelay).duration(duration)}
          className={className}
        >
          {child}
        </Animated.View>
      ))}
    </>
  );
}
