import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "@/stores/userStore";
import FloatingTabBar from "@/components/ui/FloatingTabBar";

export default function TabsLayout() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const userType = useUserStore((state) => state.userType);
  const isJobSeeker =
    currentUser?.userType === "job_seeker" || userType === "job_seeker";

  useEffect(() => {
    if (isJobSeeker) {
      router.replace("/(tabs-job-seeker)/map");
    }
  }, [isJobSeeker, router]);

  if (isJobSeeker) return null;

  // Boutique (and Profil, which already prompts login inline) stay browsable
  // without an account — Apple 5.1.1(v) forbids gating non-account browsing
  // behind login. Map/Emplois/Formation still require an account here.
  const accountOnly = currentUser ? undefined : null;

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Carte",
          href: accountOnly,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Emplois",
          href: accountOnly,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Boutique",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-handle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Formation",
          href: accountOnly,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
