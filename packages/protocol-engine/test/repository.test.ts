import { describe, expect, it } from "vitest";

import { IntegrityVerifier, SignatureVerifier } from "../src/integrity.js";
import {
  InMemoryOfflineProtocolPackageStore,
  OfflineProtocolPackageStore,
  ValidatedOfflineProtocolRepository,
} from "../src/repository.js";
import { ProtocolPackage } from "../src/schema.js";
import {
  makeReleasedSyntheticPackage,
  refreshSyntheticPackageAuthenticity,
  refreshSyntheticProtocolBindings,
  refreshSyntheticChecksum,
  sha256Checksum,
  syntheticPackageSignature,
  syntheticNow,
} from "./fixtures.js";

const integrityVerifier: IntegrityVerifier = {
  verifySha256: async (payload, expected) => sha256Checksum(payload) === expected,
};

const syntheticSignatureVerifier: SignatureVerifier = {
  verifyEd25519: async (payload, keyId, signature) => (
    keyId === "key.synthetic.alpha" && signature === syntheticPackageSignature(payload)
  ),
};

function repository(
  storedPackage: unknown | null,
  signatureVerifier: SignatureVerifier = syntheticSignatureVerifier,
) {
  return new ValidatedOfflineProtocolRepository({
    store: new InMemoryOfflineProtocolPackageStore(storedPackage),
    integrityVerifier,
    signatureVerifier,
    now: () => syntheticNow,
  });
}

function reauthorize(protocolPackage: ProtocolPackage): ProtocolPackage {
  return refreshSyntheticPackageAuthenticity(protocolPackage);
}

describe("validated offline protocol repository", () => {
  it("loads a released, compatible, intact synthetic protocol while offline", async () => {
    const result = await repository(makeReleasedSyntheticPackage()).getProtocol("protocol.synthetic.alpha");

    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.protocol.protocolId).toBe("protocol.synthetic.alpha");
      expect(result.packageVersion).toBe("1.0.0");
    }
  });

  it("fails safely when no package is installed", async () => {
    await expect(repository(null).loadPackage()).resolves.toMatchObject({ status: "missing" });
  });

  it("fails safely when local storage throws", async () => {
    const failingStore: OfflineProtocolPackageStore = {
      readPackage: async () => { throw new Error("synthetic storage failure"); },
    };
    const offlineRepository = new ValidatedOfflineProtocolRepository({
      store: failingStore,
      integrityVerifier,
      signatureVerifier: syntheticSignatureVerifier,
    });

    await expect(offlineRepository.loadPackage()).resolves.toMatchObject({ status: "storage-error" });
  });

  it("rejects invalid package data", async () => {
    await expect(repository({ synthetic: "not-a-package" }).loadPackage()).resolves.toMatchObject({ status: "invalid" });
  });

  it("rejects incompatible schema versions", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.manifest.schemaVersion = "2.0.0";
    protocolPackage.protocols[0]!.schemaVersion = "2.0.0";

    await expect(repository(reauthorize(protocolPackage)).loadPackage()).resolves.toMatchObject({ status: "incompatible" });
  });

  it("rejects packages whose review date has passed", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.manifest.reviewDueAt = "2026-12-31T00:00:00.000Z";

    await expect(repository(reauthorize(protocolPackage)).loadPackage()).resolves.toMatchObject({ status: "expired" });
  });

  it("rejects unapproved protocol content", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    const protocol = protocolPackage.protocols[0]!;
    protocol.publicationState = "draft";
    delete protocol.clinicalApproval;
    delete protocol.technicalValidation;
    delete protocol.releaseApproval;

    await expect(repository(reauthorize(protocolPackage)).loadPackage()).resolves.toMatchObject({ status: "unapproved" });
  });

  it("rejects reviewed protocol content as usable guidance", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    const protocol = protocolPackage.protocols[0]!;
    protocol.publicationState = "reviewed";
    delete protocol.clinicalApproval;
    delete protocol.technicalValidation;
    delete protocol.releaseApproval;

    await expect(repository(reauthorize(protocolPackage)).getProtocol(protocol.protocolId))
      .resolves.toMatchObject({ status: "unapproved" });
  });

  it("rejects technical and release approval when clinical approval is absent", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    delete protocolPackage.protocols[0]!.clinicalApproval;

    await expect(repository(protocolPackage).getProtocol("protocol.synthetic.alpha"))
      .resolves.toMatchObject({ status: "invalid" });
  });

  it("rejects tampered package content", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.protocols[0]!.summary.en = "SYNTHETIC TAMPER MARKER";

    await expect(repository(protocolPackage).loadPackage()).resolves.toMatchObject({ status: "integrity-failed" });
  });

  it("rejects a recomputed checksum when the package signature is stale", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.protocols[0]!.summary.en = "SYNTHETIC MODIFIED CONTENT — NOT FOR USE";

    await expect(repository(refreshSyntheticChecksum(protocolPackage)).loadPackage())
      .resolves.toMatchObject({ status: "signature-invalid" });
  });

  it("rejects an unsigned released package", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    delete protocolPackage.manifest.signature;

    await expect(repository(refreshSyntheticChecksum(protocolPackage)).loadPackage())
      .resolves.toMatchObject({ status: "signature-invalid" });
  });

  it("rejects a correctly packaged content change when the clinical approval is stale", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.protocols[0]!.summary.en = "SYNTHETIC CHANGED CONTENT — NOT FOR USE";

    const result = await repository(reauthorize(protocolPackage)).getProtocol("protocol.synthetic.alpha");

    expect(result).toMatchObject({ status: "unapproved" });
    if (result.status === "unapproved") {
      expect(result.issues?.map((issue) => issue.code)).toContain("content-binding");
    }
  });

  it("binds English and French content to the same clinical approval", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.protocols[0]!.sections[0]!.steps[0]!.text.fr =
      "CONTENU SYNTHÉTIQUE MODIFIÉ — NE PAS UTILISER";

    await expect(repository(reauthorize(protocolPackage)).getProtocol("protocol.synthetic.alpha"))
      .resolves.toMatchObject({ status: "unapproved" });
  });

  it("rejects a package when signature verification fails", async () => {
    const rejectingSignatureVerifier: SignatureVerifier = { verifyEd25519: async () => false };

    await expect(repository(makeReleasedSyntheticPackage(), rejectingSignatureVerifier).loadPackage())
      .resolves.toMatchObject({ status: "signature-invalid" });
  });

  it("rejects an explicitly incorrect package signature", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.manifest.signature!.value = "SYNTHETIC-INVALID-SIGNATURE";

    await expect(repository(protocolPackage).loadPackage())
      .resolves.toMatchObject({ status: "signature-invalid" });
  });

  it("rejects a retired package", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.manifest.releaseState = "retired";

    await expect(repository(reauthorize(protocolPackage)).loadPackage())
      .resolves.toMatchObject({ status: "retired" });
  });

  it("rejects a retired protocol inside an otherwise current package", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    const protocol = protocolPackage.protocols[0]!;
    protocol.publicationState = "retired";
    protocol.retirement = {
      retiredAt: "2026-12-01T00:00:00.000Z",
      reason: {
        en: "SYNTHETIC RETIREMENT — NOT FOR USE",
        fr: "RETRAIT SYNTHÉTIQUE — NE PAS UTILISER",
      },
    };

    await expect(repository(reauthorize(protocolPackage)).getProtocol(protocol.protocolId))
      .resolves.toMatchObject({ status: "unapproved" });
  });

  it("rejects a package that is not yet effective", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.manifest.effectiveAt = "2028-01-01T00:00:00.000Z";

    await expect(repository(reauthorize(protocolPackage)).loadPackage())
      .resolves.toMatchObject({ status: "not-effective" });
  });

  it("rejects an expired protocol even when the package remains current", async () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.protocols[0]!.reviewDueAt = "2026-12-31T00:00:00.000Z";
    protocolPackage.protocols[0] = refreshSyntheticProtocolBindings(protocolPackage.protocols[0]!);

    await expect(repository(reauthorize(protocolPackage)).loadPackage())
      .resolves.toMatchObject({ status: "expired" });
  });

  it("fails closed for a partially written serialized package", async () => {
    const truncated = JSON.stringify(makeReleasedSyntheticPackage()).slice(0, -32);
    let storedPackage: unknown;
    try {
      storedPackage = JSON.parse(truncated);
    } catch {
      storedPackage = truncated;
    }

    await expect(repository(storedPackage).loadPackage()).resolves.toMatchObject({ status: "invalid" });
  });

  it("returns not-found without exposing unrelated content", async () => {
    await expect(repository(makeReleasedSyntheticPackage()).getProtocol("protocol.synthetic.missing"))
      .resolves.toMatchObject({ status: "not-found" });
  });
});
