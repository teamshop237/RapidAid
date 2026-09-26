import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import type { OfflineProtocolRepository } from "@rapidaid/protocol-engine";

import { Language, TranslationKey, translate } from "@/localization/translations";
import {
  ProtocolContentProvider,
  type DevelopmentProtocolPreview,
} from "@/providers/ProtocolContentProvider";
import { AppSettingsStore, InMemoryAppSettingsStore } from "@/settings/settingsStore";
import { AppColors, darkColors, lightColors } from "@/theme/tokens";

type AppSettings = {
  language: Language;
  setLanguage: (language: Language) => void;
  isDarkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  colors: AppColors;
  t: (key: TranslationKey) => string;
  isHydrated: boolean;
  onboardingCompleted: boolean;
  completeOnboarding: () => void;
};

const AppSettingsContext = createContext<AppSettings | null>(null);

type AppProvidersProps = PropsWithChildren<{
  protocolRepository?: OfflineProtocolRepository;
  developmentProtocolPreview?: DevelopmentProtocolPreview;
  settingsStore?: AppSettingsStore;
}>;

export function AppProviders({ children, protocolRepository, developmentProtocolPreview, settingsStore }: AppProvidersProps) {
  const [localSettingsStore] = useState(() => new InMemoryAppSettingsStore());
  const activeSettingsStore = settingsStore ?? localSettingsStore;
  const [language, setLanguage] = useState<Language>("en");
  const [isDarkMode, setDarkMode] = useState(false);
  const [isHydrated, setHydrated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    activeSettingsStore.load().then((settings) => {
      if (!active) return;
      if (settings) {
        setLanguage(settings.language);
        setDarkMode(settings.isDarkMode);
        setOnboardingCompleted(settings.onboardingCompleted);
      }
      setHydrated(true);
    }).catch(() => {
      if (active) setHydrated(true);
    });
    return () => { active = false; };
  }, [activeSettingsStore]);

  useEffect(() => {
    if (!isHydrated) return;
    void activeSettingsStore.save({ schemaVersion: 1, language, isDarkMode, onboardingCompleted }).catch(() => undefined);
  }, [activeSettingsStore, isDarkMode, isHydrated, language, onboardingCompleted]);

  const value = useMemo<AppSettings>(() => ({
    language,
    setLanguage,
    isDarkMode,
    setDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    t: (key) => translate(language, key),
    isHydrated,
    onboardingCompleted,
    completeOnboarding: () => setOnboardingCompleted(true),
  }), [isDarkMode, isHydrated, language, onboardingCompleted]);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppSettingsContext.Provider value={value}>
        <ProtocolContentProvider
          developmentPreview={developmentProtocolPreview}
          repository={protocolRepository}
        >
          {children}
        </ProtocolContentProvider>
      </AppSettingsContext.Provider>
    </SafeAreaProvider>
  );
}

export function useAppSettings(): AppSettings {
  const value = useContext(AppSettingsContext);
  if (!value) {
    throw new Error("useAppSettings must be used inside AppProviders.");
  }
  return value;
}
