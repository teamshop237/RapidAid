import { fireEvent, render } from "@testing-library/react-native";
import { ODERSA_MVP_DRAFTS } from "@rapidaid/content-workflow/odersa";

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

  it("opens every procedure with unchanged imported steps", async () => {
    for (const guide of odersaDevelopmentProtocolPreview.guides) {
      const screen = await render(
        <PreviewProviders>
          <GuideDetailScreen guideId={guide.id} />
        </PreviewProviders>,
      );
      expect((await screen.findAllByText(guide.title.en)).length).toBeGreaterThan(0);
      expect(screen.getByText(guide.sections[0]!.steps[0]!.text.en)).toBeTruthy();
      await screen.unmount();
    }
  });

  it("keeps ODERSA provenance visible and routes SAMU actions through confirmation", async () => {
    const onEmergency = jest.fn();
    const screen = await render(
      <PreviewProviders>
        <GuideDetailScreen
          guideId="protocol.odersa.l-arret-cardiaque"
          onEmergency={onEmergency}
        />
      </PreviewProviders>,
    );

    expect(await screen.findByText("Avant les secours, ODERSA, avantlessecours.odersa.org, CC BY 4.0")).toBeTruthy();
    expect(screen.getByText("ODERSA does not endorse RapidAid or this adaptation.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Open SAMU 119 confirmation" }));
    expect(onEmergency).toHaveBeenCalledTimes(1);
  });

  it("makes the preview unavailable when the compile-time development gate is false", () => {
    expect(resolveDevelopmentProtocolPreview(odersaDevelopmentProtocolPreview, false)).toBeUndefined();
    expect(resolveDevelopmentProtocolPreview(odersaDevelopmentProtocolPreview, true)).toBe(odersaDevelopmentProtocolPreview);
  });
});
