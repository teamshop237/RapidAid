import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { spacing, typography } from "@/theme/tokens";

export function FixtureNotice() {
  const { colors, t } = useAppSettings();

  return (
    <View accessibilityRole="alert" style={[styles.container, { borderColor: colors.border }]}>
      <Ionicons accessible={false} color={colors.textMuted} name="construct-outline" size={18} />
      <Text style={[styles.text, { color: colors.textMuted }]}>{t("fixtureNotice")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: typography.caption,
    lineHeight: 18,
    fontWeight: "600",
  },
});
