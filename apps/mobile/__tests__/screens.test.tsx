import { fireEvent, render } from "@testing-library/react-native";
import { Alert, Linking } from "react-native";

import { AppProviders } from "@/providers/AppProviders";
import { productionDirectory } from "@/directory/productionDirectory";
import type { DirectorySnapshot } from "@/directory/types";
import { EmergencyServicesScreen } from "@/screens/EmergencyServicesScreen";
import { AppInfoScreen } from "@/screens/AppInfoScreen";
import { GuideDetailScreen } from "@/screens/GuideDetailScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { NearbyScreen } from "@/screens/NearbyScreen";
import { createSyntheticTestProtocolRepository } from "../test-support/testProtocolRepository";

function renderWithProviders(element: React.ReactElement) {
  return render(
    <AppProviders protocolRepository={createSyntheticTestProtocolRepository()}>
      {element}
    </AppProviders>,
  );
}

const nonCallableSyntheticSamuSnapshot: DirectorySnapshot = {
  region: "Douala",
  datasetVersion: "synthetic-test-only",
  isSynthetic: true,
  emergencyServices: [{
    id: "service.cm.samu.119",
    dataOrigin: "synthetic-fixture",
    serviceName: { en: "SYNTHETIC SAMU — NOT REAL", fr: "SAMU SYNTHÉTIQUE — NON RÉEL" },
    officialServiceName: "SYNTHETIC medical service — NOT REAL",
    category: "medical",
    phoneNumber: null,
    address: null,
    geographicCoverage: { en: "SYNTHETIC coverage — NOT REAL", fr: "Couverture SYNTHÉTIQUE — NON RÉELLE" },
    verification: {
      status: "synthetic-only",
      source: {
        label: { en: "SYNTHETIC source", fr: "Source SYNTHÉTIQUE" },
        locator: "https://example.invalid/synthetic-samu",
      },
      verifiedAt: null,
      verifiedBy: null,
    },
  }],
  careFacilities: [],
};

describe("RapidAid MVP screens", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows the ODERSA attribution and independence notice", async () => {
    const screen = await renderWithProviders(<AppInfoScreen />);
    expect(screen.getByText("Avant les secours, ODERSA, avantlessecours.odersa.org, CC BY 4.0")).toBeTruthy();
    expect(screen.getByText("ODERSA does not endorse RapidAid or its adaptations.")).toBeTruthy();
  });

  it("keeps the emergency action prominent and delegates navigation", async () => {
    const onEmergency = jest.fn();
    const linkingSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    const screen = await renderWithProviders(
      <HomeScreen onEmergency={onEmergency} onGuides={jest.fn()} />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Emergency" }));

    expect(onEmergency).toHaveBeenCalledTimes(1);
    expect(linkingSpy).not.toHaveBeenCalled();
    expect(screen.getByText("You confirm every call in your phone dialer")).toBeTruthy();
    expect(screen.queryByText(/Content package/)).toBeNull();
  });

  it("changes the onboarding language without network or account setup", async () => {
    const screen = await renderWithProviders(<OnboardingScreen onContinue={jest.fn()} />);

    await fireEvent.press(screen.getByRole("radio", { name: "Français" }));

    expect(screen.getByRole("button", { name: "Continuer" })).toBeTruthy();
    expect(screen.getByText(/aucun compte requis/i)).toBeTruthy();
  });

  it("renders only validated synthetic repository content in guide detail", async () => {
    const screen = await renderWithProviders(
      <GuideDetailScreen guideId="protocol.synthetic.mobile.alpha" />,
    );

    expect(await screen.findByText("Synthetic guide Alpha — not medical guidance")).toBeTruthy();
    expect(screen.getByText("SYNTHETIC CONTENT SLOT ALPHA — DO NOT TAKE ACTION.")).toBeTruthy();
    expect(screen.getByText("Step 1 of 1")).toBeTruthy();
    expect(screen.getByText(/synthetic development data/i)).toBeTruthy();
  });

  it("renders non-dialable emergency controls", async () => {
    const screen = await renderWithProviders(
      <EmergencyServicesScreen onGuides={jest.fn()} snapshot={nonCallableSyntheticSamuSnapshot} />,
    );
    const callControls = screen.getAllByRole("button", { name: "Calling unavailable" });

    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(callControls).toHaveLength(1);
    for (const control of callControls) {
      expect(control.props.accessibilityState).toEqual({ disabled: true });
    }
    expect(screen.getByText("Number awaiting verification")).toBeTruthy();
  });

  it("uses the emergency screen itself as confirmation before opening the system dialer", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const linkingSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    const screen = await renderWithProviders(
      <EmergencyServicesScreen onGuides={jest.fn()} snapshot={productionDirectory} />,
    );

    expect(screen.getByText("SAMU / Medical Assistance")).toBeTruthy();
    expect(screen.getByText("119")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Open phone dialer" }));

    expect(alertSpy).not.toHaveBeenCalled();
    expect(linkingSpy).toHaveBeenCalledWith("tel:119");
  });

  it("shows the approved SAMU contact and confirmation in French", async () => {
    const screen = await renderWithProviders(
      <>
        <OnboardingScreen onContinue={jest.fn()} />
        <EmergencyServicesScreen onGuides={jest.fn()} snapshot={productionDirectory} />
      </>,
    );

    await fireEvent.press(screen.getByRole("radio", { name: "Français" }));

    expect(screen.getByText("SAMU / Aide médicale urgente")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ouvrir le composeur" })).toBeTruthy();
  });

  it("fails gracefully when verified directory data has not been supplied", async () => {
    const emptySnapshot: DirectorySnapshot = { ...productionDirectory, emergencyServices: [] };
    const screen = await renderWithProviders(
      <>
        <EmergencyServicesScreen onGuides={jest.fn()} snapshot={emptySnapshot} />
        <NearbyScreen snapshot={emptySnapshot} />
      </>,
    );

    expect(screen.getByTestId("emergency-directory-empty")).toBeTruthy();
    expect(screen.getByTestId("nearby-directory-empty")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Open phone dialer" })).toBeNull();
  });
});
