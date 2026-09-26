import { fireEvent, render } from "@testing-library/react-native";

import { AppProviders } from "@/providers/AppProviders";
import { EmergencyServicesScreen } from "@/screens/EmergencyServicesScreen";
import { GuideDetailScreen } from "@/screens/GuideDetailScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";

function renderWithProviders(element: React.ReactElement) {
  return render(<AppProviders>{element}</AppProviders>);
}

describe("prototype screens", () => {
  it("keeps the emergency action prominent and delegates navigation", async () => {
    const onEmergency = jest.fn();
    const screen = await renderWithProviders(
      <HomeScreen onEmergency={onEmergency} onGuides={jest.fn()} onNearby={jest.fn()} />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Emergency" }));

    expect(onEmergency).toHaveBeenCalledTimes(1);
    expect(screen.getByText("No call will be placed")).toBeTruthy();
  });

  it("changes the onboarding language without network or account setup", async () => {
    const screen = await renderWithProviders(<OnboardingScreen onContinue={jest.fn()} />);

    await fireEvent.press(screen.getByRole("radio", { name: "Français" }));

    expect(screen.getByRole("button", { name: "Continuer" })).toBeTruthy();
    expect(screen.getByText(/aucun conseil médical/i)).toBeTruthy();
  });

  it("renders only validated synthetic repository content in guide detail", async () => {
    const screen = await renderWithProviders(
      <GuideDetailScreen guideId="protocol.synthetic.mobile.alpha" />,
    );

    expect(await screen.findByText("Synthetic demonstration content — not medical guidance.")).toBeTruthy();
    expect(screen.getByText("SYNTHETIC CONTENT SLOT ALPHA — DO NOT TAKE ACTION.")).toBeTruthy();
    expect(screen.getByText("Repository-validated synthetic content")).toBeTruthy();
  });

  it("renders non-dialable emergency controls", async () => {
    const screen = await renderWithProviders(<EmergencyServicesScreen />);
    const callControls = screen.getAllByRole("button", { name: "Calling disabled in prototype" });

    expect(callControls).toHaveLength(3);
    for (const control of callControls) {
      expect(control.props.accessibilityState).toEqual({ disabled: true });
    }
    expect(screen.getAllByText("DEMO — NOT A NUMBER")).toHaveLength(3);
  });
});
