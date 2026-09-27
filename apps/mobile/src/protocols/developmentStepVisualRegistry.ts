import type { PresentationStepVisual } from "@/protocols/presentation";

const chokingStoryboardAccessibilityLabel = {
  en: "Storyboard placeholder for this sourced step. Movement artwork requires clinical review.",
  fr: "Maquette visuelle pour cette étape sourcée. L'illustration du geste nécessite une revue clinique.",
} as const;

const developmentStepVisuals: Readonly<Record<string, PresentationStepVisual>> = Object.freeze({
  "step.odersa.l-etouffement-d-un-adulte.3": Object.freeze({
    type: "storyboard-placeholder",
    asset: "odersa-choking-storyboard-03-v1",
    loop: true,
    accessibilityLabel: chokingStoryboardAccessibilityLabel,
    reviewStatus: "requires-clinical-visual-review",
  }),
  "step.odersa.l-etouffement-d-un-adulte.4": Object.freeze({
    type: "storyboard-placeholder",
    asset: "odersa-choking-storyboard-04-v1",
    loop: true,
    accessibilityLabel: chokingStoryboardAccessibilityLabel,
    reviewStatus: "requires-clinical-visual-review",
  }),
  "step.odersa.l-etouffement-d-un-adulte.7": Object.freeze({
    type: "storyboard-placeholder",
    asset: "odersa-choking-storyboard-07-v1",
    loop: true,
    accessibilityLabel: chokingStoryboardAccessibilityLabel,
    reviewStatus: "requires-clinical-visual-review",
  }),
});

export function getDevelopmentStepVisual(stepId: string): PresentationStepVisual | undefined {
  return developmentStepVisuals[stepId];
}
