import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { DevelopmentProcedureAnimation } from "@/components/developmentProcedureAnimations";
import { useAppSettings } from "@/providers/AppProviders";
import type { PresentationStepVisual as StepVisual } from "@/protocols/presentation";
import { minimumTouchTarget, radius, spacing, typography } from "@/theme/tokens";

type ProcedureStepVisualProps = {
  visual: StepVisual;
};

export function ProcedureStepVisual({ visual }: ProcedureStepVisualProps) {
  const { colors, language, t } = useAppSettings();
  const [reduceMotion, setReduceMotion] = useState(true);
  const [replayCount, setReplayCount] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    if (reduceMotion) return undefined;

    const playback = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          duration: 4200,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.delay(700),
      ]),
      { iterations: visual.loop ? -1 : 1 },
    );
    playback.start();
    return () => playback.stop();
  }, [progress, reduceMotion, replayCount, visual.animationId, visual.loop]);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={`procedure-step-visual-${visual.asset}`}
    >
      <View
        accessibilityLabel={visual.accessibilityLabel[language]}
        accessibilityRole="image"
        accessible
      >
        <DevelopmentProcedureAnimation
          asset={visual.asset}
          progress={progress}
          reducedMotion={reduceMotion}
        />
      </View>

      <View style={styles.captionRow}>
        <View style={styles.captionCopy}>
          <Text style={[styles.reviewTitle, { color: colors.text }]}>{t("animationReviewPending")}</Text>
          <Text style={[styles.reviewBody, { color: colors.textMuted }]}>{t("animationReviewBody")}</Text>
          {reduceMotion ? (
            <Text style={[styles.reducedMotion, { color: colors.textMuted }]}>{t("reducedMotionActive")}</Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel={t("repeatAnimation")}
          accessibilityRole="button"
          accessibilityState={{ disabled: reduceMotion }}
          disabled={reduceMotion}
          onPress={() => setReplayCount((count) => count + 1)}
          style={({ pressed }) => [
            styles.replayButton,
            { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceRaised : colors.surface },
            reduceMotion && styles.disabled,
          ]}
          testID="procedure-animation-replay"
        >
          <Text style={[styles.replayLabel, { color: colors.primary }]}>{t("repeatAnimation")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.md,
  },
  captionRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  captionCopy: { flex: 1, gap: 2 },
  reviewTitle: { fontSize: typography.caption, lineHeight: 17, fontWeight: "800" },
  reviewBody: { fontSize: typography.caption, lineHeight: 17 },
  reducedMotion: { marginTop: spacing.xs, fontSize: typography.caption, lineHeight: 17, fontWeight: "700" },
  replayButton: {
    minWidth: minimumTouchTarget,
    minHeight: minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  replayLabel: { fontSize: typography.caption, lineHeight: 18, fontWeight: "800" },
  disabled: { opacity: 0.45 },
});
