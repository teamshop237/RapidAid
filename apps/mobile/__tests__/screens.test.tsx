import { fireEvent, render } from "@testing-library/react-native";
import { Alert, Linking } from "react-native";

import { AppProviders } from "@/providers/AppProviders";
import { productionDirectory } from "@/directory/productionDirectory";
import type { DirectorySnapshot } from "@/directory/types";
import { EmergencyServicesScreen } from "@/screens/EmergencyServicesScreen";
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

describe("RapidAid MVP screens", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps the emergency action prominent and delegates navigation", async () => {
    const onEmergency = jest.fn();
    const screen = await renderWithProviders(
      <HomeScreen onEmergency={onEmergency} onGuides={jest.fn()} />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Emergency" }));

    expect(onEmergency).toHaveBeenCalledTimes(1);
    expect(screen.getByText("You confirm every call in your phone dialer")).toBeTruthy();
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

    expect(await screen.findByText("Verified offline pipeline demonstration only")).toBeTruthy();
    expect(screen.getByText("SYNTHETIC CONTENT SLOT ALPHA — DO NOT TAKE ACTION.")).toBeTruthy();
    expect(screen.getByText("Validated for offline use")).toBeTruthy();
    expect(screen.getByText(/synthetic development data/i)).toBeTruthy();
  });

  it("renders non-dialable emergency controls", async () => {
    const screen = await renderWithProviders(<EmergencyServicesScreen onGuides={jest.fn()} />);
    await fireEvent.press(screen.getByRole("radio", { name: "Medical assistance / SAMU" }));
    const callControls = screen.getAllByRole("button", { name: "Calling unavailable" });

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(callControls).toHaveLength(1);
    for (const control of callControls) {
      expect(control.props.accessibilityState).toEqual({ disabled: true });
    }
    expect(screen.getByText("Number awaiting verification")).toBeTruthy();
  });

  it("requires explicit confirmation before handing a verified contact to the system dialer", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const linkingSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    const fixtureSnapshot: DirectorySnapshot = {
      region: "Douala",
      datasetVersion: "fixture-only",
      isSynthetic: false,
      emergencyServices: [{
        id: "service.fixture-only.alpha",
        dataOrigin: "production",
        serviceName: { en: "Fixture-only emergency service", fr: "Service d’urgence de test" },
        category: "medical",
        phoneNumber: "+000 000 000",
        address: null,
        geographicCoverage: { en: "Fixture-only area", fr: "Zone de test" },
        verification: {
          status: "verified",
          source: {
            label: { en: "Fixture-only source", fr: "Source de test" },
            locator: "https://authoritative-source.fixture/directory",
          },
          verifiedAt: "2026-09-26T12:00:00Z",
          verifiedBy: { actorId: "human.fixture", displayName: "Fixture Human Reviewer", actorType: "human" },
        },
      }],
      careFacilities: [],
    };
    const screen = await renderWithProviders(
      <EmergencyServicesScreen onGuides={jest.fn()} snapshot={fixtureSnapshot} />,
    );

    expect(screen.queryByRole("button", { name: "Confirm contact" })).toBeNull();
    await fireEvent.press(screen.getByRole("radio", { name: "Medical assistance / SAMU" }));
    await fireEvent.press(screen.getByRole("button", { name: "Confirm contact" }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Confirm emergency contact",
      expect.stringContaining("This does not mean the call connected or responders were dispatched."),
      expect.any(Array),
    );
    expect(linkingSpy).not.toHaveBeenCalled();

    const confirmationButtons = alertSpy.mock.calls[0]?.[2] ?? [];
    confirmationButtons.find((button) => button.text === "Open phone dialer")?.onPress?.();

    expect(linkingSpy).toHaveBeenCalledWith("tel:+000000000");
  });

  it("fails gracefully when verified directory data has not been supplied", async () => {
    const screen = await renderWithProviders(
      <>
        <EmergencyServicesScreen onGuides={jest.fn()} snapshot={productionDirectory} />
        <NearbyScreen snapshot={productionDirectory} />
      </>,
    );

    await fireEvent.press(screen.getByRole("radio", { name: "Medical assistance / SAMU" }));
    expect(screen.getByTestId("emergency-directory-empty")).toBeTruthy();
    expect(screen.getByTestId("nearby-directory-empty")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Confirm contact" })).toBeNull();
  });
});
