import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { BrandMark } from "@/components/BrandMark";
import { InfoRow } from "@/components/InfoRow";
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
      <BrandMark />

      <View style={styles.heroCopy}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{t("onboardingTagline")}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>{t("onboardingBody")}</Text>
      </View>

      <View style={[styles.benefits, { borderColor: colors.border }]}>
        <InfoRow body={t("onboardingOfflineBody")} icon="cloud-offline-outline" title={t("onboardingOfflineTitle")} />
        <InfoRow body={t("onboardingAccountBody")} icon="person-outline" title={t("onboardingAccountTitle")} />
      </View>

      <View style={styles.languageBlock}>
        <Text accessibilityRole="header" style={[styles.languageTitle, { color: colors.text }]}>{t("chooseLanguage")}</Text>
        <LanguageSelector />
      </View>

      <PrimaryButton accessibilityHint={t("homeIntro")} label={t("continue")} onPress={onContinue} testID="onboarding-continue" />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 20,
  },
  heroCopy: {
    gap: spacing.sm,
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
  benefits: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
  },
  languageBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  languageTitle: {
    fontSize: typography.label,
    fontWeight: "700",
  },
});
