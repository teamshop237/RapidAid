import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Language } from "@/localization/translations";
import { useAppSettings } from "@/providers/AppProviders";
import type { PresentationSource } from "@/protocols/presentation";
import { localizePresentationText } from "@/protocols/presentation";
import { minimumTouchTarget, radius, spacing, typography } from "@/theme/tokens";

type GuideSourcesModalProps = {
  contentVersion: string;
  language: Language;
  onClose: () => void;
  sources: readonly PresentationSource[];
  visible: boolean;
};

export function GuideSourcesModal({ contentVersion, language, onClose, sources, visible }: GuideSourcesModalProps) {
  const { colors, t } = useAppSettings();

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" visible={visible}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{t("sourcesTitle")}</Text>
          <Pressable
            accessibilityLabel={t("close")}
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.close, { backgroundColor: pressed ? colors.surfaceRaised : colors.surface }]}
          >
            <Text style={[styles.closeLabel, { color: colors.primary }]}>{t("close")}</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {sources.map((source) => (
            <View key={source.id} style={[styles.source, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sourceTitle, { color: colors.text }]}>{source.title}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{source.organization}</Text>
              <Text selectable style={[styles.url, { color: colors.primary }]}>{source.locator}</Text>
              {source.verifiedAt ? (
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {t("sourceVerified")}: {source.verifiedAt.slice(0, 10)}
                </Text>
              ) : null}
              {source.attribution ? <Text style={[styles.meta, { color: colors.textMuted }]}>{source.attribution}</Text> : null}
              {source.adaptation ? (
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {localizePresentationText(source.adaptation, language)}
                </Text>
              ) : null}
              {source.endorsementDisclaimer ? (
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {localizePresentationText(source.endorsementDisclaimer, language)}
                </Text>
              ) : null}
            </View>
          ))}
          <Text style={[styles.version, { color: colors.textMuted }]}>{t("contentVersion")}: {contentVersion}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: { flex: 1, fontSize: typography.heading, lineHeight: 24, fontWeight: "800" },
  close: {
    minWidth: minimumTouchTarget,
    minHeight: minimumTouchTarget,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  closeLabel: { fontSize: typography.body, lineHeight: 22, fontWeight: "800" },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  source: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: spacing.md, gap: 4 },
  sourceTitle: { fontSize: typography.body, lineHeight: 22, fontWeight: "700" },
  meta: { fontSize: typography.caption, lineHeight: 18 },
  url: { fontSize: typography.caption, lineHeight: 18 },
  version: { fontSize: typography.caption, lineHeight: 18 },
});
