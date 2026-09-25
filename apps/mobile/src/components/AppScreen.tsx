import { PropsWithChildren } from "react";
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppSettings } from "@/providers/AppProviders";
import { spacing } from "@/theme/tokens";

type AppScreenProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  includeTopInset?: boolean;
  testID?: string;
}>;

export function AppScreen({ children, contentContainerStyle, includeTopInset = true, testID }: AppScreenProps) {
  const { colors } = useAppSettings();

  return (
    <SafeAreaView
      edges={includeTopInset ? ["top", "left", "right"] : ["left", "right"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        testID={testID}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
