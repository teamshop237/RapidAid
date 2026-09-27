import { Stack, router, useLocalSearchParams } from "expo-router";

import { useAppSettings } from "@/providers/AppProviders";
import { useProtocolContent } from "@/providers/ProtocolContentProvider";
import { localizePresentationText } from "@/protocols/presentation";
import { GuideDetailScreen } from "@/screens/GuideDetailScreen";

export default function GuideRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, t } = useAppSettings();
  const protocolContent = useProtocolContent();
  const guide = protocolContent.status === "ready"
    ? protocolContent.guides.find((candidate) => candidate.id === id)
    : undefined;
  const title = guide ? localizePresentationText(guide.title, language) : t("guidesTitle");

  return (
    <>
      <Stack.Screen options={{ title }} />
      <GuideDetailScreen guideId={id} onComplete={() => router.back()} />
    </>
  );
}
