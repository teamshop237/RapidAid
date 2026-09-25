import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Language } from "@/localization/translations";
import { useAppSettings } from "@/providers/AppProviders";
import { minimumTouchTarget, radius, spacing, typography } from "@/theme/tokens";

const options: readonly { value: Language; labelKey: "english" | "french" }[] = [
  { value: "en", labelKey: "english" },
  { value: "fr", labelKey: "french" },
];

export function LanguageSelector() {
  const { colors, language, setLanguage, t } = useAppSettings();

  return (
    <View accessibilityRole="radiogroup" style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {options.map((option) => {
        const isSelected = language === option.value;
        const label = t(option.labelKey);
        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            key={option.value}
            onPress={() => setLanguage(option.value)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: isSelected || pressed ? colors.surfaceRaised : colors.surface,
              },
            ]}
          >
            <Text style={[styles.label, { color: isSelected ? colors.primary : colors.text }]}>{label}</Text>
            {isSelected ? <Ionicons accessible={false} color={colors.primary} name="checkmark" size={20} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  option: {
    flex: 1,
    minHeight: minimumTouchTarget,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.label,
    fontWeight: "700",
  },
});
