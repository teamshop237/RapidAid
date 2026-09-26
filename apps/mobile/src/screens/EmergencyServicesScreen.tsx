import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { FixtureNotice } from "@/components/FixtureNotice";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { canOpenSystemDialer, getBundledDirectorySnapshot } from "@/directory/catalog";
import type { DirectorySnapshot, DirectoryVerificationStatus, EmergencyServiceCategory } from "@/directory/types";
import type { TranslationKey } from "@/localization/translations";
import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

const categoryLabels: Record<EmergencyServiceCategory, TranslationKey> = {
  medical: "emergencyCategoryMedical",
  "fire-rescue": "emergencyCategoryFireRescue",
  police: "emergencyCategoryPolice",
  general: "emergencyCategoryGeneral",
};

const categoryIcons: Record<EmergencyServiceCategory, ComponentProps<typeof Ionicons>["name"]> = {
  medical: "medkit-outline",
  "fire-rescue": "flame-outline",
  police: "shield-outline",
  general: "call-outline",
};

const verificationLabels: Record<DirectoryVerificationStatus, TranslationKey> = {
  verified: "verificationVerified",
  "verification-due": "verificationDue",
  unverified: "verificationUnverified",
  "synthetic-only": "verificationSynthetic",
};

type EmergencyServicesScreenProps = {
  snapshot?: DirectorySnapshot;
};

export function EmergencyServicesScreen({ snapshot = getBundledDirectorySnapshot() }: EmergencyServicesScreenProps) {
  const { colors, language, t } = useAppSettings();

  function openDialer(entry: DirectorySnapshot["emergencyServices"][number]): void {
    if (!canOpenSystemDialer(entry)) return;
    const dialableNumber = entry.phoneNumber.replace(/[ -]/g, "");
    void Linking.openURL(`tel:${dialableNumber}`);
  }

  return (
    <AppScreen includeTopInset={false} testID="emergency-services-screen">
      <SectionHeading body={t("emergencyScreenBody")} title={t("emergencyScreenTitle")} />
      <View style={styles.offlineNote}>
        <Ionicons accessible={false} color={colors.primary} name="cloud-offline-outline" size={20} />
        <Text style={[styles.offlineText, { color: colors.textMuted }]}>{t("directoryOfflineBody")}</Text>
      </View>

      {snapshot.isSynthetic ? <View style={styles.fixture}><FixtureNotice /></View> : null}

      {snapshot.emergencyServices.length === 0 ? (
        <EmptyState
          body={t("directoryEmptyBody")}
          icon="call-outline"
          testID="emergency-directory-empty"
          title={t("directoryEmptyTitle")}
        />
      ) : (
        <View style={styles.list}>
          {snapshot.emergencyServices.map((service) => {
            const callable = canOpenSystemDialer(service);
            return (
              <View key={service.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View accessible={false} style={[styles.icon, { backgroundColor: colors.emergencySoft }]}>
                    <Ionicons color={colors.emergencyForeground} name={categoryIcons[service.category]} size={25} />
                  </View>
                  <View style={styles.copy}>
                    <Text style={[styles.name, { color: colors.text }]}>{service.serviceName[language]}</Text>
                    <Text style={[styles.category, { color: colors.textMuted }]}>{t(categoryLabels[service.category])}</Text>
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
                </View>

                <PrimaryButton
                  accessibilityHint={callable ? t("emergencySafety") : t("callDisabledHint")}
                  disabled={!callable}
                  icon="call"
                  label={callable ? t("callService") : t("callUnavailable")}
                  onPress={() => openDialer(service)}
                  variant="emergency"
                />
              </View>
            );
          })}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  offlineNote: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginTop: spacing.md },
  offlineText: { flex: 1, fontSize: typography.caption, lineHeight: 18 },
  fixture: { marginTop: spacing.md },
  list: { gap: 12, marginTop: spacing.md },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: 14, gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: { width: 44, height: 44, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 2 },
  name: { fontSize: typography.body, lineHeight: 22, fontWeight: "800" },
  category: { fontSize: typography.caption, lineHeight: 18 },
  number: { marginTop: 2, fontSize: typography.label, lineHeight: 20, fontWeight: "800" },
  metadata: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.sm, gap: 4 },
  metaLine: { fontSize: typography.caption, lineHeight: 18 },
  metaLabel: { fontWeight: "800" },
});
