import { fireEvent, render } from "@testing-library/react-native";
import { ODERSA_MVP_DRAFTS } from "@rapidaid/content-workflow/odersa";
import { Alert, Linking } from "react-native";

import { LanguageSelector } from "@/components/LanguageSelector";
import { AppProviders } from "@/providers/AppProviders";
import { resolveDevelopmentProtocolPreview } from "@/providers/ProtocolContentProvider";
import { odersaDevelopmentProtocolPreview } from "@/protocols/developmentProtocolPreview";
import { GuideDetailScreen } from "@/screens/GuideDetailScreen";
import { GuidesScreen } from "@/screens/GuidesScreen";

const englishTitles = [
  "Cardiac arrest",
  "An adult choking",
  "Severe bleeding and the tourniquet",
  "The kitchen burn",
  "Stroke, in 60 seconds",
  "A convulsive seizure",
];

const frenchTitles = [
  "L'arrêt cardiaque",
  "L'étouffement d'un adulte",
  "L'hémorragie grave et le garrot",
  "La brûlure de cuisine",
  "L'AVC en 60 secondes",
  "La crise convulsive",
];

function PreviewProviders({ children }: React.PropsWithChildren) {
  return (
    <AppProviders developmentProtocolPreview={odersaDevelopmentProtocolPreview}>
      {children}
    </AppProviders>
  );
}

describe("ODERSA development protocol preview", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("maps the imported draft text without rewriting or reordering it", () => {
    for (const draft of ODERSA_MVP_DRAFTS) {
      const guide = odersaDevelopmentProtocolPreview.guides.find((candidate) => candidate.id === draft.protocolId);
      expect(guide?.sections.map((section) => section.steps.map((step) => step.text))).toEqual(
        draft.content.sections.map((section) => section.steps.map((step) => step.text)),
      );
    }
    expect(odersaDevelopmentProtocolPreview.guides
      .filter((guide) => guide.emergencyServiceId)
      .map((guide) => guide.id)).toEqual([
      "protocol.odersa.l-arret-cardiaque",
      "protocol.odersa.la-brulure-de-cuisine",
      "protocol.odersa.l-avc-en-60-secondes",
    ]);
  });

  it("shows all six source procedures in English and French", async () => {
    const screen = await render(
      <PreviewProviders>
        <LanguageSelector />
        <GuidesScreen onOpenGuide={jest.fn()} />
      </PreviewProviders>,
    );

    expect(await screen.findByTestId("development-protocol-preview")).toBeTruthy();
    for (const title of englishTitles) expect(screen.getByText(title)).toBeTruthy();

    await fireEvent.press(screen.getByRole("radio", { name: "Français" }));
    for (const title of frenchTitles) expect(screen.getByText(title)).toBeTruthy();
  });

  it("opens every procedure at its first unchanged imported step", async () => {
    for (const guide of odersaDevelopmentProtocolPreview.guides) {
      const screen = await render(
        <PreviewProviders>
          <LanguageSelector />
          <GuideDetailScreen guideId={guide.id} />
        </PreviewProviders>,
      );
      expect((await screen.findAllByText(guide.title.en)).length).toBeGreaterThan(0);
      expect(screen.getByText(guide.sections[0]!.steps[0]!.text.en)).toBeTruthy();
      expect(screen.getByText(`Step 1 of ${guide.sections[0]!.steps.length}`)).toBeTruthy();
      await fireEvent.press(screen.getByRole("radio", { name: "Français" }));
      expect(screen.getByText(guide.sections[0]!.steps[0]!.text.fr)).toBeTruthy();
      expect(screen.getByText(`Étape 1 sur ${guide.sections[0]!.steps.length}`)).toBeTruthy();
      await screen.unmount();
    }
  });

  it("advances one source step at a time and returns without losing progress", async () => {
    const guide = odersaDevelopmentProtocolPreview.guides[0]!;
    const screen = await render(
      <PreviewProviders>
        <GuideDetailScreen guideId={guide.id} />
      </PreviewProviders>,
    );

    const firstStep = guide.sections[0]!.steps[0]!.text.en;
    const secondStep = guide.sections[0]!.steps[1]!.text.en;
    expect(await screen.findByText(firstStep)).toBeTruthy();
    expect(screen.queryByText(secondStep)).toBeNull();

    await fireEvent.press(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(secondStep)).toBeTruthy();
    expect(screen.queryByText(firstStep)).toBeNull();
    expect(screen.getByText(`Step 2 of ${guide.sections[0]!.steps.length}`)).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText(firstStep)).toBeTruthy();
  });

  it("keeps ODERSA provenance separate and uses one SAMU confirmation", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const linkingSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    const screen = await render(
      <PreviewProviders>
        <GuideDetailScreen guideId="protocol.odersa.l-arret-cardiaque" />
      </PreviewProviders>,
    );

    expect(screen.queryByText("Avant les secours, ODERSA, avantlessecours.odersa.org, CC BY 4.0")).toBeNull();
    await fireEvent.press(screen.getByRole("button", { name: "Sources" }));
    expect(screen.getByText("Avant les secours, ODERSA, avantlessecours.odersa.org, CC BY 4.0")).toBeTruthy();
    expect(screen.getByText("ODERSA does not endorse RapidAid or this adaptation.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Close" }));

    const secondStep = odersaDevelopmentProtocolPreview.guides[0]!.sections[0]!.steps[1]!.text.en;
    await fireEvent.press(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(secondStep)).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Contact SAMU 119" }));
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(linkingSpy).not.toHaveBeenCalled();
    const confirmationButtons = alertSpy.mock.calls[0]?.[2] ?? [];
    confirmationButtons.find((button) => button.text === "Open phone dialer")?.onPress?.();
    expect(linkingSpy).toHaveBeenCalledWith("tel:119");
    expect(screen.getByText(secondStep)).toBeTruthy();
  });

  it("makes the preview unavailable when the compile-time development gate is false", () => {
    expect(resolveDevelopmentProtocolPreview(odersaDevelopmentProtocolPreview, false)).toBeUndefined();
    expect(resolveDevelopmentProtocolPreview(odersaDevelopmentProtocolPreview, true)).toBe(odersaDevelopmentProtocolPreview);
  });
});
