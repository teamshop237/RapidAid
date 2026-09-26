import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { FixtureNotice } from "@/components/FixtureNotice";
import { ProtocolStatusView } from "@/components/ProtocolStatusView";
import { useAppSettings } from "@/providers/AppProviders";
import { useProtocolContent } from "@/providers/ProtocolContentProvider";
import { localizePresentationText } from "@/protocols/presentation";
import { radius, spacing, typography } from "@/theme/tokens";

type GuideDetailScreenProps = {
  guideId: string;
};

export function GuideDetailScreen({ guideId }: GuideDetailScreenProps) {
  const { colors, language, t } = useAppSettings();
  const protocolContent = useProtocolContent();
  const guide = protocolContent.status === "ready"
    ? protocolContent.guides.find((candidate) => candidate.id === guideId)
    : undefined;
  const title = guide ? localizePresentationText(guide.title, language) : t("guidesTitle");
  const unavailableStatus = protocolContent.status === "ready" ? "not-found" : protocolContent.status;

  return (
    <AppScreen includeTopInset={false} testID="guide-detail-screen">
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
      {!guide ? <ProtocolStatusView status={unavailableStatus} /> : (
        <>
      <Text style={[styles.summary, { color: colors.textMuted }]}>{localizePresentationText(guide.summary, language)}</Text>
      {guide.id.includes(".synthetic.") ? <View style={styles.notice}><FixtureNotice /></View> : null}

      <View style={[styles.statusCard, { borderBottomColor: colors.border }]}>
        <Text style={[styles.statusLabel, { color: colors.textMuted }]}>{t("guideStatus")}</Text>
        <Text style={[styles.statusValue, { color: colors.success }]}>{t("guideStatusValue")}</Text>
      </View>

      <View style={[styles.steps, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {guide.sections.map((section) => (
          <View key={section.id}>
            <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>
              {localizePresentationText(section.heading, language)}
            </Text>
            {section.steps.map((step, index) => (
              <View key={step.id} style={[styles.step, { borderBottomColor: colors.border }]}>
                <View accessible={false} style={[styles.stepNumber, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.stepNumberText, { color: colors.primary }]}>{index + 1}</Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text
                    accessibilityLabel={step.accessibilityLabel
                      ? localizePresentationText(step.accessibilityLabel, language)
                      : undefined}
                    style={[styles.stepBody, { color: colors.text }]}
                  >
                    {localizePresentationText(step.text, language)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Text style={[styles.versionNote, { color: colors.textMuted, borderColor: colors.border }]}>
        {t("contentVersion")}: {guide.contentVersion}
      </Text>
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.title,
    lineHeight: 31,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  notice: {
    marginTop: 12,
  },
  summary: {
    marginTop: spacing.sm,
    fontSize: typography.label,
    lineHeight: 22,
  },
  statusCard: {
    marginTop: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  statusLabel: {
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statusValue: {
    fontSize: typography.label,
    lineHeight: 20,
    fontWeight: "700",
  },
  steps: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    paddingTop: 12,
    fontSize: typography.label,
    fontWeight: "700",
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: typography.label,
    fontWeight: "800",
  },
  stepCopy: {
    flex: 1,
    gap: 2,
  },
  stepBody: {
    fontSize: typography.label,
    lineHeight: 20,
  },
  versionNote: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: spacing.md,
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
