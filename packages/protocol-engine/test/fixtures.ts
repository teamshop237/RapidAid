import { createHash } from "node:crypto";

import { canonicalizePackagePayload, canonicalizeProtocolContent } from "../src/integrity.js";
import { Protocol, ProtocolPackage, protocolPackageSchema, protocolSchema } from "../src/schema.js";

export const syntheticNow = new Date("2027-01-01T00:00:00.000Z");
const placeholderChecksum = `sha256:${"0".repeat(64)}`;

export function refreshSyntheticProtocolBindings(protocol: Protocol): Protocol {
  const contentChecksum = sha256Checksum(canonicalizeProtocolContent(protocol));
  return protocolSchema.parse({
    ...protocol,
    clinicalReviews: protocol.clinicalReviews.map((review) => ({ ...review, contentChecksum })),
    clinicalApproval: protocol.clinicalApproval ? { ...protocol.clinicalApproval, contentChecksum } : undefined,
    technicalValidation: protocol.technicalValidation ? { ...protocol.technicalValidation, contentChecksum } : undefined,
    releaseApproval: protocol.releaseApproval ? { ...protocol.releaseApproval, contentChecksum } : undefined,
  });
}

export function makeApprovedSyntheticProtocol(): Protocol {
  const protocol = protocolSchema.parse({
    protocolId: "protocol.synthetic.alpha",
    schemaVersion: "1.0.0",
    contentVersion: "1.0.0",
    publicationState: "approved",
    title: {
      en: "SYNTHETIC PROTOCOL ALPHA — NOT MEDICAL GUIDANCE",
      fr: "PROTOCOLE SYNTHÉTIQUE ALPHA — AUCUN CONSEIL MÉDICAL",
    },
    summary: {
      en: "Schema fixture only. Not for real-world use.",
      fr: "Exemple de schéma uniquement. Ne pas utiliser en situation réelle.",
    },
    effectiveAt: "2026-01-01T00:00:00.000Z",
    reviewDueAt: "2030-01-01T00:00:00.000Z",
    expiresAt: "2031-01-01T00:00:00.000Z",
    provenance: {
      preparation: {
        preparedById: "assistant.synthetic.alpha",
        actorType: "ai-assistant",
        preparedAt: "2025-10-01T00:00:00.000Z",
      },
      sources: [{
        sourceId: "source.synthetic.alpha",
        title: "Synthetic Source Alpha — Not Authoritative",
        organization: "Example Invalid Organization",
        locator: "https://example.invalid/synthetic-source-alpha",
        language: "en",
        jurisdiction: "synthetic-test-only",
        publishedAt: "2025-01-01T00:00:00.000Z",
        accessedAt: "2025-10-01T00:00:00.000Z",
        sourceVersion: "synthetic-1",
      }],
    },
    sections: [{
      sectionId: "section.synthetic.alpha",
      sequence: 1,
      heading: {
        en: "Synthetic content section",
        fr: "Section de contenu synthétique",
      },
      steps: [{
        stepId: "step.synthetic.alpha",
        sequence: 1,
        kind: "information",
        text: {
          en: "SYNTHETIC CONTENT SLOT ALPHA — NOT FOR USE.",
          fr: "EMPLACEMENT DE CONTENU SYNTHÉTIQUE ALPHA — NE PAS UTILISER.",
        },
      }],
    }],
    clinicalReviews: [{
      reviewId: "review.synthetic.alpha",
      protocolId: "protocol.synthetic.alpha",
      contentVersion: "1.0.0",
      contentChecksum: placeholderChecksum,
      reviewerId: "reviewer.synthetic.alpha",
      reviewerDisplayName: "Synthetic Clinical Reviewer — Not a Real Person",
      reviewerCredentialReference: "SYNTHETIC-CREDENTIAL-NOT-REAL",
      authorityType: "qualified-clinician",
      reviewedByHuman: true,
      decision: "reviewed",
      reviewedAt: "2025-11-01T00:00:00.000Z",
    }],
    clinicalApproval: {
      approvalId: "approval.synthetic.clinical.alpha",
      protocolId: "protocol.synthetic.alpha",
      contentVersion: "1.0.0",
      contentChecksum: placeholderChecksum,
      approverId: "approver.synthetic.clinical.alpha",
      approverDisplayName: "Synthetic Clinical Approver — Not a Real Person",
      approverCredentialReference: "SYNTHETIC-CREDENTIAL-NOT-REAL",
      authorityType: "qualified-clinician",
      approvedByHuman: true,
      approvedAt: "2025-11-02T00:00:00.000Z",
    },
    technicalValidation: {
      validationId: "validation.synthetic.alpha",
      protocolId: "protocol.synthetic.alpha",
      contentVersion: "1.0.0",
      contentChecksum: placeholderChecksum,
      status: "passed",
      validatorVersion: "1.0.0",
      validatedAt: "2025-11-03T00:00:00.000Z",
    },
    releaseApproval: {
      releaseApprovalId: "approval.synthetic.release.alpha",
      protocolId: "protocol.synthetic.alpha",
      contentVersion: "1.0.0",
      contentChecksum: placeholderChecksum,
      releaseOwnerId: "owner.synthetic.release.alpha",
      authorityType: "human-release-authority",
      approvedByHuman: true,
      approvedAt: "2025-11-04T00:00:00.000Z",
    },
  });
  return refreshSyntheticProtocolBindings(protocol);
}

export function sha256Checksum(payload: string): string {
  return `sha256:${createHash("sha256").update(payload).digest("hex")}`;
}

export function refreshSyntheticChecksum(protocolPackage: ProtocolPackage): ProtocolPackage {
  const checksum = sha256Checksum(canonicalizePackagePayload(protocolPackage));
  return protocolPackageSchema.parse({
    ...protocolPackage,
    manifest: {
      ...protocolPackage.manifest,
      integrity: { ...protocolPackage.manifest.integrity, checksum },
    },
  });
}

export function syntheticPackageSignature(payload: string): string {
  return `SYNTHETIC-ED25519-NOT-REAL:${sha256Checksum(payload).slice("sha256:".length)}`;
}

export function refreshSyntheticPackageAuthenticity(protocolPackage: ProtocolPackage): ProtocolPackage {
  const canonicalPayload = canonicalizePackagePayload(protocolPackage);
  return protocolPackageSchema.parse({
    ...protocolPackage,
    manifest: {
      ...protocolPackage.manifest,
      integrity: {
        ...protocolPackage.manifest.integrity,
        checksum: sha256Checksum(canonicalPayload),
      },
      signature: {
        algorithm: "ed25519",
        keyId: "key.synthetic.alpha",
        value: syntheticPackageSignature(canonicalPayload),
      },
    },
  });
}

export function makeReleasedSyntheticPackage(): ProtocolPackage {
  const protocol = makeApprovedSyntheticProtocol();
  const protocolPackage = protocolPackageSchema.parse({
    manifest: {
      packageId: "package.synthetic.alpha",
      schemaVersion: "1.0.0",
      packageVersion: "1.0.0",
      releaseState: "released",
      createdAt: "2025-11-05T00:00:00.000Z",
      effectiveAt: "2026-01-01T00:00:00.000Z",
      reviewDueAt: "2030-01-01T00:00:00.000Z",
      expiresAt: "2031-01-01T00:00:00.000Z",
      protocolIndex: [{ protocolId: protocol.protocolId, contentVersion: protocol.contentVersion }],
      integrity: {
        algorithm: "sha256",
        canonicalization: "rapidaid-json-v1",
        checksum: placeholderChecksum,
      },
      signature: {
        algorithm: "ed25519",
        keyId: "key.synthetic.alpha",
        value: "SYNTHETIC-ED25519-NOT-REAL-PLACEHOLDER",
      },
      releaseApproval: {
        releaseApprovalId: "approval.synthetic.package.alpha",
        packageId: "package.synthetic.alpha",
        packageVersion: "1.0.0",
        releaseOwnerId: "owner.synthetic.package.alpha",
        authorityType: "human-release-authority",
        approvedByHuman: true,
        approvedAt: "2025-11-05T00:00:00.000Z",
      },
    },
    protocols: [protocol],
  });
  return refreshSyntheticPackageAuthenticity(protocolPackage);
}
