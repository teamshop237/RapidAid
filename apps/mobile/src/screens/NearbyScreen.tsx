import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { DemoNotice } from "@/components/DemoNotice";
import { SectionHeading } from "@/components/SectionHeading";
import { demoCareLocations, localizeDemoText } from "@/content/demoContent";
import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

const mockPinPositions = [
  { left: 54, top: 35 },
  { right: 68, top: 90 },
  { bottom: 35, left: "44%" as const },
];

export function NearbyScreen() {
  const { colors, language, t } = useAppSettings();

  return (
    <AppScreen testID="nearby-screen">
      <SectionHeading body={t("nearbyIntro")} title={t("nearbyTitle")} />
      <View style={styles.notice}>
        <DemoNotice message={t("locationBody")} />
      </View>

      <View
        accessibilityLabel={`${t("mockMap")}. ${t("locationOff")}`}
        accessibilityRole="image"
        style={[styles.map, { backgroundColor: colors.scrim, borderColor: colors.border }]}
      >
        <View accessible={false} style={[styles.roadHorizontal, { backgroundColor: colors.background }]} />
        <View accessible={false} style={[styles.roadVertical, { backgroundColor: colors.background }]} />
        {mockPinPositions.map((position, index) => (
          <View accessible={false} key={index} style={[styles.pin, position, { backgroundColor: colors.primaryButton }]}>
            <Ionicons color="#FFFFFF" name="location" size={19} />
          </View>
        ))}
        <View style={[styles.mapLabel, { backgroundColor: colors.surface }]}>
          <Text style={[styles.mapLabelText, { color: colors.text }]}>{t("mockMap")}</Text>
        </View>
      </View>

      <View style={styles.locationStatus}>
        <Ionicons accessible={false} color={colors.textMuted} name="location-outline" size={22} />
        <View style={styles.locationCopy}>
          <Text style={[styles.locationTitle, { color: colors.text }]}>{t("locationOff")}</Text>
          <Text style={[styles.locationBody, { color: colors.textMuted }]}>{t("locationBody")}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {demoCareLocations.map((facility) => (
          <View key={facility.id} style={[styles.card, { borderBottomColor: colors.border }]}>
            <View accessible={false} style={styles.icon}>
              <Ionicons color={colors.primary} name={facility.icon} size={25} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={[styles.name, { color: colors.text }]}>{localizeDemoText(facility.name, language)}</Text>
              <Text style={[styles.area, { color: colors.textMuted }]}>{localizeDemoText(facility.area, language)}</Text>
              <Text style={[styles.distance, { color: colors.primary }]}>{localizeDemoText(facility.distance, language)}</Text>
            </View>
            <Text style={[styles.demoTag, { color: colors.primary }]}>{t("demoOnly")}</Text>
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
  map: {
    height: 150,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: radius.md,
    marginTop: 12,
  },
  roadHorizontal: {
    position: "absolute",
    left: -20,
    right: -20,
    top: 68,
    height: 18,
    transform: [{ rotate: "-8deg" }],
  },
  roadVertical: {
    position: "absolute",
    top: -20,
    bottom: -20,
    left: "48%",
    width: 18,
    transform: [{ rotate: "14deg" }],
  },
  pin: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  mapLabel: {
    position: "absolute",
    left: spacing.md,
    bottom: spacing.md,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mapLabelText: {
    fontSize: typography.caption,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: 12,
  },
  locationCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  locationTitle: {
    fontSize: typography.label,
    fontWeight: "800",
  },
  locationBody: {
    fontSize: typography.caption,
    lineHeight: 19,
  },
  list: {
    marginTop: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: typography.label,
    lineHeight: 20,
    fontWeight: "700",
  },
  area: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
  distance: {
    fontSize: typography.caption,
    fontWeight: "800",
  },
  demoTag: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
