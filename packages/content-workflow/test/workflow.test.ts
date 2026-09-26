import { protocolPackageSchema } from "@rapidaid/protocol-engine/authoring";
import { describe, expect, it } from "vitest";

import { ContentWorkflowService, InMemoryContentWorkflowStore, WorkflowError } from "../src/index";
import { makeSyntheticDraftContent, syntheticActors } from "../src/testing";

const protocolId = "protocol.synthetic.workflow.alpha";

function createHarness() {
  const store = new InMemoryContentWorkflowStore();
  let minute = 0;
  let id = 0;
  const service = new ContentWorkflowService(store, {
    clock: () => new Date(Date.UTC(2027, 0, 1, 0, minute++)),
    idFactory: (kind) => `${kind}.synthetic.${++id}`,
  });
  const aggregate = service.createDraft(syntheticActors.editor, protocolId, makeSyntheticDraftContent());
  return { service, store, aggregate };
}

function current(service: ContentWorkflowService) {
  const aggregate = service.getProtocol(protocolId)!;
  return aggregate.versions.find((version) => version.contentVersion === aggregate.currentVersion)!;
}

function advanceToReviewed(service: ContentWorkflowService): void {
  service.submitForClinicalReview(syntheticActors.editor, protocolId, current(service).contentVersion);
  service.recordClinicalReview(syntheticActors.reviewer, protocolId, current(service).contentVersion, "reviewed");
}

function advanceToReleaseApproved(service: ContentWorkflowService): void {
  advanceToReviewed(service);
  service.grantClinicalApproval(
    syntheticActors.reviewer,
    protocolId,
    current(service).contentVersion,
    current(service).contentChecksum,
  );
  service.runTechnicalValidation(syntheticActors.administrator, protocolId, current(service).contentVersion);
  service.grantReleaseApproval(
    syntheticActors.releaseManager,
    protocolId,
    current(service).contentVersion,
    current(service).contentChecksum,
  );
}

describe("admin medical-content workflow", () => {
  it("executes every gate and emits a compatible unsigned package candidate", () => {
    const { service } = createHarness();
    advanceToReleaseApproved(service);

    const candidate = service.generateUnsignedPackageCandidate(
      syntheticActors.releaseManager,
      protocolId,
      current(service).contentVersion,
    );

    expect(protocolPackageSchema.safeParse(candidate.protocolPackage).success).toBe(true);
    expect(candidate.protocolPackage.manifest.releaseState).toBe("draft");
    expect(candidate.protocolPackage.manifest.signature).toBeUndefined();
    expect(candidate.protocolPackage.manifest.releaseApproval).toBeUndefined();
    expect(candidate.protocolPackage.protocols[0]?.publicationState).toBe("approved");
    expect(service.listAudit(protocolId).map((event) => event.action)).toEqual([
      "protocol.created",
      "clinical-review.requested",
      "clinical-review.completed",
      "clinical-approval.granted",
      "technical-validation.passed",
      "release-approval.granted",
      "package-candidate.generated",
    ]);
  });

  it("rejects an editor attempting clinical approval", () => {
    const { service } = createHarness();
    advanceToReviewed(service);
    expect(() => service.grantClinicalApproval(
      syntheticActors.editor,
      protocolId,
      current(service).contentVersion,
      current(service).contentChecksum,
    )).toThrowError(expect.objectContaining({ code: "forbidden" }));
  });

  it("rejects a reviewer attempting release approval", () => {
    const { service } = createHarness();
    advanceToReviewed(service);
    service.grantClinicalApproval(
      syntheticActors.reviewer,
      protocolId,
      current(service).contentVersion,
      current(service).contentChecksum,
    );
    service.runTechnicalValidation(syntheticActors.administrator, protocolId, current(service).contentVersion);

    expect(() => service.grantReleaseApproval(
      syntheticActors.reviewer,
      protocolId,
      current(service).contentVersion,
      current(service).contentChecksum,
    )).toThrowError(expect.objectContaining({ code: "forbidden" }));
  });

  it("rejects AI and service actors attempting human approvals", () => {
    const { service } = createHarness();
    advanceToReviewed(service);
    expect(() => service.grantClinicalApproval(
      syntheticActors.aiReviewer,
      protocolId,
      current(service).contentVersion,
      current(service).contentChecksum,
    )).toThrowError(expect.objectContaining({ code: "human-required" }));

    service.grantClinicalApproval(
      syntheticActors.reviewer,
      protocolId,
      current(service).contentVersion,
      current(service).contentChecksum,
    );
    service.runTechnicalValidation(syntheticActors.administrator, protocolId, current(service).contentVersion);
    expect(() => service.grantReleaseApproval(
      syntheticActors.serviceReleaseManager,
      protocolId,
      current(service).contentVersion,
      current(service).contentChecksum,
    )).toThrowError(expect.objectContaining({ code: "human-required" }));
  });

  it("rejects an unauthenticated human even when the claimed role is correct", () => {
    const { service } = createHarness();
    advanceToReviewed(service);
    const unauthenticatedReviewer = { ...syntheticActors.reviewer, authenticated: false };

    expect(() => service.grantClinicalApproval(
      unauthenticatedReviewer,
      protocolId,
      current(service).contentVersion,
      current(service).contentChecksum,
    )).toThrowError(expect.objectContaining({ code: "unauthenticated" }));
  });

  it("rejects skipped workflow stages and never treats technical validation as clinical approval", () => {
    const { service } = createHarness();
    expect(() => service.runTechnicalValidation(
      syntheticActors.administrator,
      protocolId,
      current(service).contentVersion,
    )).toThrowError(expect.objectContaining({ code: "invalid-transition" }));
    expect(() => service.grantReleaseApproval(
      syntheticActors.releaseManager,
      protocolId,
      current(service).contentVersion,
      current(service).contentChecksum,
    )).toThrowError(expect.objectContaining({ code: "invalid-transition" }));
  });

  it("creates a new unapproved version when approved content is edited", () => {
    const { service } = createHarness();
    advanceToReleaseApproved(service);
    const approved = current(service);
    const editedContent = makeSyntheticDraftContent();
    editedContent.summary.en = "SYNTHETIC EDIT — APPROVALS MUST NOT CARRY FORWARD.";

    const aggregate = service.editContent(
      syntheticActors.editor,
      protocolId,
      approved.contentVersion,
      editedContent,
    );
    const edited = current(service);

    expect(aggregate.versions).toHaveLength(2);
    expect(edited.contentVersion).toBe("1.0.1");
    expect(edited.state).toBe("draft");
    expect(edited.contentChecksum).not.toBe(approved.contentChecksum);
    expect(edited.clinicalReviews).toEqual([]);
    expect(edited.clinicalApproval).toBeUndefined();
    expect(edited.technicalValidation).toBeUndefined();
    expect(edited.releaseApproval).toBeUndefined();
  });

  it("rejects clinical and release approvals bound to a stale checksum", () => {
    const clinical = createHarness().service;
    advanceToReviewed(clinical);
    expect(() => clinical.grantClinicalApproval(
      syntheticActors.reviewer,
      protocolId,
      current(clinical).contentVersion,
      `sha256:${"f".repeat(64)}`,
    )).toThrowError(expect.objectContaining({ code: "stale-checksum" }));

    const release = createHarness().service;
    advanceToReviewed(release);
    release.grantClinicalApproval(
      syntheticActors.reviewer,
      protocolId,
      current(release).contentVersion,
      current(release).contentChecksum,
    );
    release.runTechnicalValidation(syntheticActors.administrator, protocolId, current(release).contentVersion);
    expect(() => release.grantReleaseApproval(
      syntheticActors.releaseManager,
      protocolId,
      current(release).contentVersion,
      `sha256:${"e".repeat(64)}`,
    )).toThrowError(expect.objectContaining({ code: "stale-checksum" }));
  });

  it("rejects incomplete bilingual content at the review boundary", () => {
    const { service } = createHarness();
    const incomplete = makeSyntheticDraftContent();
    incomplete.title.fr = "";
    service.editContent(syntheticActors.editor, protocolId, "1.0.0", incomplete);

    expect(() => service.submitForClinicalReview(
      syntheticActors.editor,
      protocolId,
      "1.0.0",
    )).toThrowError(expect.objectContaining({ code: "invalid-content" }));
  });

  it("rejects arbitrary or repeated state transitions", () => {
    const { service } = createHarness();
    service.submitForClinicalReview(syntheticActors.editor, protocolId, "1.0.0");
    expect(() => service.submitForClinicalReview(
      syntheticActors.editor,
      protocolId,
      "1.0.0",
    )).toThrowError(expect.objectContaining({ code: "invalid-transition" }));
    expect(() => service.grantClinicalApproval(
      syntheticActors.reviewer,
      protocolId,
      "1.0.0",
      current(service).contentChecksum,
    )).toThrowError(expect.objectContaining({ code: "invalid-transition" }));
  });

  it("returns immutable audit snapshots and never rewrites prior events", () => {
    const { service } = createHarness();
    const firstSnapshot = service.listAudit(protocolId);
    expect(Object.isFrozen(firstSnapshot)).toBe(true);
    expect(Object.isFrozen(firstSnapshot[0])).toBe(true);
    expect(() => {
      (firstSnapshot[0] as { action: string }).action = "release-approval.granted";
    }).toThrow(TypeError);

    service.submitForClinicalReview(syntheticActors.editor, protocolId, "1.0.0");
    expect(service.listAudit(protocolId)[0]?.action).toBe("protocol.created");
    expect(service.listAudit(protocolId)).toHaveLength(2);
  });

  it("rejects package generation before every gate passes", () => {
    const { service } = createHarness();
    expect(() => service.generateUnsignedPackageCandidate(
      syntheticActors.releaseManager,
      protocolId,
      "1.0.0",
    )).toThrowError(expect.objectContaining({ code: "invalid-transition" }));
  });

  it("reports workflow failures with stable machine-readable codes", () => {
    const error = new WorkflowError("forbidden", "Synthetic failure");
    expect(error).toMatchObject({ name: "WorkflowError", code: "forbidden" });
  });
});
