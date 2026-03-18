import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "@/stores/userStore";
import { tabBarScreenOptions } from "@/theme/tabBarConfig";

export default function JobSeekerTabsLayout() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser) {
      router.replace(__DEV__ ? "/(auth)/dev-login" : "/(auth)/login");
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <Tabs screenOptions={tabBarScreenOptions}>
      <Tabs.Screen
        name="map"
        options={{
          title: "Carte",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Emplois",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Formation",
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
