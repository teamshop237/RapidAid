import type { Protocol, ProtocolPackage } from "@rapidaid/protocol-engine/authoring";

export type WorkflowRole = "content-editor" | "clinical-reviewer" | "release-manager" | "administrator";
export type ActorKind = "human" | "service" | "ai-agent";

export type AuthenticatedActor = Readonly<{
  actorId: string;
  displayName: string;
  kind: ActorKind;
  role: WorkflowRole;
  authenticated: boolean;
  credentialReference?: string;
}>;

export type WorkflowState =
  | "draft"
  | "in-clinical-review"
  | "clinically-reviewed"
  | "clinically-approved"
  | "technically-validated"
  | "release-approved";

export type EditableProtocolContent = Pick<
  Protocol,
  "schemaVersion" | "title" | "summary" | "effectiveAt" | "reviewDueAt" | "expiresAt" | "provenance" | "sections"
>;

export type ProtocolVersionRecord = Readonly<{
  protocolId: string;
  contentVersion: string;
  state: WorkflowState;
  content: EditableProtocolContent;
  clinicalReviews: Protocol["clinicalReviews"];
  clinicalApproval?: Protocol["clinicalApproval"];
  technicalValidation?: Protocol["technicalValidation"];
  releaseApproval?: Protocol["releaseApproval"];
  contentChecksum: string;
  createdAt: string;
  updatedAt: string;
}>;

export type ProtocolAggregate = Readonly<{
  protocolId: string;
  currentVersion: string;
  revision: number;
  versions: readonly ProtocolVersionRecord[];
}>;

export type AuditAction =
  | "protocol.created"
  | "protocol.edited"
  | "version.created"
  | "clinical-review.requested"
  | "clinical-review.completed"
  | "clinical-review.changes-requested"
  | "clinical-approval.granted"
  | "technical-validation.passed"
  | "release-approval.granted"
  | "package-candidate.generated";

export type AuditEvent = Readonly<{
  eventId: string;
  actorId: string;
  actorDisplayName: string;
  actorKind: ActorKind;
  role: WorkflowRole;
  action: AuditAction;
  protocolId: string;
  contentVersion: string;
  contentChecksum?: string;
  timestamp: string;
  metadata?: Readonly<Record<string, string>>;
}>;

export type PackageCandidate = Readonly<{
  protocolPackage: ProtocolPackage;
  generatedAt: string;
  generatedBy: string;
}>;

export interface ContentWorkflowStore {
  listProtocols(): readonly ProtocolAggregate[];
  getProtocol(protocolId: string): ProtocolAggregate | null;
  commitProtocol(expectedRevision: number | null, aggregate: ProtocolAggregate, event: AuditEvent): void;
  appendAudit(event: AuditEvent): void;
  listAudit(protocolId?: string): readonly AuditEvent[];
}

export type WorkflowErrorCode =
  | "unauthenticated"
  | "human-required"
  | "forbidden"
  | "not-found"
  | "version-not-current"
  | "invalid-transition"
  | "invalid-content"
  | "stale-checksum"
  | "revision-conflict"
  | "not-production-ready";

export class WorkflowError extends Error {
  readonly code: WorkflowErrorCode;

  constructor(code: WorkflowErrorCode, message: string) {
    super(message);
    this.name = "WorkflowError";
    this.code = code;
  }
}
