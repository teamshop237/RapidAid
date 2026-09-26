import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { FixtureNotice } from "@/components/FixtureNotice";
import { SectionHeading } from "@/components/SectionHeading";
import { getBundledDirectorySnapshot } from "@/directory/catalog";
import type { CareFacilityCategory, DirectorySnapshot, DirectoryVerificationStatus } from "@/directory/types";
import type { TranslationKey } from "@/localization/translations";
import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

const facilityLabels: Record<CareFacilityCategory, TranslationKey> = {
  hospital: "facilityCategoryHospital",
  clinic: "facilityCategoryClinic",
};

const verificationLabels: Record<DirectoryVerificationStatus, TranslationKey> = {
  verified: "verificationVerified",
  "verification-due": "verificationDue",
  unverified: "verificationUnverified",
  "synthetic-only": "verificationSynthetic",
};

type NearbyScreenProps = {
  snapshot?: DirectorySnapshot;
};

export function NearbyScreen({ snapshot = getBundledDirectorySnapshot() }: NearbyScreenProps) {
  const { colors, language, t } = useAppSettings();

  return (
    <AppScreen testID="nearby-screen">
      <SectionHeading body={t("nearbyIntro")} title={t("nearbyTitle")} />

      <View style={[styles.locationStatus, { backgroundColor: colors.primarySoft }]}>
        <Ionicons accessible={false} color={colors.primary} name="location-outline" size={22} />
        <View style={styles.locationCopy}>
          <Text style={[styles.locationTitle, { color: colors.text }]}>{t("nearbyLocationTitle")}</Text>
          <Text style={[styles.locationBody, { color: colors.textMuted }]}>{t("nearbyLocationBody")}</Text>
        </View>
      </View>

      {snapshot.isSynthetic ? <View style={styles.fixture}><FixtureNotice /></View> : null}

      {snapshot.careFacilities.length === 0 ? (
        <EmptyState
          body={t("nearbyEmptyBody")}
          icon="medical-outline"
          testID="nearby-directory-empty"
          title={t("nearbyEmptyTitle")}
        />
      ) : (
        <View style={styles.list}>
          {snapshot.careFacilities.map((facility) => (
            <View key={facility.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View accessible={false} style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons color={colors.primary} name={facility.category === "hospital" ? "business-outline" : "medkit-outline"} size={24} />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={[styles.name, { color: colors.text }]}>{facility.facilityName[language]}</Text>
                  <Text style={[styles.category, { color: colors.primary }]}>{t(facilityLabels[facility.category])}</Text>
                </View>
              </View>
              <View style={[styles.details, { borderTopColor: colors.border }]}>
                <Text style={[styles.detail, { color: colors.textMuted }]}><Text style={styles.detailLabel}>{t("coverage")}: </Text>{facility.geographicCoverage[language]}</Text>
                <Text style={[styles.detail, { color: colors.textMuted }]}>{facility.address?.[language] ?? t("addressUnavailable")}</Text>
                <Text style={[styles.detail, { color: colors.textMuted }]}><Text style={styles.detailLabel}>{t("verification")}: </Text>{t(verificationLabels[facility.verification.status])}</Text>
                <Text style={[styles.detail, { color: colors.textMuted }]}><Text style={styles.detailLabel}>{t("verificationSource")}: </Text>{facility.verification.source.label[language]}</Text>
                <Text style={[styles.detail, { color: colors.textMuted }]}><Text style={styles.detailLabel}>{t("verifiedOn")}: </Text>{facility.verification.verifiedAt?.slice(0, 10) ?? t("notVerified")}</Text>
              </View>
              <Text style={[styles.unavailable, { color: colors.textMuted }]}>{t("facilityDetailsUnavailable")}</Text>
            </View>
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  locationStatus: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginTop: spacing.md, borderRadius: radius.sm, padding: 12 },
  locationCopy: { flex: 1, gap: 2 },
  locationTitle: { fontSize: typography.label, fontWeight: "800" },
  locationBody: { fontSize: typography.caption, lineHeight: 18 },
  fixture: { marginTop: spacing.md },
  list: { gap: 12, marginTop: spacing.md },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: 14, gap: spacing.sm },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radius.sm },
  cardCopy: { flex: 1, gap: 2 },
  name: { fontSize: typography.body, lineHeight: 22, fontWeight: "800" },
  category: { fontSize: typography.caption, lineHeight: 18, fontWeight: "700" },
  details: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.sm, gap: 4 },
  detail: { fontSize: typography.caption, lineHeight: 18 },
  detailLabel: { fontWeight: "800" },
  unavailable: { fontSize: typography.caption, lineHeight: 18, fontStyle: "italic" },
});
