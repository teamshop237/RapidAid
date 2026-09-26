import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

export function DevelopmentPreviewNotice() {
  const { colors, t } = useAppSettings();

  return (
    <View
      accessibilityRole="summary"
      style={[styles.notice, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}
      testID="development-protocol-preview"
    >
      <Ionicons accessible={false} color={colors.primary} name="flask-outline" size={18} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{t("developmentPreview")}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>{t("developmentPreviewBody")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    padding: 12,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: typography.label, fontWeight: "800" },
  body: { fontSize: typography.caption, lineHeight: 18 },
});
