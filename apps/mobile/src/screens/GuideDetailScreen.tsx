import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { DemoNotice } from "@/components/DemoNotice";
import { DemoGuide, localizeDemoText } from "@/content/demoContent";
import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

type GuideDetailScreenProps = {
  guide?: DemoGuide;
};

export function GuideDetailScreen({ guide }: GuideDetailScreenProps) {
  const { colors, language, t } = useAppSettings();
  const title = guide ? localizeDemoText(guide.title, language) : t("guidesTitle");

  return (
    <AppScreen includeTopInset={false} testID="guide-detail-screen">
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={styles.notice}>
        <DemoNotice message={t("guidePlaceholder")} />
      </View>

      <View style={[styles.statusCard, { borderBottomColor: colors.border }]}>
        <Text style={[styles.statusLabel, { color: colors.textMuted }]}>{t("guideStatus")}</Text>
        <Text style={[styles.statusValue, { color: colors.emergencyForeground }]}>{t("guideStatusValue")}</Text>
      </View>

      <View style={[styles.steps, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {["alpha", "bravo", "charlie"].map((stepId, index) => (
          <View key={stepId} style={[styles.step, { borderBottomColor: colors.border }]}>
            <View accessible={false} style={[styles.stepNumber, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.stepNumberText, { color: colors.primary }]}>{index + 1}</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{t("placeholderStep")}</Text>
              <Text style={[styles.stepBody, { color: colors.textMuted }]}>{t("placeholderStepBody")}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.architectureNote, { color: colors.textMuted, borderColor: colors.border }]}>
        {t("guideStructure")}
      </Text>
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
  stepTitle: {
    fontSize: typography.label,
    fontWeight: "700",
  },
  stepBody: {
    fontSize: typography.label,
    lineHeight: 20,
  },
  architectureNote: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: spacing.md,
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
