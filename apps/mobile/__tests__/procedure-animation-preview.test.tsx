import { fireEvent, render } from "@testing-library/react-native";
import { ODERSA_MVP_DRAFTS } from "@rapidaid/content-workflow/odersa";
import { AccessibilityInfo, StyleSheet } from "react-native";

import { LanguageSelector } from "@/components/LanguageSelector";
import { AppProviders } from "@/providers/AppProviders";
import { odersaDevelopmentProtocolPreview } from "@/protocols/developmentProtocolPreview";
import {
  developmentAnimationGuidanceNotes,
  developmentStepAnimations,
} from "@/protocols/developmentStepVisualRegistry";
import { GuideDetailScreen } from "@/screens/GuideDetailScreen";
import { InMemoryAppSettingsStore } from "@/settings/settingsStore";
import { darkColors } from "@/theme/tokens";
import { createSyntheticTestProtocolRepository } from "../test-support/testProtocolRepository";

const chokingGuideId = "protocol.odersa.l-etouffement-d-un-adulte";
const visualStepIds = [
  "step.odersa.l-etouffement-d-un-adulte.3",
  "step.odersa.l-etouffement-d-un-adulte.4",
  "step.odersa.l-etouffement-d-un-adulte.7",
];

function mockReducedMotion(enabled: boolean): void {
  jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(enabled);
  jest.spyOn(AccessibilityInfo, "addEventListener").mockReturnValue(
    { remove: jest.fn() } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>,
  );
}

function PreviewProviders({
  children,
  settingsStore,
}: React.PropsWithChildren<{ settingsStore?: InMemoryAppSettingsStore }>) {
  return (
    <AppProviders
      developmentProtocolPreview={odersaDevelopmentProtocolPreview}
      settingsStore={settingsStore}
    >
      {children}
    </AppProviders>
  );
}

describe("adult choking storyboard preview", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("associates three sourced development animations without changing source content", () => {
    const chokingGuide = odersaDevelopmentProtocolPreview.guides.find((guide) => guide.id === chokingGuideId)!;
    const chokingDraft = ODERSA_MVP_DRAFTS.find((draft) => draft.protocolId === chokingGuideId)!;
    const guidesWithVisuals = odersaDevelopmentProtocolPreview.guides.filter((guide) => (
      guide.sections.some((section) => section.steps.some((step) => step.visual))
    ));

    expect(chokingGuide.sections.flatMap((section) => section.steps)
      .filter((step) => step.visual)
      .map((step) => step.id)).toEqual(visualStepIds);
    expect(guidesWithVisuals.map((guide) => guide.id)).toEqual([chokingGuideId]);
    expect(developmentStepAnimations).toHaveLength(3);
    expect(developmentStepAnimations.every((animation) => (
      animation.developmentStatus === "development-preview"
      && animation.clinicalReviewStatus === "not-reviewed"
      && animation.sourceCheckedAt === "2026-09-27"
      && animation.sources.length >= 5
      && animation.storyboard.sequence.length >= 3
    ))).toBe(true);
    expect(developmentAnimationGuidanceNotes.map((note) => note.topic)).toEqual([
      "cycle-count",
      "emergency-activation-timing",
    ]);
    expect(chokingGuide.sections.map((section) => section.steps.map((step) => step.text))).toEqual(
      chokingDraft.content.sections.map((section) => section.steps.map((step) => step.text)),
    );
  });

  it("navigates, switches local storyboard slots, and replays without network access", async () => {
    mockReducedMotion(false);
    const fetchSpy = jest.spyOn(globalThis, "fetch");
    const chokingGuide = odersaDevelopmentProtocolPreview.guides.find((guide) => guide.id === chokingGuideId)!;
    const steps = chokingGuide.sections.flatMap((section) => section.steps);
    const screen = await render(
      <PreviewProviders>
        <GuideDetailScreen guideId={chokingGuideId} />
      </PreviewProviders>,
    );

    await screen.findByText(steps[0]!.text.en);
    await fireEvent.press(screen.getByRole("button", { name: "Next" }));
    await fireEvent.press(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(steps[2]!.text.en)).toBeTruthy();
    expect(screen.getByTestId("procedure-step-visual-choking-back-blows-v1")).toBeTruthy();
    expect(screen.getByTestId("animation-scene-back-blows")).toBeTruthy();
    expect(screen.getByTestId("back-blow-contact-point")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Replay" }));
    await fireEvent.press(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(steps[3]!.text.en)).toBeTruthy();
    expect(screen.getByTestId("procedure-step-visual-choking-abdominal-thrusts-v1")).toBeTruthy();
    expect(screen.getByTestId("animation-scene-abdominal-thrusts")).toBeTruthy();
    expect(screen.getByTestId("abdominal-thrust-contact-point")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByTestId("procedure-step-visual-choking-back-blows-v1")).toBeTruthy();

    for (let step = 3; step < 7; step += 1) {
      await fireEvent.press(screen.getByRole("button", { name: "Next" }));
    }
    expect(screen.getByText(steps[6]!.text.en)).toBeTruthy();
    expect(screen.getByTestId("procedure-step-visual-choking-unresponsive-cpr-v1")).toBeTruthy();
    expect(screen.getByTestId("animation-scene-unresponsive-cpr")).toBeTruthy();
    expect(screen.getByTestId("cpr-moving-hands")).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders French, dark mode, and a static accessible storyboard for reduced motion", async () => {
    mockReducedMotion(true);
    const settingsStore = new InMemoryAppSettingsStore({
      schemaVersion: 1,
      language: "fr",
      isDarkMode: true,
      onboardingCompleted: true,
    });
    const chokingGuide = odersaDevelopmentProtocolPreview.guides.find((guide) => guide.id === chokingGuideId)!;
    const steps = chokingGuide.sections.flatMap((section) => section.steps);
    const screen = await render(
      <PreviewProviders settingsStore={settingsStore}>
        <LanguageSelector />
        <GuideDetailScreen guideId={chokingGuideId} />
      </PreviewProviders>,
    );

    await screen.findByText(steps[0]!.text.fr);
    await fireEvent.press(screen.getByRole("button", { name: "Suivant" }));
    await fireEvent.press(screen.getByRole("button", { name: "Suivant" }));

    expect(screen.getByLabelText(
      "Animation de développement : la victime est penchée vers l'avant. Le sauveteur se tient sur le côté, légèrement en arrière, soutient le thorax d'une main et dirige le talon de l'autre main ouverte entre les omoplates. Le visuel montre une à cinq claques séparées et une vérification après chacune.",
    )).toBeTruthy();
    const visualContainer = screen.getByTestId("procedure-step-visual-choking-back-blows-v1");
    expect(StyleSheet.flatten(visualContainer.props.style)).toMatchObject({ backgroundColor: darkColors.surface });
    expect(screen.getByText("Séquence statique affichée car la réduction des animations est activée.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Rejouer" }).props.accessibilityState).toEqual({ disabled: true });

    for (let step = 3; step < 7; step += 1) {
      await fireEvent.press(screen.getByRole("button", { name: "Suivant" }));
    }
    expect(screen.getByTestId("animation-scene-unresponsive-cpr-static")).toBeTruthy();
  });

  it("does not attach draft storyboard metadata to trusted repository content", async () => {
    mockReducedMotion(false);
    const screen = await render(
      <AppProviders protocolRepository={createSyntheticTestProtocolRepository()}>
        <GuideDetailScreen guideId="protocol.synthetic.mobile.alpha" />
      </AppProviders>,
    );

    expect(await screen.findByText("SYNTHETIC CONTENT SLOT ALPHA — DO NOT TAKE ACTION.")).toBeTruthy();
    for (const asset of ["choking-back-blows-v1", "choking-abdominal-thrusts-v1", "choking-unresponsive-cpr-v1"]) {
      expect(screen.queryByTestId(`procedure-step-visual-${asset}`)).toBeNull();
    }
  });
});
