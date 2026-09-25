import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { BrandMark } from "@/components/BrandMark";
import { InfoRow } from "@/components/InfoRow";
import { NavigationCard } from "@/components/NavigationCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

type HomeScreenProps = {
  onEmergency: () => void;
  onGuides: () => void;
  onNearby: () => void;
};

export function HomeScreen({ onEmergency, onGuides, onNearby }: HomeScreenProps) {
  const { colors, t } = useAppSettings();

  return (
    <AppScreen testID="home-screen">
      <View style={styles.header}>
        <BrandMark compact />
        <Text style={[styles.demoText, { color: colors.textMuted }]}>{t("demoOnly")}</Text>
      </View>

      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{t("homeGreeting")}</Text>
      </View>

      <View
        accessibilityLabel={`${t("emergencyAction")}. ${t("emergencySafety")}`}
        style={[styles.emergencyCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.emergency }]}
      >
        <View style={styles.emergencyTop}>
          <View accessible={false} style={[styles.emergencyIcon, { backgroundColor: colors.emergencySoft }]}>
            <Ionicons color={colors.emergencyForeground} name="alert-circle" size={26} />
          </View>
          <View style={styles.emergencyCopy}>
            <Text style={[styles.emergencyTitle, { color: colors.text }]}>{t("emergencyAction")}</Text>
            <Text style={[styles.emergencyBody, { color: colors.textMuted }]}>{t("emergencySubtitle")}</Text>
          </View>
        </View>
        <View style={styles.safetyStrip}>
          <Ionicons accessible={false} color={colors.emergencyForeground} name="shield-checkmark-outline" size={19} />
          <Text style={[styles.safetyText, { color: colors.emergencyForeground }]}>{t("emergencySafety")}</Text>
        </View>
        <PrimaryButton label={t("emergencyAction")} onPress={onEmergency} variant="emergency" />
      </View>

      <View style={styles.section}>
        <SectionHeading title={t("explore")} />
        <View style={[styles.actionList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <NavigationCard
            body={t("guidesCardBody")}
            icon="book-outline"
            onPress={onGuides}
            title={t("guidesCardTitle")}
          />
          <NavigationCard
            body={t("nearbyCardBody")}
            icon="navigate-outline"
            onPress={onNearby}
            title={t("nearbyCardTitle")}
          />
        </View>
      </View>

      <View style={styles.offlineStatus}>
        <InfoRow body={t("offlineBody")} icon="cloud-offline-outline" title={t("offlineReady")} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: 20,
  },
  demoText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  intro: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  emergencyCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  emergencyTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  emergencyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyCopy: {
    flex: 1,
    gap: 2,
  },
  emergencyTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
  },
  emergencyBody: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
  safetyStrip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  safetyText: {
    flex: 1,
    fontSize: typography.caption,
    lineHeight: 18,
    fontWeight: "700",
  },
  section: {
    gap: spacing.sm,
    marginBottom: 12,
  },
  actionList: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    overflow: "hidden",
  },
  offlineStatus: {
    marginTop: spacing.xs,
  },
});
