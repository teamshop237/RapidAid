import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/BrandMark";
import { useAppSettings } from "@/providers/AppProviders";
import { spacing } from "@/theme/tokens";

export function StartupScreen() {
  const { colors, t } = useAppSettings();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} testID="startup-screen">
      <BrandMark />
      <ActivityIndicator accessibilityLabel={t("protocolLoadingTitle")} color={colors.primary} size="small" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
});
