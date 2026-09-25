import { StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing } from "@/theme/tokens";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  const { colors, t } = useAppSettings();

  return (
    <View accessibilityLabel={t("appName")} accessible style={styles.row}>
      <View accessible={false} style={[styles.symbol, compact && styles.symbolCompact, { backgroundColor: colors.primaryButton }]}>
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
      </View>
      <Text style={[styles.wordmark, compact && styles.wordmarkCompact, { color: colors.text }]}>{t("appName")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  symbol: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolCompact: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
  crossVertical: {
    position: "absolute",
    width: 6,
    height: 24,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  crossHorizontal: {
    width: 24,
    height: 6,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  wordmark: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  wordmarkCompact: {
    fontSize: 20,
    letterSpacing: -0.4,
  },
});
