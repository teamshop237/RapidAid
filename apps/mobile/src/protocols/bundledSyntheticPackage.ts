import type { ProtocolPackage } from "@rapidaid/protocol-engine";

const syntheticContentChecksum = "sha256:ea276f94889d715460cc7e3fa0b792766ba19156ca264b812cc87232c415264a";
const syntheticPackageChecksum = "sha256:6f792fdc9879dcfad5812b8cd4d36529dbfcf143232cd4b00baeb743aa79e032";
const syntheticSignature = "SYNTHETIC-ED25519-NOT-REAL:6f792fdc9879dcfad5812b8cd4d36529dbfcf143232cd4b00baeb743aa79e032";

export const bundledSyntheticPackage: ProtocolPackage = {
  manifest: {
    packageId: "package.synthetic.mobile.alpha",
    schemaVersion: "1.0.0",
    packageVersion: "1.0.0",
    releaseState: "released",
    createdAt: "2026-01-05T00:00:00.000Z",
    effectiveAt: "2026-01-06T00:00:00.000Z",
    reviewDueAt: "2098-01-01T00:00:00.000Z",
    expiresAt: "2099-01-01T00:00:00.000Z",
    protocolIndex: [{ protocolId: "protocol.synthetic.mobile.alpha", contentVersion: "1.0.0" }],
    integrity: {
      algorithm: "sha256",
      canonicalization: "rapidaid-json-v1",
      checksum: syntheticPackageChecksum,
    },
    signature: {
      algorithm: "ed25519",
      keyId: "key.synthetic.mobile.alpha",
      value: syntheticSignature,
    },
    releaseApproval: {
      releaseApprovalId: "approval.synthetic.mobile.package.alpha",
      packageId: "package.synthetic.mobile.alpha",
      packageVersion: "1.0.0",
      releaseOwnerId: "owner.synthetic.mobile.alpha",
      authorityType: "human-release-authority",
      approvedByHuman: true,
      approvedAt: "2026-01-05T00:00:00.000Z",
    },
  },
  protocols: [{
    protocolId: "protocol.synthetic.mobile.alpha",
    schemaVersion: "1.0.0",
    contentVersion: "1.0.0",
    publicationState: "approved",
    title: {
      en: "Synthetic guide Alpha — not medical guidance",
      fr: "Guide synthétique Alpha — aucun conseil médical",
    },
    summary: {
      en: "Verified offline pipeline demonstration only",
      fr: "Démonstration du parcours hors ligne vérifié uniquement",
    },
    effectiveAt: "2026-01-06T00:00:00.000Z",
    reviewDueAt: "2098-01-01T00:00:00.000Z",
    expiresAt: "2099-01-01T00:00:00.000Z",
    provenance: {
      preparation: {
        preparedById: "assistant.synthetic.mobile.alpha",
        actorType: "ai-assistant",
        preparedAt: "2026-01-01T00:00:00.000Z",
      },
      sources: [{
        sourceId: "source.synthetic.mobile.alpha",
        title: "Synthetic Mobile Source — Not Authoritative",
        organization: "Example Invalid Organization",
        locator: "https://example.invalid/rapidaid-mobile-synthetic",
        language: "en",
        jurisdiction: "synthetic-test-only",
        publishedAt: "2026-01-01T00:00:00.000Z",
        accessedAt: "2026-01-01T00:00:00.000Z",
        sourceVersion: "synthetic-1",
      }],
    },
    sections: [{
      sectionId: "section.synthetic.mobile.alpha",
      sequence: 1,
      heading: {
        en: "Synthetic demonstration section",
        fr: "Section de démonstration synthétique",
      },
      steps: [{
        stepId: "step.synthetic.mobile.alpha",
        sequence: 1,
        kind: "information",
        text: {
          en: "SYNTHETIC CONTENT SLOT ALPHA — DO NOT TAKE ACTION.",
          fr: "EMPLACEMENT DE CONTENU SYNTHÉTIQUE ALPHA — NE PAS AGIR.",
        },
        accessibilityLabel: {
          en: "Synthetic demonstration content, not medical guidance",
          fr: "Contenu de démonstration synthétique, aucun conseil médical",
        },
      }],
    }],
    clinicalReviews: [{
      reviewId: "review.synthetic.mobile.alpha",
      protocolId: "protocol.synthetic.mobile.alpha",
      contentVersion: "1.0.0",
      contentChecksum: syntheticContentChecksum,
      reviewerId: "reviewer.synthetic.mobile.alpha",
      reviewerDisplayName: "Synthetic Reviewer — Not a Real Person",
      reviewerCredentialReference: "SYNTHETIC-CREDENTIAL-NOT-REAL",
      authorityType: "qualified-clinician",
      reviewedByHuman: true,
      decision: "reviewed",
      reviewedAt: "2026-01-02T00:00:00.000Z",
    }],
    clinicalApproval: {
      approvalId: "approval.synthetic.mobile.clinical.alpha",
      protocolId: "protocol.synthetic.mobile.alpha",
      contentVersion: "1.0.0",
      contentChecksum: syntheticContentChecksum,
      approverId: "approver.synthetic.mobile.alpha",
      approverDisplayName: "Synthetic Approver — Not a Real Person",
      approverCredentialReference: "SYNTHETIC-CREDENTIAL-NOT-REAL",
      authorityType: "qualified-clinician",
      approvedByHuman: true,
      approvedAt: "2026-01-03T00:00:00.000Z",
    },
    technicalValidation: {
      validationId: "validation.synthetic.mobile.alpha",
      protocolId: "protocol.synthetic.mobile.alpha",
      contentVersion: "1.0.0",
      contentChecksum: syntheticContentChecksum,
      status: "passed",
      validatorVersion: "1.0.0",
      validatedAt: "2026-01-04T00:00:00.000Z",
    },
    releaseApproval: {
      releaseApprovalId: "approval.synthetic.mobile.release.alpha",
      protocolId: "protocol.synthetic.mobile.alpha",
      contentVersion: "1.0.0",
      contentChecksum: syntheticContentChecksum,
      releaseOwnerId: "owner.synthetic.mobile.alpha",
      authorityType: "human-release-authority",
      approvedByHuman: true,
      approvedAt: "2026-01-05T00:00:00.000Z",
    },
  }],
};
