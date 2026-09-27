import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

type ProcedureStepCardProps = {
  accessibilityLabel?: string;
  sectionTitle: string;
  stepNumber: number;
  text: string;
  totalSteps: number;
  visual?: ReactNode;
};

export function ProcedureStepCard({
  accessibilityLabel,
  sectionTitle,
  stepNumber,
  text,
  totalSteps,
  visual,
}: ProcedureStepCardProps) {
  const { colors, t } = useAppSettings();
  const progress = totalSteps === 0 ? 0 : stepNumber / totalSteps;

  return (
    <View style={styles.container} testID="procedure-current-step">
      <View style={styles.progressHeader}>
        <Text style={[styles.progressText, { color: colors.textMuted }]}>
          {t("stepProgress").replace("{current}", String(stepNumber)).replace("{total}", String(totalSteps))}
        </Text>
        <View
          accessibilityLabel={`${stepNumber} / ${totalSteps}`}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: totalSteps, now: stepNumber }}
          style={[styles.progressTrack, { backgroundColor: colors.surfaceRaised }]}
        >
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
        </View>
      </View>

      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.textMuted }]}>
        {sectionTitle}
      </Text>

      {visual ? <View style={styles.visual}>{visual}</View> : null}

      <Text accessibilityLabel={accessibilityLabel} style={[styles.action, { color: colors.text }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  progressHeader: { gap: spacing.sm },
  progressText: {
    fontSize: typography.label,
    lineHeight: 20,
    fontWeight: "800",
  },
  progressTrack: {
    height: 5,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: radius.pill },
  sectionTitle: {
    fontSize: typography.label,
    lineHeight: 20,
    fontWeight: "700",
  },
  visual: { width: "100%" },
  action: {
    fontSize: 23,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
