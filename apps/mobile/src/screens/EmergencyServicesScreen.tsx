import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { DemoNotice } from "@/components/DemoNotice";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { demoEmergencyServices, localizeDemoText } from "@/content/demoContent";
import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

export function EmergencyServicesScreen() {
  const { colors, language, t } = useAppSettings();

  return (
    <AppScreen includeTopInset={false} testID="emergency-services-screen">
      <SectionHeading body={t("emergencyScreenBody")} title={t("emergencyScreenTitle")} />
      <View style={styles.notice}>
        <DemoNotice message={t("emergencyNotice")} tone="emergency" />
      </View>
      <View style={styles.list}>
        {demoEmergencyServices.map((service) => (
          <View
            accessibilityLabel={`${localizeDemoText(service.name, language)}. ${t("numberUnavailable")}`}
            key={service.id}
            style={[styles.card, { borderBottomColor: colors.border }]}
          >
            <View style={styles.cardHeader}>
              <View accessible={false} style={[styles.icon, { backgroundColor: colors.emergencySoft }]}>
                <Ionicons color={colors.emergencyForeground} name={service.icon} size={27} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.name, { color: colors.text }]}>{localizeDemoText(service.name, language)}</Text>
                <Text style={[styles.number, { color: colors.emergencyForeground }]}>{localizeDemoText(service.displayNumber, language)}</Text>
              </View>
            </View>
            <PrimaryButton
              accessibilityHint={t("callDisabledHint")}
              disabled
              icon="lock-closed"
              label={t("callDisabled")}
              variant="emergency"
            />
          </View>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginTop: 12,
  },
  list: {
    marginTop: 12,
  },
  card: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.label,
    lineHeight: 21,
    fontWeight: "700",
  },
  number: {
    fontSize: typography.caption,
    lineHeight: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
