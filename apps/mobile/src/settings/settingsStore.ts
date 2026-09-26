import { Directory, File, Paths } from "expo-file-system";

import type { Language } from "@/localization/translations";

export type PersistedAppSettings = Readonly<{
  schemaVersion: 1;
  language: Language;
  isDarkMode: boolean;
  onboardingCompleted: boolean;
}>;

export interface AppSettingsStore {
  load(): Promise<PersistedAppSettings | null>;
  save(settings: PersistedAppSettings): Promise<void>;
}

function parseSettings(value: unknown): PersistedAppSettings | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.schemaVersion !== 1) return null;
  if (record.language !== "en" && record.language !== "fr") return null;
  if (typeof record.isDarkMode !== "boolean" || typeof record.onboardingCompleted !== "boolean") return null;
  return {
    schemaVersion: 1,
    language: record.language,
    isDarkMode: record.isDarkMode,
    onboardingCompleted: record.onboardingCompleted,
  };
}

export class InMemoryAppSettingsStore implements AppSettingsStore {
  #settings: PersistedAppSettings | null;

  constructor(initial: PersistedAppSettings | null = null) {
    this.#settings = initial;
  }

  async load(): Promise<PersistedAppSettings | null> {
    return this.#settings ? structuredClone(this.#settings) : null;
  }

  async save(settings: PersistedAppSettings): Promise<void> {
    this.#settings = structuredClone(settings);
  }
}

export class ExpoAppSettingsStore implements AppSettingsStore {
  readonly #directory = new Directory(Paths.document, "rapidaid", "settings");
  readonly #file = new File(this.#directory, "preferences.json");

  async load(): Promise<PersistedAppSettings | null> {
    try {
      if (!this.#file.exists) return null;
      return parseSettings(JSON.parse(await this.#file.text()));
    } catch {
      return null;
    }
  }

  async save(settings: PersistedAppSettings): Promise<void> {
    this.#directory.create({ idempotent: true, intermediates: true });
    const temporary = new File(this.#directory, "preferences.tmp");
    if (temporary.exists) temporary.delete();
    temporary.create();
    temporary.write(JSON.stringify(settings));
    await temporary.move(this.#file, { overwrite: true });
  }
}

export const expoAppSettingsStore = new ExpoAppSettingsStore();
