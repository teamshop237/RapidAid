import { describe, expect, it } from "vitest";
import { protocolSchema } from "@rapidaid/protocol-engine/authoring";

import {
  ContentWorkflowService,
  InMemoryContentWorkflowStore,
  ODERSA_ATTRIBUTION,
  ODERSA_MVP_DRAFTS,
  WorkflowError,
} from "../src/index";
import { syntheticActors } from "../src/testing";

const expectedSourceIds = [
  "l-arret-cardiaque",
  "l-etouffement-d-un-adulte",
  "l-hemorragie-grave-et-le-garrot",
  "la-brulure-de-cuisine",
  "l-avc-en-60-secondes",
  "la-crise-convulsive",
];

describe("ODERSA MVP source import", () => {
  it("imports exactly the selected official bilingual records with complete provenance", () => {
    expect(ODERSA_MVP_DRAFTS.map((draft) => draft.sourceRecordId)).toEqual(expectedSourceIds);
    for (const draft of ODERSA_MVP_DRAFTS) {
      expect(draft.translationStatus).toBe("official-odersa-bilingual");
      expect(draft.attribution).toBe(ODERSA_ATTRIBUTION);
      expect(draft.originalTitle.en).toBeTruthy();
      expect(draft.originalTitle.fr).toBeTruthy();
      expect(draft.contentVersion).toBe("1.0.0");
      expect(draft.content.sections[0]?.steps.length).toBeGreaterThan(0);
      expect(protocolSchema.safeParse({
        ...draft.content,
        protocolId: draft.protocolId,
        contentVersion: draft.contentVersion,
        publicationState: "draft",
        clinicalReviews: [],
      }).success).toBe(true);
      for (const step of draft.content.sections[0]?.steps ?? []) {
        expect(step.text.en.trim()).not.toBe("");
        expect(step.text.fr.trim()).not.toBe("");
      }
      const odersaSources = draft.content.provenance.sources.filter((source) => source.organization === "ODERSA");
      expect(odersaSources).toHaveLength(2);
      expect(odersaSources.map((source) => source.language).sort()).toEqual(["en", "fr"]);
      for (const source of odersaSources) {
        expect(source.sourceRecordId).toBe(draft.sourceRecordId);
        expect(source.verifiedAt).toBe("2026-08-23T00:00:00.000Z");
        expect(source.license?.identifier).toBe("CC-BY-4.0");
        expect(source.license?.attribution).toBe(ODERSA_ATTRIBUTION);
        expect(source.adaptation?.status).toBe("adapted");
        expect(source.adaptation?.endorsementDisclaimer.en).toContain("does not endorse");
      }
      expect(draft.content.provenance.sources.length).toBeGreaterThan(2);
    }
  });

  it("adapts only emergency-contact phrases to SAMU 119", () => {
    const content = ODERSA_MVP_DRAFTS.flatMap((draft) => draft.content.sections)
      .flatMap((section) => section.steps)
      .flatMap((step) => [step.text.en, step.text.fr])
      .join("\n");
    expect(content).toContain("SAMU 119");
    expect(content).not.toMatch(/\b(?:call|tell) (?:15|18|112|114)\b/i);
    expect(content).not.toMatch(/\b(?:appelle|appeler|au|le) (?:15|18|112|114)\b/i);
    expect(content).toContain("between 15 and 25 degrees");
    expect(content).toContain("entre 15 et 25 degrés");
  });

  it("keeps every imported protocol in draft and rejects package generation", () => {
    const service = new ContentWorkflowService(new InMemoryContentWorkflowStore(), {
      clock: () => new Date("2026-09-26T00:00:00.000Z"),
    });
    for (const draft of ODERSA_MVP_DRAFTS) {
      const aggregate = service.createDraft(syntheticActors.editor, draft.protocolId, draft.content);
      expect(aggregate.versions[0]?.state).toBe("draft");
      expect(() => service.generateUnsignedPackageCandidate(
        syntheticActors.releaseManager,
        draft.protocolId,
        aggregate.currentVersion,
      )).toThrowError(WorkflowError);
    }
  });
});
