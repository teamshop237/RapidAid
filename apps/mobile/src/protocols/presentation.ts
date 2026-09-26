import type { Protocol } from "@rapidaid/protocol-engine";

import type { Language } from "@/localization/translations";

export type LocalizedPresentationText = Record<Language, string>;

export type PresentationGuide = {
  id: string;
  contentVersion: string;
  title: LocalizedPresentationText;
  summary: LocalizedPresentationText;
  sections: readonly {
    id: string;
    heading: LocalizedPresentationText;
    steps: readonly {
      id: string;
      text: LocalizedPresentationText;
      accessibilityLabel?: LocalizedPresentationText;
    }[];
  }[];
};

export function toPresentationGuide(protocol: Protocol): PresentationGuide {
  return {
    id: protocol.protocolId,
    contentVersion: protocol.contentVersion,
    title: protocol.title,
    summary: protocol.summary,
    sections: protocol.sections.map((section) => ({
      id: section.sectionId,
      heading: section.heading,
      steps: section.steps.map((step) => ({
        id: step.stepId,
        text: step.text,
        accessibilityLabel: step.accessibilityLabel,
      })),
    })),
  };
}

export function localizePresentationText(text: LocalizedPresentationText, language: Language): string {
  return text[language];
}
