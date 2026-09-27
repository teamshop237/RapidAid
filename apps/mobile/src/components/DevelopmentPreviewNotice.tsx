import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { spacing, typography } from "@/theme/tokens";

export function DevelopmentPreviewNotice() {
  const { colors, t } = useAppSettings();

  return (
    <View
      accessibilityRole="summary"
      style={styles.notice}
      testID="development-protocol-preview"
    >
      <Ionicons accessible={false} color={colors.primary} name="flask-outline" size={15} />
      <Text style={[styles.body, { color: colors.textMuted }]}>
        <Text style={[styles.title, { color: colors.primary }]}>{t("developmentPreview")}</Text>
        {` · ${t("developmentPreviewBody")}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  title: { fontSize: typography.caption, fontWeight: "800" },
  body: { flex: 1, fontSize: typography.caption, lineHeight: 17 },
});
