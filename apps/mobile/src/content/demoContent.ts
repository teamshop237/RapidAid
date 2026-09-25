import { Language } from "@/localization/translations";

export type LocalizedDemoText = Record<Language, string>;

export type DemoGuide = {
  id: "alpha" | "bravo" | "charlie";
  icon: "document-text-outline" | "layers-outline" | "list-outline";
  title: LocalizedDemoText;
  summary: LocalizedDemoText;
  contentStatus: "demo-only";
};

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

export const demoGuides: readonly DemoGuide[] = [
  {
    id: "alpha",
    icon: "document-text-outline",
    title: { en: "Demo guide Alpha", fr: "Guide de démonstration Alpha" },
    summary: { en: "Placeholder category for layout testing", fr: "Catégorie fictive pour tester la mise en page" },
    contentStatus: "demo-only",
  },
  {
    id: "bravo",
    icon: "layers-outline",
    title: { en: "Demo guide Bravo", fr: "Guide de démonstration Bravo" },
    summary: { en: "Placeholder category for navigation testing", fr: "Catégorie fictive pour tester la navigation" },
    contentStatus: "demo-only",
  },
  {
    id: "charlie",
    icon: "list-outline",
    title: { en: "Demo guide Charlie", fr: "Guide de démonstration Charlie" },
    summary: { en: "Placeholder category for readability testing", fr: "Catégorie fictive pour tester la lisibilité" },
    contentStatus: "demo-only",
  },
];

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

export function findDemoGuide(id: string): DemoGuide | undefined {
  return demoGuides.find((guide) => guide.id === id);
}
