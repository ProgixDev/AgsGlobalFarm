import { Stack } from "expo-router";
import { colors } from "@/theme/colors";

export default function JobsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="apply" />
    </Stack>
  );
}
