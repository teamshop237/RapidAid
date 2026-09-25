import { Stack, useLocalSearchParams } from "expo-router";

import { findDemoGuide, localizeDemoText } from "@/content/demoContent";
import { useAppSettings } from "@/providers/AppProviders";
import { GuideDetailScreen } from "@/screens/GuideDetailScreen";

export default function GuideRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, t } = useAppSettings();
  const guide = findDemoGuide(id);
  const title = guide ? localizeDemoText(guide.title, language) : t("guidesTitle");

  return (
    <>
      <Stack.Screen options={{ title }} />
      <GuideDetailScreen guide={guide} />
    </>
  );
}
