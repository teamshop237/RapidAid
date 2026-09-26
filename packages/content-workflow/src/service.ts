import {
  SUPPORTED_PROTOCOL_SCHEMA_VERSION,
  canonicalizePackagePayload,
  canonicalizeProtocolContent,
  computeSha256Checksum,
  parseSemanticVersion,
  protocolPackageSchema,
  protocolSchema,
  stableIdSchema,
  validateProtocolForProduction,
  type Protocol,
  type ProtocolPackage,
} from "@rapidaid/protocol-engine/authoring";

import type {
  AuditAction,
  AuditEvent,
  AuthenticatedActor,
  ContentWorkflowStore,
  EditableProtocolContent,
  PackageCandidate,
  ProtocolAggregate,
  ProtocolVersionRecord,
  WorkflowRole,
  WorkflowState,
} from "./types";
import { WorkflowError } from "./types";

type ServiceOptions = {
  clock?: () => Date;
  idFactory?: (kind: string) => string;
};

type ClinicalReviewDecision = "reviewed" | "changes-requested";

const allowedTransitions: Readonly<Record<WorkflowState, readonly WorkflowState[]>> = {
  draft: ["in-clinical-review"],
  "in-clinical-review": ["clinically-reviewed", "draft"],
  "clinically-reviewed": ["clinically-approved", "draft"],
  "clinically-approved": ["technically-validated", "draft"],
  "technically-validated": ["release-approved", "draft"],
  "release-approved": ["draft"],
};

let generatedId = 0;

function defaultIdFactory(kind: string): string {
  generatedId += 1;
  return `${kind}.${Date.now()}.${generatedId}`;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function publicationStateFor(state: WorkflowState): Protocol["publicationState"] {
  if (state === "release-approved") return "approved";
  if (["clinically-reviewed", "clinically-approved", "technically-validated"].includes(state)) return "reviewed";
  return "draft";
}

function toProtocol(version: ProtocolVersionRecord): Protocol {
  return {
    protocolId: version.protocolId,
    contentVersion: version.contentVersion,
    publicationState: publicationStateFor(version.state),
    ...clone(version.content),
    clinicalReviews: clone(version.clinicalReviews),
    ...(version.clinicalApproval ? { clinicalApproval: clone(version.clinicalApproval) } : {}),
    ...(version.technicalValidation ? { technicalValidation: clone(version.technicalValidation) } : {}),
    ...(version.releaseApproval ? { releaseApproval: clone(version.releaseApproval) } : {}),
  };
}

function contentChecksum(protocolId: string, contentVersion: string, content: EditableProtocolContent): string {
  const protocol = {
    protocolId,
    contentVersion,
    publicationState: "draft" as const,
    ...clone(content),
    clinicalReviews: [],
  } as Protocol;
  return computeSha256Checksum(canonicalizeProtocolContent(protocol));
}

function nextPatchVersion(version: string): string {
  const parsed = parseSemanticVersion(version);
  if (!parsed) throw new WorkflowError("invalid-content", "Current content version is invalid.");
  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
}

export class ContentWorkflowService {
  readonly #store: ContentWorkflowStore;
  readonly #clock: () => Date;
  readonly #idFactory: (kind: string) => string;

  constructor(store: ContentWorkflowStore, options: ServiceOptions = {}) {
    this.#store = store;
    this.#clock = options.clock ?? (() => new Date());
    this.#idFactory = options.idFactory ?? defaultIdFactory;
  }

  listProtocols(): readonly ProtocolAggregate[] {
    return this.#store.listProtocols();
  }

  getProtocol(protocolId: string): ProtocolAggregate | null {
    return this.#store.getProtocol(protocolId);
  }

  listAudit(protocolId?: string): readonly AuditEvent[] {
    return this.#store.listAudit(protocolId);
  }

  createDraft(actor: AuthenticatedActor, protocolId: string, content: EditableProtocolContent): ProtocolAggregate {
    this.#requireHumanRole(actor, "content-editor");
    if (!stableIdSchema.safeParse(protocolId).success) throw new WorkflowError("invalid-content", "Protocol ID is invalid.");
    if (this.#store.getProtocol(protocolId)) throw new WorkflowError("invalid-content", "Protocol already exists.");

    const timestamp = this.#now();
    const contentVersion = "1.0.0";
    const version: ProtocolVersionRecord = {
      protocolId,
      contentVersion,
      state: "draft",
      content: clone(content),
      clinicalReviews: [],
      contentChecksum: contentChecksum(protocolId, contentVersion, content),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const aggregate: ProtocolAggregate = {
      protocolId,
      currentVersion: contentVersion,
      revision: 1,
      versions: [version],
    };
    this.#store.commitProtocol(null, aggregate, this.#audit(actor, "protocol.created", version));
    return aggregate;
  }

  editContent(
    actor: AuthenticatedActor,
    protocolId: string,
    contentVersion: string,
    replacementContent: EditableProtocolContent,
  ): ProtocolAggregate {
    this.#requireHumanRole(actor, "content-editor");
    const aggregate = this.#requireAggregate(protocolId);
    const current = this.#requireCurrentVersion(aggregate, contentVersion);
    const timestamp = this.#now();

    let nextVersion: ProtocolVersionRecord;
    let action: AuditAction;
    if (current.state === "draft") {
      nextVersion = {
        ...current,
        content: clone(replacementContent),
        clinicalReviews: [],
        clinicalApproval: undefined,
        technicalValidation: undefined,
        releaseApproval: undefined,
        contentChecksum: contentChecksum(protocolId, contentVersion, replacementContent),
        updatedAt: timestamp,
      };
      action = "protocol.edited";
    } else {
      const newContentVersion = nextPatchVersion(current.contentVersion);
      nextVersion = {
        protocolId,
        contentVersion: newContentVersion,
        state: "draft",
        content: clone(replacementContent),
        clinicalReviews: [],
        contentChecksum: contentChecksum(protocolId, newContentVersion, replacementContent),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      action = "version.created";
    }

    const versions = current.state === "draft"
      ? aggregate.versions.map((version) => version.contentVersion === current.contentVersion ? nextVersion : version)
      : [...aggregate.versions, nextVersion];
    const next = { ...aggregate, currentVersion: nextVersion.contentVersion, revision: aggregate.revision + 1, versions };
    this.#store.commitProtocol(aggregate.revision, next, this.#audit(actor, action, nextVersion));
    return next;
  }

  submitForClinicalReview(actor: AuthenticatedActor, protocolId: string, version: string): ProtocolAggregate {
    this.#requireHumanRole(actor, "content-editor");
    return this.#transition(actor, protocolId, version, "draft", "in-clinical-review", "clinical-review.requested", (current) => {
      this.#requireContentIntegrity(current);
      const parsed = protocolSchema.safeParse(toProtocol(current));
      if (!parsed.success) {
        throw new WorkflowError("invalid-content", parsed.error.issues.map((issue) => issue.message).join(" "));
      }
      return current;
    });
  }

  recordClinicalReview(
    actor: AuthenticatedActor,
    protocolId: string,
    version: string,
    decision: ClinicalReviewDecision,
  ): ProtocolAggregate {
    this.#requireHumanRole(actor, "clinical-reviewer");
    const nextState = decision === "reviewed" ? "clinically-reviewed" : "draft";
    const action = decision === "reviewed" ? "clinical-review.completed" : "clinical-review.changes-requested";
    return this.#transition(actor, protocolId, version, "in-clinical-review", nextState, action, (current) => {
      this.#requireContentIntegrity(current);
      return {
        ...current,
        clinicalReviews: [...current.clinicalReviews, {
          reviewId: this.#idFactory("review"),
          protocolId,
          contentVersion: version,
          contentChecksum: current.contentChecksum,
          reviewerId: actor.actorId,
          reviewerDisplayName: actor.displayName,
          reviewerCredentialReference: actor.credentialReference ?? "SYNTHETIC-LOCAL-CREDENTIAL",
          authorityType: "qualified-clinician",
          reviewedByHuman: true,
          decision,
          reviewedAt: this.#now(),
        }],
      };
    });
  }

  grantClinicalApproval(
    actor: AuthenticatedActor,
    protocolId: string,
    version: string,
    expectedChecksum: string,
  ): ProtocolAggregate {
    this.#requireHumanRole(actor, "clinical-reviewer");
    return this.#transition(actor, protocolId, version, "clinically-reviewed", "clinically-approved", "clinical-approval.granted", (current) => {
      this.#requireContentIntegrity(current);
      this.#requireChecksum(current, expectedChecksum);
      if (!current.clinicalReviews.some((review) => review.decision === "reviewed" && review.contentChecksum === current.contentChecksum)) {
        throw new WorkflowError("invalid-transition", "A matching clinical review is required before approval.");
      }
      return {
        ...current,
        clinicalApproval: {
          approvalId: this.#idFactory("approval.clinical"),
          protocolId,
          contentVersion: version,
          contentChecksum: current.contentChecksum,
          approverId: actor.actorId,
          approverDisplayName: actor.displayName,
          approverCredentialReference: actor.credentialReference ?? "SYNTHETIC-LOCAL-CREDENTIAL",
          authorityType: "qualified-clinician",
          approvedByHuman: true,
          approvedAt: this.#now(),
        },
      };
    });
  }

  runTechnicalValidation(actor: AuthenticatedActor, protocolId: string, version: string): ProtocolAggregate {
    this.#requireHumanRole(actor, "administrator");
    return this.#transition(actor, protocolId, version, "clinically-approved", "technically-validated", "technical-validation.passed", (current) => {
      this.#requireContentIntegrity(current);
      if (current.clinicalApproval?.contentChecksum !== current.contentChecksum) {
        throw new WorkflowError("stale-checksum", "Clinical approval is not bound to current content.");
      }
      const parsed = protocolSchema.safeParse(toProtocol(current));
      if (!parsed.success) throw new WorkflowError("invalid-content", "Protocol failed technical schema validation.");
      return {
        ...current,
        technicalValidation: {
          validationId: this.#idFactory("validation.technical"),
          protocolId,
          contentVersion: version,
          contentChecksum: current.contentChecksum,
          status: "passed",
          validatorVersion: SUPPORTED_PROTOCOL_SCHEMA_VERSION,
          validatedAt: this.#now(),
        },
      };
    });
  }

  grantReleaseApproval(
    actor: AuthenticatedActor,
    protocolId: string,
    version: string,
    expectedChecksum: string,
  ): ProtocolAggregate {
    this.#requireHumanRole(actor, "release-manager");
    return this.#transition(actor, protocolId, version, "technically-validated", "release-approved", "release-approval.granted", (current) => {
      this.#requireContentIntegrity(current);
      this.#requireChecksum(current, expectedChecksum);
      if (!current.clinicalApproval || !current.technicalValidation) {
        throw new WorkflowError("invalid-transition", "Clinical approval and technical validation are required.");
      }
      const next = {
        ...current,
        releaseApproval: {
          releaseApprovalId: this.#idFactory("approval.release"),
          protocolId,
          contentVersion: version,
          contentChecksum: current.contentChecksum,
          releaseOwnerId: actor.actorId,
          authorityType: "human-release-authority" as const,
          approvedByHuman: true as const,
          approvedAt: this.#now(),
        },
      };
      const parsed = protocolSchema.safeParse({ ...toProtocol(next), publicationState: "approved" });
      if (!parsed.success) throw new WorkflowError("invalid-content", "Protocol failed release validation.");
      return next;
    });
  }

  generateUnsignedPackageCandidate(
    actor: AuthenticatedActor,
    protocolId: string,
    version: string,
  ): PackageCandidate {
    this.#requireHumanRole(actor, "release-manager");
    const aggregate = this.#requireAggregate(protocolId);
    const current = this.#requireCurrentVersion(aggregate, version);
    if (current.state !== "release-approved") {
      throw new WorkflowError("invalid-transition", "Every approval gate must pass before package generation.");
    }
    this.#requireContentIntegrity(current);
    const protocol = protocolSchema.parse({ ...toProtocol(current), publicationState: "approved" });
    const readiness = validateProtocolForProduction(protocol, this.#clock());
    if (!readiness.ready) throw new WorkflowError("not-production-ready", "Protocol is not ready for a package candidate.");

    const createdAt = this.#now();
    const placeholderChecksum = `sha256:${"0".repeat(64)}`;
    const unsigned = protocolPackageSchema.parse({
      manifest: {
        packageId: protocolId.replace(/^protocol\./, "package."),
        schemaVersion: protocol.schemaVersion,
        packageVersion: protocol.contentVersion,
        releaseState: "draft",
        createdAt,
        effectiveAt: protocol.effectiveAt,
        reviewDueAt: protocol.reviewDueAt,
        ...(protocol.expiresAt ? { expiresAt: protocol.expiresAt } : {}),
        protocolIndex: [{ protocolId, contentVersion: version }],
        integrity: {
          algorithm: "sha256",
          canonicalization: "rapidaid-json-v1",
          checksum: placeholderChecksum,
        },
      },
      protocols: [protocol],
    });
    const protocolPackage: ProtocolPackage = protocolPackageSchema.parse({
      ...unsigned,
      manifest: {
        ...unsigned.manifest,
        integrity: {
          ...unsigned.manifest.integrity,
          checksum: computeSha256Checksum(canonicalizePackagePayload(unsigned)),
        },
      },
    });
    this.#store.appendAudit(this.#audit(actor, "package-candidate.generated", current, {
      packageId: protocolPackage.manifest.packageId,
      packageChecksum: protocolPackage.manifest.integrity.checksum,
    }));
    return { protocolPackage, generatedAt: createdAt, generatedBy: actor.actorId };
  }

  #transition(
    actor: AuthenticatedActor,
    protocolId: string,
    version: string,
    expectedState: WorkflowState,
    nextState: WorkflowState,
    action: AuditAction,
    mutate: (current: ProtocolVersionRecord) => ProtocolVersionRecord,
  ): ProtocolAggregate {
    if (!allowedTransitions[expectedState].includes(nextState)) {
      throw new WorkflowError("invalid-transition", `Transition ${expectedState} → ${nextState} is not permitted.`);
    }
    const aggregate = this.#requireAggregate(protocolId);
    const current = this.#requireCurrentVersion(aggregate, version);
    if (current.state !== expectedState) {
      throw new WorkflowError("invalid-transition", `Expected ${expectedState}; found ${current.state}.`);
    }
    const mutated = mutate(current);
    const nextVersion = { ...mutated, state: nextState, updatedAt: this.#now() };
    const next = {
      ...aggregate,
      revision: aggregate.revision + 1,
      versions: aggregate.versions.map((candidate) => candidate.contentVersion === version ? nextVersion : candidate),
    };
    this.#store.commitProtocol(aggregate.revision, next, this.#audit(actor, action, nextVersion));
    return next;
  }

  #requireHumanRole(actor: AuthenticatedActor, role: WorkflowRole): void {
    if (!actor.authenticated) throw new WorkflowError("unauthenticated", "An authenticated actor is required.");
    if (actor.kind !== "human") throw new WorkflowError("human-required", "This action requires an authenticated human.");
    if (actor.role !== role) throw new WorkflowError("forbidden", `${role} authority is required.`);
  }

  #requireAggregate(protocolId: string): ProtocolAggregate {
    const aggregate = this.#store.getProtocol(protocolId);
    if (!aggregate) throw new WorkflowError("not-found", "Protocol was not found.");
    return aggregate;
  }

  #requireCurrentVersion(aggregate: ProtocolAggregate, version: string): ProtocolVersionRecord {
    if (aggregate.currentVersion !== version) {
      throw new WorkflowError("version-not-current", "Only the current protocol version can advance.");
    }
    const current = aggregate.versions.find((candidate) => candidate.contentVersion === version);
    if (!current) throw new WorkflowError("not-found", "Protocol version was not found.");
    return current;
  }

  #requireChecksum(version: ProtocolVersionRecord, expectedChecksum: string): void {
    if (version.contentChecksum !== expectedChecksum) {
      throw new WorkflowError("stale-checksum", "Approval checksum does not match the current content.");
    }
  }

  #requireContentIntegrity(version: ProtocolVersionRecord): void {
    const actualChecksum = contentChecksum(version.protocolId, version.contentVersion, version.content);
    if (actualChecksum !== version.contentChecksum) {
      throw new WorkflowError("stale-checksum", "Stored content no longer matches its bound checksum.");
    }
  }

  #audit(
    actor: AuthenticatedActor,
    action: AuditAction,
    version: ProtocolVersionRecord,
    metadata?: Readonly<Record<string, string>>,
  ): AuditEvent {
    return {
      eventId: this.#idFactory("audit"),
      actorId: actor.actorId,
      actorDisplayName: actor.displayName,
      actorKind: actor.kind,
      role: actor.role,
      action,
      protocolId: version.protocolId,
      contentVersion: version.contentVersion,
      contentChecksum: version.contentChecksum,
      timestamp: this.#now(),
      ...(metadata ? { metadata } : {}),
    };
  }

  #now(): string {
    return this.#clock().toISOString();
  }
}
