import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";

import HomeRoute from "../app/(tabs)/index";
import OnboardingRoute from "../app/index";
import { AppProviders } from "@/providers/AppProviders";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

const mockPush = router.push as jest.Mock;
const mockReplace = router.replace as jest.Mock;

function renderRoute(element: React.ReactElement) {
  return render(<AppProviders>{element}</AppProviders>);
}

describe("route adapters", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("enters the tab shell from onboarding", async () => {
    const screen = await renderRoute(<OnboardingRoute />);

    await fireEvent.press(screen.getByRole("button", { name: "Continue" }));

    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("opens emergency services from the primary home action", async () => {
    const screen = await renderRoute(<HomeRoute />);

    await fireEvent.press(screen.getByRole("button", { name: "Emergency" }));

    expect(mockPush).toHaveBeenCalledWith("/emergency-services");
  });

  it("opens guides and nearby from home", async () => {
    const screen = await renderRoute(<HomeRoute />);

    await fireEvent.press(screen.getByRole("button", { name: "First aid guides" }));
    await fireEvent.press(screen.getByRole("button", { name: "Nearby care" }));

    expect(mockPush).toHaveBeenNthCalledWith(1, "/guides");
    expect(mockPush).toHaveBeenNthCalledWith(2, "/nearby");
  });
});
