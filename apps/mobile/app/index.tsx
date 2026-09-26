import { useEffect } from "react";
import { router } from "expo-router";

import { useAppSettings } from "@/providers/AppProviders";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { StartupScreen } from "@/screens/StartupScreen";

export default function OnboardingRoute() {
  const { completeOnboarding, isHydrated, onboardingCompleted } = useAppSettings();

  useEffect(() => {
    if (isHydrated && onboardingCompleted) router.replace("/(tabs)");
  }, [isHydrated, onboardingCompleted]);

  if (!isHydrated || onboardingCompleted) return <StartupScreen />;

  return (
    <OnboardingScreen
      onContinue={() => {
        completeOnboarding();
        router.replace("/(tabs)");
      }}
    />
  );
}
