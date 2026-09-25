import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ComponentProps } from "react";

import { useAppSettings } from "@/providers/AppProviders";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabIcons: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: "home", inactive: "home-outline" },
  guides: { active: "book", inactive: "book-outline" },
  nearby: { active: "navigate", inactive: "navigate-outline" },
  more: { active: "ellipsis-horizontal-circle", inactive: "ellipsis-horizontal-circle-outline" },
};

const fallbackTabIcon = tabIcons.more as { active: IconName; inactive: IconName };

export default function TabLayout() {
  const { colors, t } = useAppSettings();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ color, focused, size }) => {
          const icon = tabIcons[route.name] ?? fallbackTabIcon;
          return <Ionicons color={color} name={focused ? icon.active : icon.inactive} size={size} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarAccessibilityLabel: t("navHome"), tabBarLabel: t("navHome"), title: t("navHome") }}
      />
      <Tabs.Screen
        name="guides"
        options={{ tabBarAccessibilityLabel: t("navGuides"), tabBarLabel: t("navGuides"), title: t("navGuides") }}
      />
      <Tabs.Screen
        name="nearby"
        options={{ tabBarAccessibilityLabel: t("navNearby"), tabBarLabel: t("navNearby"), title: t("navNearby") }}
      />
      <Tabs.Screen
        name="more"
        options={{ tabBarAccessibilityLabel: t("navMore"), tabBarLabel: t("navMore"), title: t("navMore") }}
      />
    </Tabs>
  );
}
