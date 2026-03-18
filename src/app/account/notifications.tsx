import React, { useState } from "react";
import { View, Text, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { AnimatedPressable, FadeInView } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "new_jobs",
      label: "Nouvelles offres d'emploi",
      description:
        "Soyez alerté des nouvelles offres correspondant à votre profil",
      icon: "briefcase-outline",
      enabled: true,
    },
    {
      id: "applications",
      label: "Suivi des candidatures",
      description: "Mises à jour sur le statut de vos candidatures",
      icon: "document-text-outline",
      enabled: true,
    },
    {
      id: "training",
      label: "Formations",
      description: "Nouveaux cours et rappels de progression",
      icon: "school-outline",
      enabled: false,
    },
    {
      id: "advice",
      label: "Conseils agricoles",
      description: "Nouveaux conseils et alertes saisonnières",
      icon: "bulb-outline",
      enabled: true,
    },
    {
      id: "messages",
      label: "Messages",
      description: "Notifications pour les nouveaux messages reçus",
      icon: "chatbubble-outline",
      enabled: true,
    },
    {
      id: "reminders",
      label: "Rappels",
      description: "Rappels pour les tâches et échéances importantes",
      icon: "alarm-outline",
      enabled: false,
    },
  ]);

  const toggle = (id: string) => {
    haptic.selection();
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const enabledCount = settings.filter((s) => s.enabled).length;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ScreenHeader
        title="Notifications"
        subtitle={`${enabledCount} notification${enabledCount !== 1 ? "s" : ""} activée${enabledCount !== 1 ? "s" : ""} sur ${settings.length}`}
        showBack
      />

      <FadeInView className="px-6 py-6 gap-4">
        {/* Quick actions */}
        <View className="flex-row gap-3">
          <AnimatedPressable
            onPress={() => {
              haptic.selection();
              setSettings((prev) => prev.map((s) => ({ ...s, enabled: true })));
            }}
            className="flex-1 bg-white border border-border rounded-xl py-3 items-center"
          >
            <Text className="text-sm font-medium text-foreground">
              Tout activer
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => {
              haptic.selection();
              setSettings((prev) =>
                prev.map((s) => ({ ...s, enabled: false })),
              );
            }}
            className="flex-1 bg-white border border-border rounded-xl py-3 items-center"
          >
            <Text className="text-sm font-medium text-foreground">
              Tout désactiver
            </Text>
          </AnimatedPressable>
        </View>

        {/* Settings list */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {settings.map((setting, index) => (
            <View
              key={setting.id}
              className={`flex-row items-center px-4 py-4 ${
                index < settings.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Ionicons
                  name={setting.icon}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-foreground">
                  {setting.label}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {setting.description}
                </Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggle(setting.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          ))}
        </View>
      </FadeInView>
    </ScrollView>
  );
}
