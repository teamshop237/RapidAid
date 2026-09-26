import type {
  OfflinePackageFailureStatus,
  OfflineProtocolRepository,
} from "@rapidaid/protocol-engine";
import { fireEvent, render } from "@testing-library/react-native";

import { LanguageSelector } from "@/components/LanguageSelector";
import { AppProviders } from "@/providers/AppProviders";
import { GuideDetailScreen } from "@/screens/GuideDetailScreen";
import { GuidesScreen } from "@/screens/GuidesScreen";
import {
  cloneBundledSyntheticPackage,
  createSyntheticTestProtocolRepository,
} from "../test-support/testProtocolRepository";

const syntheticTitle = "Synthetic guide Alpha — not medical guidance";
const syntheticStep = "SYNTHETIC CONTENT SLOT ALPHA — DO NOT TAKE ACTION.";

function rejectedRepository(status: OfflinePackageFailureStatus): OfflineProtocolRepository {
  const failure = { status, message: `Synthetic ${status} failure.` } as const;
  return {
    loadPackage: async () => failure,
    getProtocol: async () => failure,
  };
}

describe("mobile offline protocol integration", () => {
  it("loads a bundled package through every validation gate before presentation", async () => {
    const repository = createSyntheticTestProtocolRepository();
    await expect(repository.loadPackage()).resolves.toMatchObject({ status: "ready" });

    const screen = await render(
      <AppProviders protocolRepository={repository}>
        <GuidesScreen onOpenGuide={jest.fn()} />
        <GuideDetailScreen guideId="protocol.synthetic.mobile.alpha" />
      </AppProviders>,
    );

    expect(await screen.findAllByText(syntheticTitle)).toHaveLength(2);
    expect(screen.getByText("DEVELOPMENT FIXTURE")).toBeTruthy();
    expect(screen.getByText(syntheticStep)).toBeTruthy();
  });

  it("preserves French localization for repository-supplied content", async () => {
    const screen = await render(
      <AppProviders protocolRepository={createSyntheticTestProtocolRepository()}>
        <LanguageSelector />
        <GuidesScreen onOpenGuide={jest.fn()} />
      </AppProviders>,
    );

    await fireEvent.press(screen.getByRole("radio", { name: "Français" }));

    expect(await screen.findByText("Guide synthétique Alpha — aucun conseil médical")).toBeTruthy();
    expect(screen.getByText("DONNÉES DE DÉVELOPPEMENT")).toBeTruthy();
  });

  it("rejects a tampered bundled package without exposing its protocol", async () => {
    const tampered = cloneBundledSyntheticPackage();
    tampered.protocols[0]!.summary.en = "TAMPERED CONTENT MUST NEVER BE DISPLAYED";
    const repository = createSyntheticTestProtocolRepository(tampered);

    await expect(repository.loadPackage()).resolves.toMatchObject({ status: "integrity-failed" });

    const screen = await render(
      <AppProviders protocolRepository={repository}>
        <GuidesScreen onOpenGuide={jest.fn()} />
      </AppProviders>,
    );
    expect(await screen.findByTestId("protocol-status-integrity-failed")).toBeTruthy();
    expect(screen.queryByText("TAMPERED CONTENT MUST NEVER BE DISPLAYED")).toBeNull();
    expect(screen.queryByText(syntheticTitle)).toBeNull();
  });

  it("rejects an unsigned bundled package without exposing its protocol", async () => {
    const unsigned = cloneBundledSyntheticPackage();
    delete unsigned.manifest.signature;
    const repository = createSyntheticTestProtocolRepository(unsigned);

    await expect(repository.loadPackage()).resolves.toMatchObject({ status: "signature-invalid" });

    const screen = await render(
      <AppProviders protocolRepository={repository}>
        <GuideDetailScreen guideId="protocol.synthetic.mobile.alpha" />
      </AppProviders>,
    );
    expect(await screen.findByTestId("protocol-status-signature-invalid")).toBeTruthy();
    expect(screen.queryByText(syntheticStep)).toBeNull();
  });

  it("hides previously ready content immediately when the repository changes", async () => {
    const readyRepository = createSyntheticTestProtocolRepository();
    const screen = await render(
      <AppProviders protocolRepository={readyRepository}>
        <GuidesScreen onOpenGuide={jest.fn()} />
      </AppProviders>,
    );
    expect(await screen.findByText(syntheticTitle)).toBeTruthy();

    await screen.rerender(
      <AppProviders protocolRepository={rejectedRepository("unapproved")}>
        <GuidesScreen onOpenGuide={jest.fn()} />
      </AppProviders>,
    );

    expect(screen.queryByText(syntheticTitle)).toBeNull();
    expect(await screen.findByTestId("protocol-status-unapproved")).toBeTruthy();
  });

  it.each<OfflinePackageFailureStatus>([
    "missing",
    "storage-error",
    "invalid",
    "incompatible",
    "not-effective",
    "expired",
    "retired",
    "unapproved",
    "integrity-failed",
    "signature-invalid",
  ])("keeps %s content out of the presentation layer", async (status) => {
    const screen = await render(
      <AppProviders protocolRepository={rejectedRepository(status)}>
        <GuidesScreen onOpenGuide={jest.fn()} />
      </AppProviders>,
    );

    expect(await screen.findByTestId(`protocol-status-${status}`)).toBeTruthy();
    expect(screen.queryByText(syntheticTitle)).toBeNull();
    expect(screen.queryByText(syntheticStep)).toBeNull();
  });
});
