import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { minimumTouchTarget, radius, spacing, typography } from "@/theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  accessibilityHint?: string;
  icon?: IconName;
  variant?: "primary" | "emergency";
  disabled?: boolean;
  testID?: string;
};

export function PrimaryButton({
  label,
  onPress,
  accessibilityHint,
  icon = "arrow-forward",
  variant = "primary",
  disabled = false,
  testID,
}: PrimaryButtonProps) {
  const { colors } = useAppSettings();
  const baseColor = variant === "emergency" ? colors.emergency : colors.primaryButton;
  const pressedColor = variant === "emergency" ? colors.emergencyPressed : colors.primaryPressed;
  const backgroundColor = disabled ? colors.surfaceRaised : baseColor;
  const foregroundColor = disabled ? colors.textMuted : "#FFFFFF";

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        variant === "emergency" && styles.emergencyButton,
        { backgroundColor: pressed && !disabled ? pressedColor : backgroundColor },
      ]}
    >
      <Text style={[styles.label, { color: foregroundColor }]}>{label}</Text>
      <View accessible={false}>
        <Ionicons color={foregroundColor} name={disabled ? "lock-closed-outline" : icon} size={22} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: minimumTouchTarget,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  emergencyButton: {
    minHeight: 60,
  },
  label: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: typography.body,
    lineHeight: 22,
    fontWeight: "700",
  },
});
