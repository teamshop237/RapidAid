import { StyleSheet, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { DemoNotice } from "@/components/DemoNotice";
import { NavigationCard } from "@/components/NavigationCard";
import { SectionHeading } from "@/components/SectionHeading";
import { demoGuides, localizeDemoText } from "@/content/demoContent";
import { useAppSettings } from "@/providers/AppProviders";
import { spacing } from "@/theme/tokens";

type GuidesScreenProps = {
  onOpenGuide: (guideId: string) => void;
};

export function GuidesScreen({ onOpenGuide }: GuidesScreenProps) {
  const { colors, language, t } = useAppSettings();

  return (
    <AppScreen testID="guides-screen">
      <SectionHeading body={t("guidesIntro")} title={t("guidesTitle")} />
      <View style={styles.notice}>
        <DemoNotice message={t("guidesNotice")} />
      </View>
      <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {demoGuides.map((guide) => (
          <NavigationCard
            accessibilityHint={t("openGuide")}
            badge={t("demoOnly")}
            body={localizeDemoText(guide.summary, language)}
            icon={guide.icon}
            key={guide.id}
            onPress={() => onOpenGuide(guide.id)}
            title={localizeDemoText(guide.title, language)}
          />
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
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    overflow: "hidden",
  },
});
