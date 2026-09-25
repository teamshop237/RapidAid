import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

type DemoNoticeProps = {
  message: string;
  tone?: "neutral" | "emergency";
};

export function DemoNotice({ message, tone = "neutral" }: DemoNoticeProps) {
  const { colors, t } = useAppSettings();
  const backgroundColor = tone === "emergency" ? colors.emergencySoft : colors.primarySoft;
  const foregroundColor = tone === "emergency" ? colors.emergencyForeground : colors.primary;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor, borderLeftColor: foregroundColor }]}
    >
      <Ionicons accessible={false} color={foregroundColor} name="information-circle-outline" size={18} />
      <View style={styles.copy}>
        <Text style={[styles.label, { color: foregroundColor }]}>{t("demoOnly")}</Text>
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderRadius: radius.sm,
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  message: {
    fontSize: typography.caption,
    lineHeight: 18,
    fontWeight: "500",
  },
});
