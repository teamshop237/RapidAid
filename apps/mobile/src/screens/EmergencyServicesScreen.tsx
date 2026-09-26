import { Ionicons } from "@expo/vector-icons";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { FixtureNotice } from "@/components/FixtureNotice";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { canOpenSystemDialer, getBundledDirectorySnapshot, MVP_SAMU_SERVICE_ID } from "@/directory/catalog";
import type { DirectorySnapshot, DirectoryVerificationStatus } from "@/directory/types";
import type { TranslationKey } from "@/localization/translations";
import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

const verificationLabels: Record<DirectoryVerificationStatus, TranslationKey> = {
  verified: "verificationVerified",
  "verification-due": "verificationDue",
  unverified: "verificationUnverified",
  "synthetic-only": "verificationSynthetic",
};

type EmergencyServicesScreenProps = {
  onGuides: () => void;
  snapshot?: DirectorySnapshot;
};

export function EmergencyServicesScreen({ onGuides, snapshot = getBundledDirectorySnapshot() }: EmergencyServicesScreenProps) {
  const { colors, language, t } = useAppSettings();
  const service = snapshot.emergencyServices.find((entry) => entry.id === MVP_SAMU_SERVICE_ID);
  const callable = service ? canOpenSystemDialer(service) : false;

  function confirmDialerHandoff(entry: DirectorySnapshot["emergencyServices"][number]): void {
    if (!canOpenSystemDialer(entry)) return;
    const dialableNumber = entry.phoneNumber.replace(/[ -]/g, "");
    Alert.alert(
      t("confirmEmergencyContact"),
      `${entry.serviceName[language]}\n${entry.phoneNumber}\n\n${t("dialerHandoffBody")}`,
      [
        { text: t("cancel"), style: "cancel" },
        { text: t("callService"), style: "destructive", onPress: () => { void Linking.openURL(`tel:${dialableNumber}`); } },
      ],
    );
  }

  return (
    <AppScreen includeTopInset={false} testID="emergency-services-screen">
      <SectionHeading body={t("emergencyScreenBody")} title={t("emergencyScreenTitle")} />
      <View style={styles.offlineNote}>
        <Ionicons accessible={false} color={colors.primary} name="cloud-offline-outline" size={20} />
        <Text style={[styles.offlineText, { color: colors.textMuted }]}>{t("directoryOfflineBody")}</Text>
      </View>

      {snapshot.isSynthetic ? <View style={styles.fixture}><FixtureNotice /></View> : null}

      {!service ? (
        <EmptyState
          body={t("directoryEmptyBody")}
          icon="call-outline"
          testID="emergency-directory-empty"
          title={t("directoryEmptyTitle")}
        />
      ) : (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View accessible={false} style={[styles.icon, { backgroundColor: colors.emergencySoft }]}>
              <Ionicons color={colors.emergencyForeground} name="medkit-outline" size={25} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.name, { color: colors.text }]}>{service.serviceName[language]}</Text>
              <Text style={[styles.category, { color: colors.textMuted }]}>{service.officialServiceName}</Text>
              <Text style={[styles.number, { color: callable ? colors.emergencyForeground : colors.textMuted }]}>
                {service.phoneNumber ?? t("numberUnavailable")}
              </Text>
            </View>
          </View>

          <View style={[styles.metadata, { borderTopColor: colors.border }]}>
            <Text style={[styles.metaLine, { color: colors.textMuted }]}><Text style={styles.metaLabel}>{t("coverage")}: </Text>{service.geographicCoverage[language]}</Text>
            <Text style={[styles.metaLine, { color: colors.textMuted }]}><Text style={styles.metaLabel}>{t("verification")}: </Text>{t(verificationLabels[service.verification.status])}</Text>
            <Text style={[styles.metaLine, { color: colors.textMuted }]}><Text style={styles.metaLabel}>{t("verificationSource")}: </Text>{service.verification.source.label[language]}</Text>
            <Text style={[styles.metaLine, { color: colors.textMuted }]}><Text style={styles.metaLabel}>{t("verifiedOn")}: </Text>{service.verification.verifiedAt?.slice(0, 10) ?? t("notVerified")}</Text>
            {service.verification.verifiedBy ? (
              <Text style={[styles.metaLine, { color: colors.textMuted }]}><Text style={styles.metaLabel}>{t("verifiedBy")}: </Text>{service.verification.verifiedBy.displayName}</Text>
            ) : null}
          </View>

          <PrimaryButton
            accessibilityHint={callable ? t("emergencySafety") : t("callDisabledHint")}
            disabled={!callable}
            icon="call"
            label={callable ? t("confirmContactAction") : t("callUnavailable")}
            onPress={() => confirmDialerHandoff(service)}
            variant="emergency"
          />
        </View>
      )}

      <View style={[styles.guidance, { borderTopColor: colors.border }]}>
        <Text style={[styles.guidanceText, { color: colors.textMuted }]}>{t("guidanceWhileSeekingHelp")}</Text>
        <PrimaryButton icon="book-outline" label={t("openFirstAidGuides")} onPress={onGuides} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  offlineNote: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginTop: spacing.md },
  offlineText: { flex: 1, fontSize: typography.caption, lineHeight: 18 },
  fixture: { marginTop: spacing.md },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: 14, gap: 12, marginTop: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: { width: 44, height: 44, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 2 },
  name: { fontSize: typography.body, lineHeight: 22, fontWeight: "800" },
  category: { fontSize: typography.caption, lineHeight: 18 },
  number: { marginTop: 2, fontSize: typography.label, lineHeight: 20, fontWeight: "800" },
  metadata: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.sm, gap: 4 },
  metaLine: { fontSize: typography.caption, lineHeight: 18 },
  metaLabel: { fontWeight: "800" },
  guidance: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  guidanceText: { fontSize: typography.caption, lineHeight: 18 },
});
