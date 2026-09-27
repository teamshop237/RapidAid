import { fireEvent, render } from "@testing-library/react-native";
import { ODERSA_MVP_DRAFTS } from "@rapidaid/content-workflow/odersa";
import { AccessibilityInfo, StyleSheet } from "react-native";

import { LanguageSelector } from "@/components/LanguageSelector";
import { AppProviders } from "@/providers/AppProviders";
import { odersaDevelopmentProtocolPreview } from "@/protocols/developmentProtocolPreview";
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

  it("associates three development-only placeholders without changing source content", () => {
    const chokingGuide = odersaDevelopmentProtocolPreview.guides.find((guide) => guide.id === chokingGuideId)!;
    const chokingDraft = ODERSA_MVP_DRAFTS.find((draft) => draft.protocolId === chokingGuideId)!;
    const guidesWithVisuals = odersaDevelopmentProtocolPreview.guides.filter((guide) => (
      guide.sections.some((section) => section.steps.some((step) => step.visual))
    ));

    expect(chokingGuide.sections.flatMap((section) => section.steps)
      .filter((step) => step.visual)
      .map((step) => step.id)).toEqual(visualStepIds);
    expect(guidesWithVisuals.map((guide) => guide.id)).toEqual([chokingGuideId]);
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
    expect(screen.getByTestId("procedure-step-visual-odersa-choking-storyboard-03-v1")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Replay" }));
    await fireEvent.press(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(steps[3]!.text.en)).toBeTruthy();
    expect(screen.getByTestId("procedure-step-visual-odersa-choking-storyboard-04-v1")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByTestId("procedure-step-visual-odersa-choking-storyboard-03-v1")).toBeTruthy();

    for (let step = 3; step < 7; step += 1) {
      await fireEvent.press(screen.getByRole("button", { name: "Next" }));
    }
    expect(screen.getByText(steps[6]!.text.en)).toBeTruthy();
    expect(screen.getByTestId("procedure-step-visual-odersa-choking-storyboard-07-v1")).toBeTruthy();
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

    const visual = screen.getByLabelText(
      "Maquette visuelle pour cette étape sourcée. L'illustration du geste nécessite une revue clinique.",
    );
    expect(StyleSheet.flatten(visual.props.style)).toMatchObject({ backgroundColor: darkColors.surface });
    expect(screen.getByText("Maquette statique affichée car la réduction des animations est activée.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Rejouer" }).props.accessibilityState).toEqual({ disabled: true });
  });

  it("does not attach draft storyboard metadata to trusted repository content", async () => {
    mockReducedMotion(false);
    const screen = await render(
      <AppProviders protocolRepository={createSyntheticTestProtocolRepository()}>
        <GuideDetailScreen guideId="protocol.synthetic.mobile.alpha" />
      </AppProviders>,
    );

    expect(await screen.findByText("SYNTHETIC CONTENT SLOT ALPHA — DO NOT TAKE ACTION.")).toBeTruthy();
    for (const asset of ["03", "04", "07"]) {
      expect(screen.queryByTestId(`procedure-step-visual-odersa-choking-storyboard-${asset}-v1`)).toBeNull();
    }
  });
});
