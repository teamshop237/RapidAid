import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

type EmptyStateProps = {
  title: string;
  body: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  testID?: string;
};

export function EmptyState({ title, body, icon = "information-circle-outline", testID }: EmptyStateProps) {
  const { colors } = useAppSettings();

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={testID}
    >
      <View accessible={false} style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
        <Ionicons color={colors.primary} name={icon} size={24} />
      </View>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  title: {
    textAlign: "center",
    fontSize: typography.heading,
    lineHeight: 24,
    fontWeight: "800",
  },
  body: {
    textAlign: "center",
    fontSize: typography.label,
    lineHeight: 21,
  },
});
