import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { BrandMark } from "@/components/BrandMark";
import { TranslationKey } from "@/localization/translations";
import { useAppSettings } from "@/providers/AppProviders";
import { spacing, typography } from "@/theme/tokens";

const informationRows: readonly { label: TranslationKey; value: TranslationKey }[] = [
  { label: "versionLabel", value: "versionValue" },
  { label: "scopeLabel", value: "scopeValue" },
  { label: "safetyLabel", value: "safetyValue" },
  { label: "releaseLabel", value: "releaseValue" },
  { label: "sourcesLabel", value: "odersaAttribution" },
  { label: "adaptationLabel", value: "odersaAdaptation" },
  { label: "endorsementLabel", value: "odersaEndorsement" },
];

export function AppInfoScreen() {
  const { colors, t } = useAppSettings();

  return (
    <AppScreen includeTopInset={false} testID="app-info-screen">
      <BrandMark />
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{t("appInfoTitle")}</Text>
      <View style={[styles.card, { borderTopColor: colors.border }]}>
        {informationRows.map((row, index) => (
          <View
            key={row.label}
            style={[styles.row, index < informationRows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
          >
            <Text style={[styles.label, { color: colors.textMuted }]}>{t(row.label)}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{t(row.value)}</Text>
          </View>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 20,
    fontSize: typography.title,
    lineHeight: 31,
    fontWeight: "800",
  },
  card: {
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  value: {
    fontSize: typography.label,
    lineHeight: 21,
    fontWeight: "600",
  },
});
