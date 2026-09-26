import { StyleSheet, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { DemoNotice } from "@/components/DemoNotice";
import { NavigationCard } from "@/components/NavigationCard";
import { ProtocolStatusView } from "@/components/ProtocolStatusView";
import { SectionHeading } from "@/components/SectionHeading";
import { useAppSettings } from "@/providers/AppProviders";
import { useProtocolContent } from "@/providers/ProtocolContentProvider";
import { localizePresentationText } from "@/protocols/presentation";
import { spacing } from "@/theme/tokens";

type GuidesScreenProps = {
  onOpenGuide: (guideId: string) => void;
};

export function GuidesScreen({ onOpenGuide }: GuidesScreenProps) {
  const { colors, language, t } = useAppSettings();
  const protocolContent = useProtocolContent();

  return (
    <AppScreen testID="guides-screen">
      <SectionHeading body={t("guidesIntro")} title={t("guidesTitle")} />
      <View style={styles.notice}>
        <DemoNotice message={t("guidesNotice")} />
      </View>
      {protocolContent.status === "ready" ? (
        <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {protocolContent.guides.map((guide) => (
            <NavigationCard
              accessibilityHint={t("openGuide")}
              badge={t("verifiedSynthetic")}
              body={localizePresentationText(guide.summary, language)}
              icon="document-text-outline"
              key={guide.id}
              onPress={() => onOpenGuide(guide.id)}
              title={localizePresentationText(guide.title, language)}
            />
          ))}
        </View>
      ) : <ProtocolStatusView status={protocolContent.status} />}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginTop: 12,
  },
  list: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    overflow: "hidden",
  },
});
