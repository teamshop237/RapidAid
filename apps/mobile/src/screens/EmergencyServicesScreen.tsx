import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";

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
};

const categoryIcons: Record<EmergencyServiceCategory, ComponentProps<typeof Ionicons>["name"]> = {
  medical: "medkit-outline",
  "fire-rescue": "flame-outline",
  police: "shield-outline",
};

const emergencyCategories: readonly EmergencyServiceCategory[] = ["medical", "fire-rescue", "police"];

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
  const [selectedCategory, setSelectedCategory] = useState<EmergencyServiceCategory | null>(null);
  const selectedServices = selectedCategory
    ? snapshot.emergencyServices.filter((service) => service.category === selectedCategory)
    : [];

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

      <View style={styles.categorySection}>
        <Text accessibilityRole="header" style={[styles.categoryHeading, { color: colors.text }]}>{t("chooseEmergencyService")}</Text>
        <Text style={[styles.categoryHint, { color: colors.textMuted }]}>{t("chooseEmergencyServiceHint")}</Text>
        <View accessibilityRole="radiogroup" style={styles.categoryList}>
          {emergencyCategories.map((category) => {
            const selected = category === selectedCategory;
            return (
              <Pressable
                accessibilityLabel={t(categoryLabels[category])}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={({ pressed }) => [
                  styles.categoryOption,
                  {
                    backgroundColor: selected ? colors.emergencySoft : colors.surface,
                    borderColor: selected ? colors.emergency : colors.border,
                    opacity: pressed ? 0.82 : 1,
                  },
                ]}
              >
                <Ionicons accessible={false} color={selected ? colors.emergencyForeground : colors.textMuted} name={categoryIcons[category]} size={23} />
                <Text style={[styles.categoryOptionLabel, { color: selected ? colors.emergencyForeground : colors.text }]}>
                  {t(categoryLabels[category])}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedCategory === null ? null : selectedServices.length === 0 ? (
        <EmptyState
          body={snapshot.emergencyServices.length === 0 ? t("directoryEmptyBody") : t("categoryUnavailableBody")}
          icon="call-outline"
          testID="emergency-directory-empty"
          title={snapshot.emergencyServices.length === 0 ? t("directoryEmptyTitle") : t("categoryUnavailableTitle")}
        />
      ) : (
        <View style={styles.list}>
          {selectedServices.map((service) => {
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
                  <Text style={[styles.metaLine, { color: colors.textMuted }]}><Text style={styles.metaLabel}>{t("address")}: </Text>{service.address?.[language] ?? t("addressUnavailable")}</Text>
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
            );
          })}
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
  categorySection: { gap: spacing.sm, marginTop: spacing.md },
  categoryHeading: { fontSize: typography.label, lineHeight: 20, fontWeight: "800" },
  categoryHint: { fontSize: typography.caption, lineHeight: 18 },
  categoryList: { gap: spacing.sm },
  categoryOption: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryOptionLabel: { flex: 1, fontSize: typography.label, lineHeight: 20, fontWeight: "700" },
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
  guidance: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  guidanceText: { fontSize: typography.caption, lineHeight: 18 },
});
