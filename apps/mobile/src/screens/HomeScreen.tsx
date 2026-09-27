import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { BrandMark } from "@/components/BrandMark";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

type HomeScreenProps = {
  onEmergency: () => void;
  onGuides: () => void;
};

export function HomeScreen({ onEmergency, onGuides }: HomeScreenProps) {
  const { colors, t } = useAppSettings();

  return (
    <AppScreen testID="home-screen">
      <View style={styles.header}>
        <BrandMark compact />
      </View>

      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{t("homeGreeting")}</Text>
        <Text style={[styles.introBody, { color: colors.textMuted }]}>{t("homeIntro")}</Text>
      </View>

      <View style={[styles.guidesCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary }]}>
        <View style={styles.guidesTop}>
          <View accessible={false} style={[styles.guidesIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons color={colors.primary} name="book-outline" size={25} />
          </View>
          <View style={styles.guidesCopy}>
            <Text style={[styles.guidesTitle, { color: colors.text }]}>{t("guidesCardTitle")}</Text>
            <Text style={[styles.guidesBody, { color: colors.textMuted }]}>{t("guidesCardBody")}</Text>
          </View>
        </View>
        <PrimaryButton icon="arrow-forward" label={t("guidesCardTitle")} onPress={onGuides} />
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
  intro: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  introBody: {
    fontSize: typography.label,
    lineHeight: 21,
  },
  guidesCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    padding: 14,
    gap: 12,
    marginBottom: spacing.md,
  },
  guidesTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  guidesIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  guidesCopy: { flex: 1, gap: 2 },
  guidesTitle: { fontSize: 21, lineHeight: 27, fontWeight: "800" },
  guidesBody: { fontSize: typography.caption, lineHeight: 18 },
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
});
