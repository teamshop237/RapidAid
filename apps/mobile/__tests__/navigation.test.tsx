import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";

import HomeRoute from "../app/(tabs)/index";
import EmergencyServicesRoute from "../app/emergency-services";
import OnboardingRoute from "../app/index";
import { AppProviders } from "@/providers/AppProviders";
import { createSyntheticTestProtocolRepository } from "../test-support/testProtocolRepository";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

const mockPush = router.push as jest.Mock;
const mockReplace = router.replace as jest.Mock;

function renderRoute(element: React.ReactElement) {
  return render(
    <AppProviders protocolRepository={createSyntheticTestProtocolRepository()}>
      {element}
    </AppProviders>,
  );
}

describe("route adapters", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("enters the tab shell from onboarding", async () => {
    const screen = await renderRoute(<OnboardingRoute />);

    await fireEvent.press(await screen.findByRole("button", { name: "Continue" }));

    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("opens emergency services from the primary home action", async () => {
    const screen = await renderRoute(<HomeRoute />);

    await fireEvent.press(screen.getByRole("button", { name: "Emergency" }));

    expect(mockPush).toHaveBeenCalledWith("/emergency-services");
  });

  it("opens guides from home without exposing nearby care", async () => {
    const screen = await renderRoute(<HomeRoute />);

    await fireEvent.press(screen.getByRole("button", { name: "First-aid guides" }));

    expect(mockPush).toHaveBeenCalledWith("/guides");
    expect(screen.queryByRole("button", { name: "Nearby emergency care" })).toBeNull();
  });

  it("keeps offline first-aid guides reachable from the emergency flow", async () => {
    const screen = await renderRoute(<EmergencyServicesRoute />);

    await fireEvent.press(screen.getByRole("button", { name: "Open first-aid guides" }));

    expect(mockPush).toHaveBeenCalledWith("/guides");
  });
});
