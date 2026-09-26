import {
  ValidatedOfflineProtocolRepository,
  type IntegrityVerifier,
  type OfflineProtocolRepository,
  type ProtocolPackage,
  type SignatureVerifier,
} from "@rapidaid/protocol-engine";

import { bundledSyntheticPackage } from "./bundledSyntheticPackage";

const SYNTHETIC_PACKAGE_CHECKSUM = "sha256:6f792fdc9879dcfad5812b8cd4d36529dbfcf143232cd4b00baeb743aa79e032";
const SYNTHETIC_CONTENT_CHECKSUM = "sha256:ea276f94889d715460cc7e3fa0b792766ba19156ca264b812cc87232c415264a";
const SYNTHETIC_PACKAGE_SIGNATURE = "SYNTHETIC-ED25519-NOT-REAL:6f792fdc9879dcfad5812b8cd4d36529dbfcf143232cd4b00baeb743aa79e032";
const SYNTHETIC_CONTENT_PAYLOAD = `{"contentVersion":"1.0.0","effectiveAt":"2026-01-06T00:00:00.000Z","expiresAt":"2099-01-01T00:00:00.000Z","protocolId":"protocol.synthetic.mobile.alpha","provenance":{"preparation":{"actorType":"ai-assistant","preparedAt":"2026-01-01T00:00:00.000Z","preparedById":"assistant.synthetic.mobile.alpha"},"sources":[{"accessedAt":"2026-01-01T00:00:00.000Z","jurisdiction":"synthetic-test-only","language":"en","locator":"https://example.invalid/rapidaid-mobile-synthetic","organization":"Example Invalid Organization","publishedAt":"2026-01-01T00:00:00.000Z","sourceId":"source.synthetic.mobile.alpha","sourceVersion":"synthetic-1","title":"Synthetic Mobile Source — Not Authoritative"}]},"reviewDueAt":"2098-01-01T00:00:00.000Z","schemaVersion":"1.0.0","sections":[{"heading":{"en":"Synthetic demonstration section","fr":"Section de démonstration synthétique"},"sectionId":"section.synthetic.mobile.alpha","sequence":1,"steps":[{"accessibilityLabel":{"en":"Synthetic demonstration content, not medical guidance","fr":"Contenu de démonstration synthétique, aucun conseil médical"},"kind":"information","sequence":1,"stepId":"step.synthetic.mobile.alpha","text":{"en":"SYNTHETIC CONTENT SLOT ALPHA — DO NOT TAKE ACTION.","fr":"EMPLACEMENT DE CONTENU SYNTHÉTIQUE ALPHA — NE PAS AGIR."}}]}],"summary":{"en":"Verified offline pipeline demonstration only","fr":"Démonstration du parcours hors ligne vérifié uniquement"},"title":{"en":"Synthetic guide Alpha — not medical guidance","fr":"Guide synthétique Alpha — aucun conseil médical"}}`;
const SYNTHETIC_PACKAGE_PAYLOAD = `{"manifest":{"createdAt":"2026-01-05T00:00:00.000Z","effectiveAt":"2026-01-06T00:00:00.000Z","expiresAt":"2099-01-01T00:00:00.000Z","packageId":"package.synthetic.mobile.alpha","packageVersion":"1.0.0","protocolIndex":[{"contentVersion":"1.0.0","protocolId":"protocol.synthetic.mobile.alpha"}],"releaseApproval":{"approvedAt":"2026-01-05T00:00:00.000Z","approvedByHuman":true,"authorityType":"human-release-authority","packageId":"package.synthetic.mobile.alpha","packageVersion":"1.0.0","releaseApprovalId":"approval.synthetic.mobile.package.alpha","releaseOwnerId":"owner.synthetic.mobile.alpha"},"releaseState":"released","reviewDueAt":"2098-01-01T00:00:00.000Z","schemaVersion":"1.0.0"},"protocols":[{"clinicalApproval":{"approvalId":"approval.synthetic.mobile.clinical.alpha","approvedAt":"2026-01-03T00:00:00.000Z","approvedByHuman":true,"approverCredentialReference":"SYNTHETIC-CREDENTIAL-NOT-REAL","approverDisplayName":"Synthetic Approver — Not a Real Person","approverId":"approver.synthetic.mobile.alpha","authorityType":"qualified-clinician","contentChecksum":"sha256:ea276f94889d715460cc7e3fa0b792766ba19156ca264b812cc87232c415264a","contentVersion":"1.0.0","protocolId":"protocol.synthetic.mobile.alpha"},"clinicalReviews":[{"authorityType":"qualified-clinician","contentChecksum":"sha256:ea276f94889d715460cc7e3fa0b792766ba19156ca264b812cc87232c415264a","contentVersion":"1.0.0","decision":"reviewed","protocolId":"protocol.synthetic.mobile.alpha","reviewId":"review.synthetic.mobile.alpha","reviewedAt":"2026-01-02T00:00:00.000Z","reviewedByHuman":true,"reviewerCredentialReference":"SYNTHETIC-CREDENTIAL-NOT-REAL","reviewerDisplayName":"Synthetic Reviewer — Not a Real Person","reviewerId":"reviewer.synthetic.mobile.alpha"}],"contentVersion":"1.0.0","effectiveAt":"2026-01-06T00:00:00.000Z","expiresAt":"2099-01-01T00:00:00.000Z","protocolId":"protocol.synthetic.mobile.alpha","provenance":{"preparation":{"actorType":"ai-assistant","preparedAt":"2026-01-01T00:00:00.000Z","preparedById":"assistant.synthetic.mobile.alpha"},"sources":[{"accessedAt":"2026-01-01T00:00:00.000Z","jurisdiction":"synthetic-test-only","language":"en","locator":"https://example.invalid/rapidaid-mobile-synthetic","organization":"Example Invalid Organization","publishedAt":"2026-01-01T00:00:00.000Z","sourceId":"source.synthetic.mobile.alpha","sourceVersion":"synthetic-1","title":"Synthetic Mobile Source — Not Authoritative"}]},"publicationState":"approved","releaseApproval":{"approvedAt":"2026-01-05T00:00:00.000Z","approvedByHuman":true,"authorityType":"human-release-authority","contentChecksum":"sha256:ea276f94889d715460cc7e3fa0b792766ba19156ca264b812cc87232c415264a","contentVersion":"1.0.0","protocolId":"protocol.synthetic.mobile.alpha","releaseApprovalId":"approval.synthetic.mobile.release.alpha","releaseOwnerId":"owner.synthetic.mobile.alpha"},"reviewDueAt":"2098-01-01T00:00:00.000Z","schemaVersion":"1.0.0","sections":[{"heading":{"en":"Synthetic demonstration section","fr":"Section de démonstration synthétique"},"sectionId":"section.synthetic.mobile.alpha","sequence":1,"steps":[{"accessibilityLabel":{"en":"Synthetic demonstration content, not medical guidance","fr":"Contenu de démonstration synthétique, aucun conseil médical"},"kind":"information","sequence":1,"stepId":"step.synthetic.mobile.alpha","text":{"en":"SYNTHETIC CONTENT SLOT ALPHA — DO NOT TAKE ACTION.","fr":"EMPLACEMENT DE CONTENU SYNTHÉTIQUE ALPHA — NE PAS AGIR."}}]}],"summary":{"en":"Verified offline pipeline demonstration only","fr":"Démonstration du parcours hors ligne vérifié uniquement"},"technicalValidation":{"contentChecksum":"sha256:ea276f94889d715460cc7e3fa0b792766ba19156ca264b812cc87232c415264a","contentVersion":"1.0.0","protocolId":"protocol.synthetic.mobile.alpha","status":"passed","validatedAt":"2026-01-04T00:00:00.000Z","validationId":"validation.synthetic.mobile.alpha","validatorVersion":"1.0.0"},"title":{"en":"Synthetic guide Alpha — not medical guidance","fr":"Guide synthétique Alpha — aucun conseil médical"}}]}`;

// Demo-only exact-payload verification proves the fail-closed mobile wiring without
// introducing production key material. A trusted public-key verifier replaces this later.

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const syntheticIntegrityVerifier: IntegrityVerifier = {
  verifySha256: async (payload, expectedChecksum) => (
    (expectedChecksum === SYNTHETIC_PACKAGE_CHECKSUM && payload === SYNTHETIC_PACKAGE_PAYLOAD)
    || (expectedChecksum === SYNTHETIC_CONTENT_CHECKSUM && payload === SYNTHETIC_CONTENT_PAYLOAD)
  ),
};

const syntheticSignatureVerifier: SignatureVerifier = {
  verifyEd25519: async (payload, keyId, signature) => (
    keyId === "key.synthetic.mobile.alpha"
    && signature === SYNTHETIC_PACKAGE_SIGNATURE
    && payload === SYNTHETIC_PACKAGE_PAYLOAD
  ),
};

class BundledSyntheticProtocolStore {
  readonly #storedPackage: unknown;

  constructor(storedPackage: unknown) {
    this.#storedPackage = storedPackage;
  }

  async readPackage(): Promise<unknown> {
    return cloneJson(this.#storedPackage);
  }
}

export function createSyntheticDemoProtocolRepository(
  storedPackage: unknown = bundledSyntheticPackage,
): OfflineProtocolRepository {
  return new ValidatedOfflineProtocolRepository({
    store: new BundledSyntheticProtocolStore(storedPackage),
    integrityVerifier: syntheticIntegrityVerifier,
    signatureVerifier: syntheticSignatureVerifier,
  });
}

export function cloneBundledSyntheticPackage(): ProtocolPackage {
  return cloneJson(bundledSyntheticPackage);
}
