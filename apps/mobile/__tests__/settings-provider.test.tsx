import { render } from "@testing-library/react-native";

import { LanguageSelector } from "@/components/LanguageSelector";
import { AppProviders } from "@/providers/AppProviders";
import { InMemoryAppSettingsStore } from "@/settings/settingsStore";

describe("settings provider hydration", () => {
  it("restores the locally selected language without an account", async () => {
    const store = new InMemoryAppSettingsStore({
      schemaVersion: 1,
      language: "fr",
      isDarkMode: false,
      onboardingCompleted: true,
    });
    const screen = await render(
      <AppProviders settingsStore={store}>
        <LanguageSelector />
      </AppProviders>,
    );

    const french = await screen.findByRole("radio", { name: "Français" });
    expect(french.props.accessibilityState.selected).toBe(true);
  });
});
