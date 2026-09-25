import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { minimumTouchTarget, spacing, typography } from "@/theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

type NavigationCardProps = {
  title: string;
  body: string;
  icon: IconName;
  onPress: () => void;
  accessibilityHint?: string;
  badge?: string;
};

export function NavigationCard({ title, body, icon, onPress, accessibilityHint, badge }: NavigationCardProps) {
  const { colors } = useAppSettings();

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.surfaceRaised : "transparent",
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View accessible={false} style={styles.iconTile}>
        <Ionicons color={colors.primary} name={icon} size={23} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {badge ? <Text style={[styles.badge, { color: colors.textMuted }]}>{badge}</Text> : null}
        </View>
        <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
      </View>
      <Ionicons accessible={false} color={colors.textMuted} name="chevron-forward" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconTile: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.label,
    lineHeight: 21,
    fontWeight: "700",
  },
  body: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
  badge: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
});
