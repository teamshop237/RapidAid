import { StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { spacing, typography } from "@/theme/tokens";

type SectionHeadingProps = {
  title: string;
  body?: string;
};

export function SectionHeading({ title, body }: SectionHeadingProps) {
  const { colors } = useAppSettings();

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.heading,
    lineHeight: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  body: {
    fontSize: typography.label,
    lineHeight: 20,
  },
});
