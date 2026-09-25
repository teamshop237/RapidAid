import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { DemoNotice } from "@/components/DemoNotice";
import { SectionHeading } from "@/components/SectionHeading";
import { TranslationKey } from "@/localization/translations";
import { useAppSettings } from "@/providers/AppProviders";
import { spacing, typography } from "@/theme/tokens";

const privacyItems: readonly { icon: "person-outline" | "location-outline" | "analytics-outline" | "cloud-offline-outline"; key: TranslationKey }[] = [
  { icon: "person-outline", key: "privacyAccounts" },
  { icon: "location-outline", key: "privacyLocation" },
  { icon: "analytics-outline", key: "privacyAnalytics" },
  { icon: "cloud-offline-outline", key: "privacyNetwork" },
];

export function PrivacyScreen() {
  const { colors, t } = useAppSettings();

  return (
    <AppScreen includeTopInset={false} testID="privacy-screen">
      <SectionHeading body={t("privacyIntro")} title={t("privacyTitle")} />
      <View style={styles.list}>
        {privacyItems.map((item) => (
          <View key={item.key} style={[styles.item, { borderBottomColor: colors.border }]}>
            <Ionicons accessible={false} color={colors.primary} name={item.icon} size={24} />
            <Text style={[styles.itemText, { color: colors.text }]}>{t(item.key)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.notice}>
        <DemoNotice message={t("privacyReview")} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 12,
  },
  item: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemText: {
    flex: 1,
    fontSize: typography.label,
    lineHeight: 21,
    fontWeight: "600",
  },
  notice: {
    marginTop: 16,
  },
});
