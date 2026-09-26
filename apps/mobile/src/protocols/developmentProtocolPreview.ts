import {
  ODERSA_MVP_DRAFTS,
  type OdersaImportedDraft,
} from "@rapidaid/content-workflow/odersa";

import type { DevelopmentProtocolPreview } from "@/providers/ProtocolContentProvider";
import type { PresentationGuide } from "@/protocols/presentation";

function toPreviewGuide(draft: OdersaImportedDraft): PresentationGuide {
  return {
    id: draft.protocolId,
    contentVersion: draft.contentVersion,
    title: draft.originalTitle,
    summary: draft.content.summary,
    emergencyServiceId: draft.emergencyServiceId,
    sources: draft.content.provenance.sources.map((source) => ({
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
    sections: draft.content.sections.map((section) => ({
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

// This source has no repository, signature, or approval semantics. The provider
// accepts it only when Expo's compile-time __DEV__ constant is true.
export const odersaDevelopmentProtocolPreview: DevelopmentProtocolPreview = Object.freeze({
  previewVersion: "odersa-mvp-1.0.0",
  guides: Object.freeze(ODERSA_MVP_DRAFTS.map(toPreviewGuide)),
});
