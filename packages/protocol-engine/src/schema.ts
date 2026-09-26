import { z } from "zod";

const semanticVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const stableIdPattern = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const sha256Pattern = /^sha256:[a-f0-9]{64}$/;

export const localeSchema = z.enum(["en", "fr"]);
export const publicationStateSchema = z.enum(["draft", "reviewed", "approved", "retired"]);
export const semanticVersionSchema = z.string().regex(semanticVersionPattern, "Expected a stable semantic version.");
export const stableIdSchema = z.string().regex(stableIdPattern, "Expected a stable lowercase identifier.");
export const isoDateTimeSchema = z.string().datetime({ offset: true });

export const localizedTextSchema = z.object({
  en: z.string().trim().min(1),
  fr: z.string().trim().min(1),
}).strict();

export const sourceReferenceSchema = z.object({
  sourceId: stableIdSchema,
  sourceRecordId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1),
  organization: z.string().trim().min(1),
  locator: z.string().url(),
  language: localeSchema,
  jurisdiction: z.string().trim().min(1),
  publishedAt: isoDateTimeSchema.optional(),
  verifiedAt: isoDateTimeSchema.optional(),
  accessedAt: isoDateTimeSchema,
  sourceVersion: z.string().trim().min(1).optional(),
  license: z.object({
    identifier: z.string().trim().min(1),
    locator: z.string().url(),
    attribution: z.string().trim().min(1),
  }).strict().optional(),
  adaptation: z.object({
    status: z.enum(["unmodified", "adapted"]),
    description: localizedTextSchema,
    endorsementDisclaimer: localizedTextSchema,
  }).strict().optional(),
}).strict();

export const contentPreparationSchema = z.object({
  preparedById: stableIdSchema,
  actorType: z.enum(["human", "ai-assistant"]),
  preparedAt: isoDateTimeSchema,
}).strict();

export const clinicalReviewSchema = z.object({
  reviewId: stableIdSchema,
  protocolId: stableIdSchema,
  contentVersion: semanticVersionSchema,
  contentChecksum: z.string().regex(sha256Pattern),
  reviewerId: stableIdSchema,
  reviewerDisplayName: z.string().trim().min(1),
  reviewerCredentialReference: z.string().trim().min(1),
  authorityType: z.literal("qualified-clinician"),
  reviewedByHuman: z.literal(true),
  decision: z.enum(["reviewed", "changes-requested"]),
  reviewedAt: isoDateTimeSchema,
  notesReference: z.string().trim().min(1).optional(),
}).strict();

export const clinicalApprovalSchema = z.object({
  approvalId: stableIdSchema,
  protocolId: stableIdSchema,
  contentVersion: semanticVersionSchema,
  contentChecksum: z.string().regex(sha256Pattern),
  approverId: stableIdSchema,
  approverDisplayName: z.string().trim().min(1),
  approverCredentialReference: z.string().trim().min(1),
  authorityType: z.literal("qualified-clinician"),
  approvedByHuman: z.literal(true),
  approvedAt: isoDateTimeSchema,
}).strict();

export const technicalValidationSchema = z.object({
  validationId: stableIdSchema,
  protocolId: stableIdSchema,
  contentVersion: semanticVersionSchema,
  contentChecksum: z.string().regex(sha256Pattern),
  status: z.literal("passed"),
  validatorVersion: semanticVersionSchema,
  validatedAt: isoDateTimeSchema,
}).strict();

export const protocolReleaseApprovalSchema = z.object({
  releaseApprovalId: stableIdSchema,
  protocolId: stableIdSchema,
  contentVersion: semanticVersionSchema,
  contentChecksum: z.string().regex(sha256Pattern),
  releaseOwnerId: stableIdSchema,
  authorityType: z.literal("human-release-authority"),
  approvedByHuman: z.literal(true),
  approvedAt: isoDateTimeSchema,
}).strict();

export const packageReleaseApprovalSchema = z.object({
  releaseApprovalId: stableIdSchema,
  packageId: stableIdSchema,
  packageVersion: semanticVersionSchema,
  releaseOwnerId: stableIdSchema,
  authorityType: z.literal("human-release-authority"),
  approvedByHuman: z.literal(true),
  approvedAt: isoDateTimeSchema,
}).strict();

export const protocolStepSchema = z.object({
  stepId: stableIdSchema,
  sequence: z.number().int().positive(),
  kind: z.enum(["instruction", "warning", "information"]),
  text: localizedTextSchema,
  accessibilityLabel: localizedTextSchema.optional(),
}).strict();

export const protocolSectionSchema = z.object({
  sectionId: stableIdSchema,
  sequence: z.number().int().positive(),
  heading: localizedTextSchema,
  steps: z.array(protocolStepSchema).min(1),
}).strict();

export const protocolSchema = z.object({
  protocolId: stableIdSchema,
  schemaVersion: semanticVersionSchema,
  contentVersion: semanticVersionSchema,
  publicationState: publicationStateSchema,
  title: localizedTextSchema,
  summary: localizedTextSchema,
  effectiveAt: isoDateTimeSchema,
  reviewDueAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema.optional(),
  provenance: z.object({
    preparation: contentPreparationSchema,
    sources: z.array(sourceReferenceSchema).min(1),
  }).strict(),
  sections: z.array(protocolSectionSchema).min(1),
  clinicalReviews: z.array(clinicalReviewSchema),
  clinicalApproval: clinicalApprovalSchema.optional(),
  technicalValidation: technicalValidationSchema.optional(),
  releaseApproval: protocolReleaseApprovalSchema.optional(),
  retirement: z.object({
    retiredAt: isoDateTimeSchema,
    reason: localizedTextSchema,
    replacementProtocolId: stableIdSchema.optional(),
  }).strict().optional(),
}).strict().superRefine((protocol, context) => {
  const effectiveAt = Date.parse(protocol.effectiveAt);
  const reviewDueAt = Date.parse(protocol.reviewDueAt);
  const expiresAt = protocol.expiresAt ? Date.parse(protocol.expiresAt) : null;

  if (reviewDueAt <= effectiveAt) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reviewDueAt"], message: "Review date must follow the effective date." });
  }
  if (expiresAt !== null && expiresAt <= effectiveAt) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["expiresAt"], message: "Expiration must follow the effective date." });
  }

  const sectionIds = new Set<string>();
  const stepIds = new Set<string>();
  for (const section of protocol.sections) {
    if (sectionIds.has(section.sectionId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["sections"], message: "Section IDs must be unique." });
    }
    sectionIds.add(section.sectionId);
    for (const step of section.steps) {
      if (stepIds.has(step.stepId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["sections"], message: "Step IDs must be unique within a protocol." });
      }
      stepIds.add(step.stepId);
    }
  }

  if (protocol.publicationState === "reviewed" && protocol.clinicalReviews.length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["clinicalReviews"], message: "Reviewed protocols require a clinical review." });
  }
  if (protocol.publicationState === "approved") {
    if (!protocol.clinicalReviews.some((review) => review.decision === "reviewed")) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["clinicalReviews"], message: "Approved protocols require a completed human clinical review." });
    }
    if (!protocol.clinicalApproval) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["clinicalApproval"], message: "Approved protocols require human clinical approval." });
    }
    if (!protocol.technicalValidation) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["technicalValidation"], message: "Approved protocols require passed technical validation." });
    }
    if (!protocol.releaseApproval) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["releaseApproval"], message: "Approved protocols require human release approval." });
    }
  }
  if (protocol.publicationState === "retired" && !protocol.retirement) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["retirement"], message: "Retired protocols require retirement metadata." });
  }
});

export const protocolIndexEntrySchema = z.object({
  protocolId: stableIdSchema,
  contentVersion: semanticVersionSchema,
}).strict();

export const packageManifestSchema = z.object({
  packageId: stableIdSchema,
  schemaVersion: semanticVersionSchema,
  packageVersion: semanticVersionSchema,
  releaseState: z.enum(["draft", "released", "retired"]),
  createdAt: isoDateTimeSchema,
  effectiveAt: isoDateTimeSchema,
  reviewDueAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema.optional(),
  protocolIndex: z.array(protocolIndexEntrySchema).min(1),
  integrity: z.object({
    algorithm: z.literal("sha256"),
    canonicalization: z.literal("rapidaid-json-v1"),
    checksum: z.string().regex(sha256Pattern),
  }).strict(),
  signature: z.object({
    algorithm: z.literal("ed25519"),
    keyId: stableIdSchema,
    value: z.string().min(16),
  }).strict().optional(),
  releaseApproval: packageReleaseApprovalSchema.optional(),
}).strict();

export const protocolPackageSchema = z.object({
  manifest: packageManifestSchema,
  protocols: z.array(protocolSchema).min(1),
}).strict().superRefine((protocolPackage, context) => {
  const effectiveAt = Date.parse(protocolPackage.manifest.effectiveAt);
  const reviewDueAt = Date.parse(protocolPackage.manifest.reviewDueAt);
  const expiresAt = protocolPackage.manifest.expiresAt ? Date.parse(protocolPackage.manifest.expiresAt) : null;
  if (reviewDueAt <= effectiveAt) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["manifest", "reviewDueAt"], message: "Package review date must follow its effective date." });
  }
  if (expiresAt !== null && expiresAt <= effectiveAt) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["manifest", "expiresAt"], message: "Package expiration must follow its effective date." });
  }

  const indexed = protocolPackage.manifest.protocolIndex
    .map(({ protocolId, contentVersion }) => `${protocolId}@${contentVersion}`)
    .sort();
  const included = protocolPackage.protocols
    .map(({ protocolId, contentVersion }) => `${protocolId}@${contentVersion}`)
    .sort();

  if (new Set(indexed).size !== indexed.length || new Set(included).size !== included.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["manifest", "protocolIndex"], message: "Protocol package entries must be unique." });
  }
  if (indexed.length !== included.length || indexed.some((entry, index) => entry !== included[index])) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["manifest", "protocolIndex"], message: "Protocol index must exactly match packaged protocol IDs and versions." });
  }
  if (protocolPackage.protocols.some((protocol) => protocol.schemaVersion !== protocolPackage.manifest.schemaVersion)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["protocols"], message: "Every protocol schema version must match the package manifest." });
  }
});

export type Locale = z.infer<typeof localeSchema>;
export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type PublicationState = z.infer<typeof publicationStateSchema>;
export type Protocol = z.infer<typeof protocolSchema>;
export type ProtocolPackage = z.infer<typeof protocolPackageSchema>;
export type PackageManifest = z.infer<typeof packageManifestSchema>;
