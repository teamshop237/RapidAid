import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders, useAppSettings } from "@/providers/AppProviders";
import { odersaDevelopmentProtocolPreview } from "@/protocols/developmentProtocolPreview";
import { expoAppSettingsStore } from "@/settings/settingsStore";

function RootNavigator() {
  const { colors, isDarkMode, t } = useAppSettings();

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack
        screenOptions={{
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "800" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="emergency-services" options={{ title: t("emergencyScreenTitle") }} />
        <Stack.Screen name="guide/[id]" options={{ title: t("guidesTitle") }} />
        <Stack.Screen name="privacy" options={{ title: t("privacy") }} />
        <Stack.Screen name="app-info" options={{ title: t("appInformation") }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders
      developmentProtocolPreview={__DEV__ ? odersaDevelopmentProtocolPreview : undefined}
      settingsStore={expoAppSettingsStore}
    >
      <RootNavigator />
    </AppProviders>
  );
}
