import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { BrandMark } from "@/components/BrandMark";
import { DemoNotice } from "@/components/DemoNotice";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppSettings } from "@/providers/AppProviders";
import { spacing, typography } from "@/theme/tokens";

type OnboardingScreenProps = {
  onContinue: () => void;
};

export function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  const { colors, t } = useAppSettings();

  return (
    <AppScreen contentContainerStyle={styles.screen} testID="onboarding-screen">
      <View style={styles.topRow}>
        <BrandMark />
        <Text style={[styles.prototypeText, { color: colors.textMuted }]}>{t("prototype")}</Text>
      </View>

      <View style={styles.heroCopy}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{t("onboardingTagline")}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>{t("languageHint")}</Text>
      </View>

      <View style={styles.notice}>
        <DemoNotice message={t("onboardingNotice")} />
      </View>

      <View style={styles.languageBlock}>
        <Text accessibilityRole="header" style={[styles.languageTitle, { color: colors.text }]}>{t("chooseLanguage")}</Text>
        <LanguageSelector />
      </View>

      <PrimaryButton accessibilityHint={t("homeIntro")} label={t("continue")} onPress={onContinue} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  prototypeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  heroCopy: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  body: {
    fontSize: typography.label,
    lineHeight: 20,
  },
  notice: {
    marginTop: spacing.xs,
  },
  languageBlock: {
    gap: spacing.sm,
  },
  languageTitle: {
    fontSize: typography.label,
    fontWeight: "700",
  },
});
