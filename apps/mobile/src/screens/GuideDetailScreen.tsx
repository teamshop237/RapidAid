import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppScreen } from "@/components/AppScreen";
import { DevelopmentPreviewNotice } from "@/components/DevelopmentPreviewNotice";
import { FixtureNotice } from "@/components/FixtureNotice";
import { GuideSourcesModal } from "@/components/GuideSourcesModal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProcedureStepCard } from "@/components/ProcedureStepCard";
import { ProtocolStatusView } from "@/components/ProtocolStatusView";
import { canOpenSystemDialer, getBundledDirectorySnapshot, MVP_SAMU_SERVICE_ID } from "@/directory/catalog";
import type { DirectorySnapshot } from "@/directory/types";
import { useAppSettings } from "@/providers/AppProviders";
import { useProtocolContent } from "@/providers/ProtocolContentProvider";
import { localizePresentationText } from "@/protocols/presentation";
import { minimumTouchTarget, radius, spacing, typography } from "@/theme/tokens";

type GuideDetailScreenProps = {
  guideId: string;
  onComplete?: () => void;
  snapshot?: DirectorySnapshot;
};

export function GuideDetailScreen({
  guideId,
  onComplete,
  snapshot = getBundledDirectorySnapshot(),
}: GuideDetailScreenProps) {
  const { colors, language, t } = useAppSettings();
  const insets = useSafeAreaInsets();
  const protocolContent = useProtocolContent();
  const [stepIndex, setStepIndex] = useState(0);
  const [sourcesVisible, setSourcesVisible] = useState(false);
  const guide = protocolContent.status === "ready"
    ? protocolContent.guides.find((candidate) => candidate.id === guideId)
    : undefined;
  const steps = guide?.sections.flatMap((section) => section.steps.map((step) => ({
    ...step,
    sectionHeading: section.heading,
  }))) ?? [];
  const currentIndex = Math.min(stepIndex, Math.max(steps.length - 1, 0));
  const currentStep = steps[currentIndex];
  const title = guide ? localizePresentationText(guide.title, language) : t("guidesTitle");
  const unavailableStatus = protocolContent.status === "ready" ? "not-found" : protocolContent.status;
  const isDevelopmentPreview = protocolContent.status === "ready"
    && protocolContent.mode === "development-preview";
  const visibleSources = guide?.sources.filter((source) => (
    source.organization !== "ODERSA" || source.language === language
  )) ?? [];
  const samu = snapshot.emergencyServices.find((entry) => entry.id === MVP_SAMU_SERVICE_ID);
  const canContactSamu = guide?.emergencyServiceId === MVP_SAMU_SERVICE_ID
    && samu !== undefined
    && canOpenSystemDialer(samu);

  function confirmSamuDialerHandoff(): void {
    if (!samu || !canContactSamu || !canOpenSystemDialer(samu)) return;
    const dialableNumber = samu.phoneNumber.replace(/[ -]/g, "");
    Alert.alert(
      t("confirmEmergencyContact"),
      `${samu.serviceName[language]}\n${samu.phoneNumber}\n\n${t("dialerHandoffBody")}`,
      [
        { text: t("cancel"), style: "cancel" },
        { text: t("callService"), style: "destructive", onPress: () => { void Linking.openURL(`tel:${dialableNumber}`); } },
      ],
    );
  }

  const footer = guide && currentStep ? (
    <View style={[
      styles.footer,
      { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, spacing.md) },
    ]}>
      {guide.emergencyServiceId === MVP_SAMU_SERVICE_ID ? (
        <Pressable
          accessibilityLabel={t("contactSamu")}
          accessibilityHint={canContactSamu ? t("openSamuConfirmationHint") : t("callDisabledHint")}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContactSamu }}
          disabled={!canContactSamu}
          onPress={confirmSamuDialerHandoff}
          style={({ pressed }) => [
            styles.samuAction,
            { borderColor: colors.emergency, backgroundColor: pressed ? colors.emergencySoft : colors.background },
            !canContactSamu && styles.disabled,
          ]}
        >
          <Ionicons accessible={false} color={canContactSamu ? colors.emergencyForeground : colors.textMuted} name="call" size={20} />
          <Text style={[styles.samuLabel, { color: canContactSamu ? colors.emergencyForeground : colors.textMuted }]}>
            {canContactSamu ? t("contactSamu") : t("callUnavailable")}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.navigation}>
        <Pressable
          accessibilityLabel={t("back")}
          accessibilityRole="button"
          accessibilityState={{ disabled: currentIndex === 0 }}
          disabled={currentIndex === 0}
          onPress={() => setStepIndex((value) => Math.max(0, value - 1))}
          style={({ pressed }) => [
            styles.backButton,
            { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceRaised : colors.surface },
            currentIndex === 0 && styles.disabled,
          ]}
        >
          <Ionicons accessible={false} color={colors.text} name="arrow-back" size={20} />
          <Text style={[styles.backLabel, { color: colors.text }]}>{t("back")}</Text>
        </Pressable>
        <View style={styles.nextButton}>
          <PrimaryButton
            icon={currentIndex === steps.length - 1 ? "checkmark" : "arrow-forward"}
            label={t(currentIndex === steps.length - 1 ? "finish" : "next")}
            onPress={() => {
              if (currentIndex === steps.length - 1) onComplete?.();
              else setStepIndex((value) => Math.min(steps.length - 1, value + 1));
            }}
          />
        </View>
      </View>
    </View>
  ) : undefined;

  return (
    <AppScreen
      contentContainerStyle={styles.content}
      footer={footer}
      includeTopInset={false}
      testID="guide-detail-screen"
    >
      <View style={styles.headingRow}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
        {guide ? (
          <Pressable
            accessibilityLabel={t("sourcesShort")}
            accessibilityRole="button"
            onPress={() => setSourcesVisible(true)}
            style={({ pressed }) => [styles.sourcesButton, { backgroundColor: pressed ? colors.surfaceRaised : colors.surface }]}
          >
            <Ionicons accessible={false} color={colors.primary} name="information-circle-outline" size={19} />
            <Text style={[styles.sourcesButtonLabel, { color: colors.primary }]}>{t("sourcesShort")}</Text>
          </Pressable>
        ) : null}
      </View>

      {!guide || !currentStep ? <ProtocolStatusView status={unavailableStatus} /> : (
        <>
          {isDevelopmentPreview ? <DevelopmentPreviewNotice /> : null}
          {guide.id.includes(".synthetic.") ? <FixtureNotice /> : null}
          <ProcedureStepCard
            accessibilityLabel={currentStep.accessibilityLabel
              ? localizePresentationText(currentStep.accessibilityLabel, language)
              : undefined}
            key={currentStep.id}
            sectionTitle={localizePresentationText(currentStep.sectionHeading, language)}
            stepNumber={currentIndex + 1}
            text={localizePresentationText(currentStep.text, language)}
            totalSteps={steps.length}
          />
          <GuideSourcesModal
            contentVersion={guide.contentVersion}
            language={language}
            onClose={() => setSourcesVisible(false)}
            sources={visibleSources}
            visible={sourcesVisible}
          />
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.lg },
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.title,
    lineHeight: 31,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  sourcesButton: {
    minHeight: minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  sourcesButtonLabel: { fontSize: typography.caption, lineHeight: 18, fontWeight: "800" },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  samuAction: {
    minHeight: minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  samuLabel: { fontSize: typography.body, lineHeight: 22, fontWeight: "800" },
  navigation: { flexDirection: "row", gap: spacing.sm },
  backButton: {
    minWidth: 108,
    minHeight: minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  backLabel: { fontSize: typography.body, lineHeight: 22, fontWeight: "700" },
  nextButton: { flex: 1 },
  disabled: { opacity: 0.45 },
});
