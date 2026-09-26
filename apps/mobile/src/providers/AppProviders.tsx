import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import type { OfflineProtocolRepository } from "@rapidaid/protocol-engine";

import { Language, TranslationKey, translate } from "@/localization/translations";
import { ProtocolContentProvider } from "@/providers/ProtocolContentProvider";
import { AppColors, darkColors, lightColors } from "@/theme/tokens";

type AppSettings = {
  language: Language;
  setLanguage: (language: Language) => void;
  isDarkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  colors: AppColors;
  t: (key: TranslationKey) => string;
};

const AppSettingsContext = createContext<AppSettings | null>(null);

type AppProvidersProps = PropsWithChildren<{
  protocolRepository?: OfflineProtocolRepository;
}>;

export function AppProviders({ children, protocolRepository }: AppProvidersProps) {
  const [language, setLanguage] = useState<Language>("en");
  const [isDarkMode, setDarkMode] = useState(false);

  const value = useMemo<AppSettings>(() => ({
    language,
    setLanguage,
    isDarkMode,
    setDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    t: (key) => translate(language, key),
  }), [isDarkMode, language]);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppSettingsContext.Provider value={value}>
        <ProtocolContentProvider repository={protocolRepository}>
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
