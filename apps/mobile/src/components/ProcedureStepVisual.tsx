import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import type { PresentationStepVisual as StepVisual } from "@/protocols/presentation";
import { minimumTouchTarget, radius, spacing, typography } from "@/theme/tokens";

type ProcedureStepVisualProps = {
  visual: StepVisual;
};

type StoryboardFigureProps = {
  color: string;
  label: string;
};

function StoryboardFigure({ color, label }: StoryboardFigureProps) {
  return (
    <View accessible={false} style={styles.figureColumn}>
      <View style={[styles.figureHead, { backgroundColor: color }]} />
      <View style={[styles.figureBody, { backgroundColor: color }]} />
      <Text style={[styles.figureLabel, { color }]}>{label}</Text>
    </View>
  );
}

export function ProcedureStepVisual({ visual }: ProcedureStepVisualProps) {
  const { colors, language, t } = useAppSettings();
  const [reduceMotion, setReduceMotion] = useState(true);
  const [replayCount, setReplayCount] = useState(0);
  const [playhead] = useState(() => new Animated.Value(0));

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
    playhead.stopAnimation();
    playhead.setValue(0);
    if (reduceMotion) return undefined;

    const playback = Animated.loop(
      Animated.sequence([
        Animated.timing(playhead, {
          duration: 2200,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.delay(350),
      ]),
      { iterations: visual.loop ? -1 : 1 },
    );
    playback.start();
    return () => playback.stop();
  }, [playhead, reduceMotion, replayCount, visual.asset, visual.loop]);

  const playheadOffset = playhead.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 104],
  });

  return (
    <View
      accessibilityLabel={visual.accessibilityLabel[language]}
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={`procedure-step-visual-${visual.asset}`}
    >
      <View accessible={false} style={styles.storyboardRow}>
        {[0, 1, 2].map((frame) => (
          <View
            key={frame}
            style={[styles.frame, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
          >
            <View style={styles.figures}>
              <StoryboardFigure color={colors.primary} label={t("helperLabel")} />
              <StoryboardFigure color={colors.emergencyForeground} label={t("patientLabel")} />
            </View>
          </View>
        ))}
      </View>

      <View accessible={false} style={[styles.timeline, { backgroundColor: colors.surfaceRaised }]}>
        <Animated.View
          style={[
            styles.playhead,
            { backgroundColor: colors.primary, transform: [{ translateX: playheadOffset }] },
          ]}
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
  storyboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  frame: {
    flex: 1,
    minHeight: 122,
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
  },
  figures: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: spacing.xs,
  },
  figureColumn: { alignItems: "center" },
  figureHead: { width: 18, height: 18, borderRadius: 9 },
  figureBody: { width: 22, height: 50, marginTop: 3, borderRadius: radius.sm },
  figureLabel: { maxWidth: 42, marginTop: spacing.xs, fontSize: 9, fontWeight: "800" },
  timeline: {
    alignSelf: "center",
    width: 132,
    height: 4,
    borderRadius: radius.pill,
  },
  playhead: { width: 28, height: 4, borderRadius: radius.pill },
  captionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
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
