import type { StyleProp, ViewStyle } from "react-native";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "@/providers/AppProviders";
import { radius, spacing, typography } from "@/theme/tokens";

export type DevelopmentProcedureAnimationProps = {
  asset: string;
  progress: Animated.Value;
  reducedMotion: boolean;
};

type StandingFigureProps = {
  color: string;
  style: StyleProp<ViewStyle>;
};

function StandingFigure({ color, style }: StandingFigureProps) {
  return (
    <View style={[styles.standingFigure, style]}>
      <View style={[styles.head, { backgroundColor: color }]} />
      <View style={[styles.torso, { backgroundColor: color }]} />
      <View style={styles.legs}>
        <View style={[styles.leg, { backgroundColor: color }]} />
        <View style={[styles.leg, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function FigureLegend() {
  const { colors, t } = useAppSettings();
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.legendLabel, { color: colors.textMuted }]}>{t("helperLabel")}</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.emergencyForeground }]} />
        <Text style={[styles.legendLabel, { color: colors.textMuted }]}>{t("patientLabel")}</Text>
      </View>
    </View>
  );
}

function PhaseStrip({ labels }: { labels: readonly string[] }) {
  const { colors } = useAppSettings();
  return (
    <View style={styles.phaseStrip}>
      {labels.map((label, index) => (
        <View key={label} style={styles.phaseItem}>
          <View style={[styles.phaseNumber, { backgroundColor: colors.primary }] }>
            <Text style={styles.phaseNumberText}>{index + 1}</Text>
          </View>
          <Text numberOfLines={2} style={[styles.phaseLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function BackBlowsAnimation({ progress, reducedMotion }: Omit<DevelopmentProcedureAnimationProps, "asset">) {
  const { colors, t } = useAppSettings();
  const strikingArmMotion = reducedMotion ? undefined : {
    transform: [
      { translateX: progress.interpolate({ inputRange: [0, 0.35, 0.52, 0.7, 1], outputRange: [-18, -18, 10, -18, -18] }) },
      { translateY: progress.interpolate({ inputRange: [0, 0.35, 0.52, 0.7, 1], outputRange: [-12, -12, 18, -12, -12] }) },
      { rotate: progress.interpolate({ inputRange: [0, 0.52, 1], outputRange: ["-28deg", "8deg", "-28deg"] }) },
    ],
  };
  const contactPulse = reducedMotion ? undefined : {
    opacity: progress.interpolate({ inputRange: [0, 0.38, 0.52, 0.65, 1], outputRange: [0.35, 0.35, 1, 0.35, 0.35] }),
    transform: [{ scale: progress.interpolate({ inputRange: [0, 0.52, 1], outputRange: [1, 1.35, 1] }) }],
  };

  return (
    <View testID="animation-scene-back-blows">
      <View style={[styles.stage, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
        <StandingFigure color={colors.primary} style={styles.backHelper} />
        <StandingFigure color={colors.emergencyForeground} style={styles.forwardPatient} />
        <View style={[styles.supportArm, { backgroundColor: colors.primary }]} />
        <View style={[styles.supportHand, { backgroundColor: colors.primary }]} />
        <Animated.View
          style={[styles.strikingArm, { backgroundColor: colors.primary }, strikingArmMotion]}
          testID="back-blow-moving-arm"
        >
          <View style={[styles.openHand, { borderColor: colors.primary }]} />
        </Animated.View>
        <Animated.View
          style={[styles.backContact, { backgroundColor: colors.focus, borderColor: colors.surface }, contactPulse]}
          testID="back-blow-contact-point"
        />
        <Text style={[styles.motionArrow, styles.backArrow, { color: colors.primary }]}>↘</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.countText, { color: colors.text }]}>{t("animationOneToFive")}</Text>
        </View>
      </View>
      <PhaseStrip labels={[t("animationLeanSupport"), t("animationBackBlow"), t("animationCheckEach")]} />
      <FigureLegend />
    </View>
  );
}

function AbdominalThrustsAnimation({ progress, reducedMotion }: Omit<DevelopmentProcedureAnimationProps, "asset">) {
  const { colors, t } = useAppSettings();
  const handMotion = reducedMotion ? { transform: [{ translateX: -5 }, { translateY: -7 }] } : {
    transform: [
      { translateX: progress.interpolate({ inputRange: [0, 0.3, 0.5, 0.68, 1], outputRange: [4, 4, -8, 4, 4] }) },
      { translateY: progress.interpolate({ inputRange: [0, 0.3, 0.5, 0.68, 1], outputRange: [3, 3, -12, 3, 3] }) },
    ],
  };
  const contactPulse = reducedMotion ? undefined : {
    opacity: progress.interpolate({ inputRange: [0, 0.3, 0.5, 0.7, 1], outputRange: [0.4, 0.4, 1, 0.4, 0.4] }),
    transform: [{ scale: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] }) }],
  };

  return (
    <View testID="animation-scene-abdominal-thrusts">
      <View style={[styles.stage, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
        <StandingFigure color={colors.primary} style={styles.thrustHelper} />
        <StandingFigure color={colors.emergencyForeground} style={styles.thrustPatient} />
        <View style={[styles.wrapArmTop, { backgroundColor: colors.primary }]} />
        <View style={[styles.wrapArmBottom, { backgroundColor: colors.primary }]} />
        <Animated.View
          style={[styles.thrustHands, { backgroundColor: colors.primary, borderColor: colors.surface }, handMotion]}
          testID="abdominal-thrust-moving-hands"
        />
        <Animated.View
          style={[styles.abdomenContact, { backgroundColor: colors.focus, borderColor: colors.surface }, contactPulse]}
          testID="abdominal-thrust-contact-point"
        />
        <Text style={[styles.motionArrow, styles.thrustArrow, { color: colors.primary }]}>↖</Text>
        <Text style={[styles.contactLabel, { color: colors.text }]}>{t("animationAboveNavel")}</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.countText, { color: colors.text }]}>{t("animationOneToFive")}</Text>
        </View>
      </View>
      <PhaseStrip labels={[t("animationPositionBehind"), t("animationPlaceHands"), t("animationInAndUp")]} />
      <FigureLegend />
    </View>
  );
}

function LoweringScene({ progress, reducedMotion }: Omit<DevelopmentProcedureAnimationProps, "asset">) {
  const { colors } = useAppSettings();
  const patientMotion = reducedMotion ? { transform: [{ rotate: "76deg" }, { translateX: 26 }, { translateY: 52 }] } : {
    transform: [
      { rotate: progress.interpolate({ inputRange: [0, 0.28, 1], outputRange: ["0deg", "76deg", "76deg"] }) },
      { translateX: progress.interpolate({ inputRange: [0, 0.28, 1], outputRange: [0, 26, 26] }) },
      { translateY: progress.interpolate({ inputRange: [0, 0.28, 1], outputRange: [0, 52, 52] }) },
    ],
  };
  return (
    <View style={styles.sequenceScene}>
      <StandingFigure color={colors.primary} style={styles.loweringHelper} />
      <Animated.View style={[styles.loweringPatientWrapper, patientMotion]} testID="unresponsive-lowering-patient">
        <StandingFigure color={colors.emergencyForeground} style={styles.loweringPatient} />
      </Animated.View>
      <View style={[styles.supportingArm, { backgroundColor: colors.primary }]} />
      <View style={[styles.floorLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

function AlertScene() {
  const { colors, t } = useAppSettings();
  return (
    <View style={styles.sequenceScene}>
      <View style={[styles.phone, { borderColor: colors.primary }]}>
        <View style={[styles.phoneSpeaker, { backgroundColor: colors.primary }]} />
        <Text style={[styles.phoneSymbol, { color: colors.primary }]}>☎</Text>
      </View>
      <Text style={[styles.alertLabel, { color: colors.text }]}>{t("animationCallForHelp")}</Text>
      <Text style={[styles.alertCaveat, { color: colors.textMuted }]}>{t("animationCallNotConnected")}</Text>
    </View>
  );
}

function CompressionScene({ progress, reducedMotion }: Omit<DevelopmentProcedureAnimationProps, "asset">) {
  const { colors, t } = useAppSettings();
  const compressionMotion = reducedMotion ? undefined : {
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 0.62, 0.72, 0.82, 0.92, 1], outputRange: [0, 0, 9, 0, 9, 0] }) }],
  };
  return (
    <View style={styles.sequenceScene}>
      <View style={[styles.supineHead, { backgroundColor: colors.emergencyForeground }]} />
      <View style={[styles.supineBody, { backgroundColor: colors.emergencyForeground }]} />
      <View style={[styles.kneelingHelperHead, { backgroundColor: colors.primary }]} />
      <View style={[styles.kneelingHelperBody, { backgroundColor: colors.primary }]} />
      <View style={[styles.compressionArms, { backgroundColor: colors.primary }]} />
      <Animated.View
        style={[styles.compressionHands, { backgroundColor: colors.primary, borderColor: colors.surface }, compressionMotion]}
        testID="cpr-moving-hands"
      />
      <View style={[styles.chestContact, { backgroundColor: colors.focus, borderColor: colors.surface }]} />
      <Text style={[styles.verticalArrow, { color: colors.primary }]}>↓</Text>
      <View style={[styles.compressionBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.countText, { color: colors.text }]}>{t("animationThirtyCompressions")}</Text>
      </View>
    </View>
  );
}

function UnresponsiveAnimation({ progress, reducedMotion }: Omit<DevelopmentProcedureAnimationProps, "asset">) {
  const { colors, t } = useAppSettings();
  if (reducedMotion) {
    return (
      <View testID="animation-scene-unresponsive-cpr-static">
        <View style={[styles.staticSequence, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
          <View style={styles.staticPanel}><Text style={[styles.staticIcon, { color: colors.primary }]}>↘</Text><Text style={[styles.staticLabel, { color: colors.text }]}>{t("animationLowerGently")}</Text></View>
          <View style={styles.staticPanel}><Text style={[styles.staticIcon, { color: colors.primary }]}>☎</Text><Text style={[styles.staticLabel, { color: colors.text }]}>{t("animationCallForHelp")}</Text></View>
          <View style={styles.staticPanel}><Text style={[styles.staticIcon, { color: colors.primary }]}>↓</Text><Text style={[styles.staticLabel, { color: colors.text }]}>{t("animationThirtyCompressions")}</Text></View>
        </View>
        <PhaseStrip labels={[t("animationLowerGently"), t("animationCallForHelp"), t("animationStartCompressions")]} />
        <FigureLegend />
      </View>
    );
  }

  const lowerOpacity = progress.interpolate({ inputRange: [0, 0.28, 0.34, 1], outputRange: [1, 1, 0, 0] });
  const alertOpacity = progress.interpolate({ inputRange: [0, 0.3, 0.38, 0.56, 0.62, 1], outputRange: [0, 0, 1, 1, 0, 0] });
  const compressionOpacity = progress.interpolate({ inputRange: [0, 0.56, 0.64, 1], outputRange: [0, 0, 1, 1] });

  return (
    <View testID="animation-scene-unresponsive-cpr">
      <View style={[styles.stage, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
        <Animated.View style={[styles.absoluteScene, { opacity: lowerOpacity }]}><LoweringScene progress={progress} reducedMotion={false} /></Animated.View>
        <Animated.View style={[styles.absoluteScene, { opacity: alertOpacity }]}><AlertScene /></Animated.View>
        <Animated.View style={[styles.absoluteScene, { opacity: compressionOpacity }]}><CompressionScene progress={progress} reducedMotion={false} /></Animated.View>
      </View>
      <PhaseStrip labels={[t("animationLowerGently"), t("animationCallForHelp"), t("animationStartCompressions")]} />
      <FigureLegend />
    </View>
  );
}

export function DevelopmentProcedureAnimation({ asset, progress, reducedMotion }: DevelopmentProcedureAnimationProps) {
  if (asset === "choking-back-blows-v1") {
    return <BackBlowsAnimation progress={progress} reducedMotion={reducedMotion} />;
  }
  if (asset === "choking-abdominal-thrusts-v1") {
    return <AbdominalThrustsAnimation progress={progress} reducedMotion={reducedMotion} />;
  }
  if (asset === "choking-unresponsive-cpr-v1") {
    return <UnresponsiveAnimation progress={progress} reducedMotion={reducedMotion} />;
  }
  return null;
}

const styles = StyleSheet.create({
  stage: { height: 198, overflow: "hidden", borderWidth: 1, borderRadius: radius.md },
  standingFigure: { position: "absolute", width: 46, alignItems: "center" },
  head: { width: 28, height: 28, borderRadius: 14 },
  torso: { width: 36, height: 70, marginTop: 3, borderRadius: radius.md },
  legs: { flexDirection: "row", gap: 6 },
  leg: { width: 11, height: 52, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  backHelper: { left: 38, top: 25 },
  forwardPatient: { left: 150, top: 22, transform: [{ rotate: "18deg" }] },
  supportArm: { position: "absolute", left: 72, top: 88, width: 82, height: 9, borderRadius: 5, transform: [{ rotate: "8deg" }] },
  supportHand: { position: "absolute", left: 148, top: 91, width: 16, height: 16, borderRadius: 8 },
  strikingArm: { position: "absolute", left: 82, top: 58, width: 73, height: 10, borderRadius: 5 },
  openHand: { position: "absolute", right: -10, top: -5, width: 23, height: 20, borderWidth: 4, borderRadius: 6 },
  backContact: { position: "absolute", left: 160, top: 64, width: 19, height: 19, borderWidth: 3, borderRadius: 10 },
  motionArrow: { position: "absolute", fontSize: 35, lineHeight: 40, fontWeight: "900" },
  backArrow: { left: 112, top: 31 },
  countBadge: { position: "absolute", right: spacing.sm, bottom: spacing.sm, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  countText: { fontSize: typography.caption, lineHeight: 17, fontWeight: "900" },
  thrustHelper: { left: 59, top: 22 },
  thrustPatient: { left: 137, top: 20, transform: [{ rotate: "12deg" }] },
  wrapArmTop: { position: "absolute", left: 87, top: 86, width: 73, height: 8, borderRadius: 4, transform: [{ rotate: "7deg" }] },
  wrapArmBottom: { position: "absolute", left: 88, top: 102, width: 72, height: 8, borderRadius: 4, transform: [{ rotate: "-4deg" }] },
  thrustHands: { position: "absolute", left: 143, top: 91, width: 25, height: 19, borderWidth: 3, borderRadius: 9, zIndex: 3 },
  abdomenContact: { position: "absolute", left: 153, top: 97, width: 16, height: 16, borderWidth: 3, borderRadius: 8, zIndex: 2 },
  thrustArrow: { left: 171, top: 53 },
  contactLabel: { position: "absolute", left: 174, top: 98, maxWidth: 82, fontSize: typography.caption, lineHeight: 16, fontWeight: "800" },
  phaseStrip: { flexDirection: "row", justifyContent: "space-between", gap: spacing.xs, marginTop: spacing.sm },
  phaseItem: { flex: 1, alignItems: "center", gap: 3 },
  phaseNumber: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  phaseNumberText: { color: "#FFFFFF", fontSize: 11, lineHeight: 14, fontWeight: "900" },
  phaseLabel: { textAlign: "center", fontSize: 10, lineHeight: 13, fontWeight: "700" },
  legend: { flexDirection: "row", justifyContent: "center", gap: spacing.md, marginTop: spacing.sm },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { fontSize: typography.caption, lineHeight: 16, fontWeight: "700" },
  absoluteScene: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  sequenceScene: { flex: 1 },
  loweringHelper: { left: 57, top: 21 },
  loweringPatientWrapper: { position: "absolute", left: 131, top: 19, width: 46, height: 156 },
  loweringPatient: { left: 0, top: 0 },
  supportingArm: { position: "absolute", left: 86, top: 75, width: 57, height: 10, borderRadius: 5, transform: [{ rotate: "22deg" }] },
  floorLine: { position: "absolute", left: 20, right: 20, bottom: 17, height: 2 },
  phone: { position: "absolute", left: "50%", top: 30, width: 58, height: 92, marginLeft: -29, alignItems: "center", justifyContent: "center", borderWidth: 4, borderRadius: radius.md },
  phoneSpeaker: { position: "absolute", top: 7, width: 18, height: 3, borderRadius: 2 },
  phoneSymbol: { fontSize: 31, lineHeight: 38 },
  alertLabel: { marginTop: 130, textAlign: "center", fontSize: typography.heading, lineHeight: 24, fontWeight: "900" },
  alertCaveat: { marginTop: spacing.xs, textAlign: "center", fontSize: typography.caption, lineHeight: 16 },
  supineHead: { position: "absolute", left: 39, top: 112, width: 28, height: 28, borderRadius: 14 },
  supineBody: { position: "absolute", left: 65, top: 109, width: 121, height: 39, borderRadius: radius.md },
  kneelingHelperHead: { position: "absolute", left: 151, top: 25, width: 28, height: 28, borderRadius: 14 },
  kneelingHelperBody: { position: "absolute", left: 143, top: 55, width: 44, height: 52, borderRadius: radius.md },
  compressionArms: { position: "absolute", left: 126, top: 83, width: 14, height: 55, borderRadius: 7, transform: [{ rotate: "18deg" }] },
  compressionHands: { position: "absolute", left: 111, top: 110, width: 35, height: 15, borderWidth: 3, borderRadius: 8, zIndex: 3 },
  chestContact: { position: "absolute", left: 116, top: 121, width: 18, height: 18, borderWidth: 3, borderRadius: 9, zIndex: 2 },
  verticalArrow: { position: "absolute", left: 112, top: 70, fontSize: 34, lineHeight: 38, fontWeight: "900" },
  compressionBadge: { position: "absolute", right: spacing.sm, bottom: spacing.sm, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  staticSequence: { minHeight: 154, flexDirection: "row", alignItems: "stretch", borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, gap: spacing.xs },
  staticPanel: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  staticIcon: { fontSize: 31, lineHeight: 36, fontWeight: "900" },
  staticLabel: { textAlign: "center", fontSize: 10, lineHeight: 14, fontWeight: "800" },
});
