import { Language } from "@/localization/translations";

export type LocalizedDemoText = Record<Language, string>;

export type DemoEmergencyService = {
  id: "general-demo" | "response-demo" | "rescue-demo";
  icon: "call-outline" | "medkit-outline" | "shield-outline";
  name: LocalizedDemoText;
  displayNumber: LocalizedDemoText;
  contentStatus: "demo-only";
};

export type DemoCareLocation = {
  id: "care-alpha" | "care-bravo" | "care-charlie";
  icon: "business-outline" | "medical-outline" | "home-outline";
  name: LocalizedDemoText;
  area: LocalizedDemoText;
  distance: LocalizedDemoText;
  contentStatus: "demo-only";
};

export const demoEmergencyServices: readonly DemoEmergencyService[] = [
  {
    id: "general-demo",
    icon: "call-outline",
    name: { en: "Emergency service — DEMO", fr: "Service d’urgence — DÉMO" },
    displayNumber: { en: "DEMO — NOT A NUMBER", fr: "DÉMO — PAS UN NUMÉRO" },
    contentStatus: "demo-only",
  },
  {
    id: "response-demo",
    icon: "medkit-outline",
    name: { en: "Response service — DEMO", fr: "Service d’intervention — DÉMO" },
    displayNumber: { en: "DEMO — NOT A NUMBER", fr: "DÉMO — PAS UN NUMÉRO" },
    contentStatus: "demo-only",
  },
  {
    id: "rescue-demo",
    icon: "shield-outline",
    name: { en: "Rescue service — DEMO", fr: "Service de secours — DÉMO" },
    displayNumber: { en: "DEMO — NOT A NUMBER", fr: "DÉMO — PAS UN NUMÉRO" },
    contentStatus: "demo-only",
  },
];

export const demoCareLocations: readonly DemoCareLocation[] = [
  {
    id: "care-alpha",
    icon: "business-outline",
    name: { en: "Demo Care Point Alpha", fr: "Centre de soins fictif Alpha" },
    area: { en: "Mock area — no real address", fr: "Zone fictive — aucune adresse réelle" },
    distance: { en: "Mock distance", fr: "Distance fictive" },
    contentStatus: "demo-only",
  },
  {
    id: "care-bravo",
    icon: "medical-outline",
    name: { en: "Demo Care Point Bravo", fr: "Centre de soins fictif Bravo" },
    area: { en: "Mock area — no real address", fr: "Zone fictive — aucune adresse réelle" },
    distance: { en: "Mock distance", fr: "Distance fictive" },
    contentStatus: "demo-only",
  },
  {
    id: "care-charlie",
    icon: "home-outline",
    name: { en: "Demo Care Point Charlie", fr: "Centre de soins fictif Charlie" },
    area: { en: "Mock area — no real address", fr: "Zone fictive — aucune adresse réelle" },
    distance: { en: "Mock distance", fr: "Distance fictive" },
    contentStatus: "demo-only",
  },
];

export function localizeDemoText(text: LocalizedDemoText, language: Language): string {
  return text[language];
}
