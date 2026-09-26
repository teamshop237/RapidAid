import { InMemoryAppSettingsStore } from "@/settings/settingsStore";

describe("local MVP settings", () => {
  it("persists account-free onboarding, language, and appearance preferences", async () => {
    const store = new InMemoryAppSettingsStore();
    expect(await store.load()).toBeNull();

    await store.save({
      schemaVersion: 1,
      language: "fr",
      isDarkMode: true,
      onboardingCompleted: true,
    });

    await expect(store.load()).resolves.toEqual({
      schemaVersion: 1,
      language: "fr",
      isDarkMode: true,
      onboardingCompleted: true,
    });
  });
});
