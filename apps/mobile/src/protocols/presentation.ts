import type { Protocol } from "@rapidaid/protocol-engine";

import type { Language } from "@/localization/translations";

export type LocalizedPresentationText = Record<Language, string>;

export type PresentationStepVisual = Readonly<{
  type: "storyboard-placeholder";
  asset: string;
  loop: boolean;
  accessibilityLabel: LocalizedPresentationText;
  reviewStatus: "requires-clinical-visual-review";
}>;

export type PresentationSource = {
  id: string;
  title: string;
  organization: string;
  locator: string;
  language: Language;
  verifiedAt?: string;
  attribution?: string;
  adaptation?: LocalizedPresentationText;
  endorsementDisclaimer?: LocalizedPresentationText;
};

export type PresentationGuide = {
  id: string;
  contentVersion: string;
  title: LocalizedPresentationText;
  summary: LocalizedPresentationText;
  emergencyServiceId?: "service.cm.samu.119";
  sources: readonly PresentationSource[];
  sections: readonly {
    id: string;
    heading: LocalizedPresentationText;
    steps: readonly {
      id: string;
      text: LocalizedPresentationText;
      accessibilityLabel?: LocalizedPresentationText;
      visual?: PresentationStepVisual;
    }[];
  }[];
};

export function toPresentationGuide(protocol: Protocol): PresentationGuide {
  return {
    id: protocol.protocolId,
    contentVersion: protocol.contentVersion,
    title: protocol.title,
    summary: protocol.summary,
    sources: protocol.provenance.sources.map((source) => ({
      id: source.sourceId,
      title: source.title,
      organization: source.organization,
      locator: source.locator,
      language: source.language,
      verifiedAt: source.verifiedAt,
      attribution: source.license?.attribution,
      adaptation: source.adaptation?.description,
      endorsementDisclaimer: source.adaptation?.endorsementDisclaimer,
    })),
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
