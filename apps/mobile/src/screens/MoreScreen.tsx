import { StyleSheet, Switch, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { InfoRow } from "@/components/InfoRow";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SectionHeading } from "@/components/SectionHeading";
import { useAppSettings } from "@/providers/AppProviders";
import { useProtocolContent } from "@/providers/ProtocolContentProvider";
import { protocolStatusMessageKey } from "@/components/ProtocolStatusView";
import { spacing, typography } from "@/theme/tokens";

type MoreScreenProps = {
  onPrivacy: () => void;
  onAppInfo: () => void;
};

export function MoreScreen({ onPrivacy, onAppInfo }: MoreScreenProps) {
  const { colors, isDarkMode, setDarkMode, t } = useAppSettings();
  const protocolContent = useProtocolContent();
  const offlineTitle = protocolContent.status === "ready" ? t("offlineReady") : t("protocolUnavailableTitle");
  const offlineBody = protocolContent.status === "ready"
    ? `${t("offlineBody")} ${protocolContent.packageVersion}`
    : protocolContent.status === "loading"
      ? t("protocolLoadingBody")
      : t(protocolStatusMessageKey(protocolContent.status));

  return (
    <AppScreen testID="more-screen">
      <SectionHeading title={t("moreTitle")} />

      <View style={styles.section}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>{t("language")}</Text>
        <LanguageSelector />
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>{t("appearance")}</Text>
        <InfoRow
          body={t("darkModeHint")}
          icon="moon-outline"
          title={t("darkMode")}
          trailing={(
            <Switch
              accessibilityLabel={t("darkMode")}
              accessibilityRole="switch"
              onValueChange={setDarkMode}
              thumbColor={isDarkMode ? colors.primary : colors.surface}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              value={isDarkMode}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>{t("offlineContent")}</Text>
        <View style={[styles.statusCard, { borderBottomColor: colors.border }]}>
          <View style={[styles.statusDot, { backgroundColor: protocolContent.status === "ready" ? colors.success : colors.textMuted }]} />
          <View style={styles.statusCopy}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>{offlineTitle}</Text>
            <Text style={[styles.statusBody, { color: colors.textMuted }]}>{offlineBody}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <InfoRow body={t("privacyBody")} icon="lock-closed-outline" onPress={onPrivacy} title={t("privacy")} />
        <InfoRow body={t("appInformationBody")} icon="information-circle-outline" onPress={onAppInfo} title={t("appInformation")} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  statusCard: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xs,
    paddingVertical: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusCopy: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: typography.label,
    fontWeight: "700",
  },
  statusBody: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
