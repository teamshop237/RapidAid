import { StyleSheet, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { DevelopmentPreviewNotice } from "@/components/DevelopmentPreviewNotice";
import { EmptyState } from "@/components/EmptyState";
import { FixtureNotice } from "@/components/FixtureNotice";
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
  const isDevelopmentPreview = protocolContent.status === "ready"
    && protocolContent.mode === "development-preview";

  return (
    <AppScreen testID="guides-screen">
      <SectionHeading body={t("guidesIntro")} title={t("guidesTitle")} />
      {protocolContent.status === "ready" ? (
        protocolContent.guides.length === 0 ? (
          <EmptyState body={t("protocolMissing")} title={t("protocolUnavailableTitle")} />
        ) : (
          <>
            {isDevelopmentPreview ? <View style={styles.notice}><DevelopmentPreviewNotice /></View> : null}
            {protocolContent.guides.some((guide) => guide.id.includes(".synthetic.")) ? <View style={styles.notice}><FixtureNotice /></View> : null}
            <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {protocolContent.guides.map((guide) => (
                <NavigationCard
                  accessibilityHint={t("openGuide")}
                  badge={isDevelopmentPreview
                    ? t("developmentPreview")
                    : guide.id.includes(".synthetic.") ? t("guideDevelopmentFixture") : undefined}
                  body={localizePresentationText(guide.summary, language)}
                  icon="document-text-outline"
                  key={guide.id}
                  onPress={() => onOpenGuide(guide.id)}
                  title={localizePresentationText(guide.title, language)}
                />
              ))}
            </View>
          </>
        )
      ) : <ProtocolStatusView status={protocolContent.status} />}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginTop: spacing.md,
  },
  list: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    overflow: "hidden",
  },
});
