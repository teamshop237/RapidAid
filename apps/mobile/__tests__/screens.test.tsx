import { fireEvent, render } from "@testing-library/react-native";

import { AppProviders } from "@/providers/AppProviders";
import { productionDirectory } from "@/directory/productionDirectory";
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
  it("keeps the emergency action prominent and delegates navigation", async () => {
    const onEmergency = jest.fn();
    const screen = await renderWithProviders(
      <HomeScreen onEmergency={onEmergency} onGuides={jest.fn()} onNearby={jest.fn()} />,
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
    const screen = await renderWithProviders(<EmergencyServicesScreen />);
    const callControls = screen.getAllByRole("button", { name: "Calling unavailable" });

    expect(callControls).toHaveLength(2);
    for (const control of callControls) {
      expect(control.props.accessibilityState).toEqual({ disabled: true });
    }
    expect(screen.getAllByText("Number awaiting verification")).toHaveLength(2);
  });

  it("fails gracefully when verified directory data has not been supplied", async () => {
    const screen = await renderWithProviders(
      <>
        <EmergencyServicesScreen snapshot={productionDirectory} />
        <NearbyScreen snapshot={productionDirectory} />
      </>,
    );

    expect(screen.getByTestId("emergency-directory-empty")).toBeTruthy();
    expect(screen.getByTestId("nearby-directory-empty")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Open phone dialer" })).toBeNull();
  });
});
