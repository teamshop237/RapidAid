import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { minimumTouchTarget, spacing, typography } from "@/theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

type InfoRowProps = {
  title: string;
  body: string;
  icon: IconName;
  onPress?: () => void;
  trailing?: ReactNode;
  accessibilityHint?: string;
};

export function InfoRow({ title, body, icon, onPress, trailing, accessibilityHint }: InfoRowProps) {
  const { colors } = useAppSettings();
  const content = (
    <>
      <View accessible={false} style={styles.iconTile}>
        <Ionicons color={colors.primary} name={icon} size={22} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
      </View>
      {trailing ?? (onPress ? <Ionicons accessible={false} color={colors.textMuted} name="chevron-forward" size={22} /> : null)}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={title}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: pressed ? colors.surfaceRaised : "transparent", borderBottomColor: colors.border },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.container, { borderBottomColor: colors.border }]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: typography.label,
    lineHeight: 21,
    fontWeight: "700",
  },
  body: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
