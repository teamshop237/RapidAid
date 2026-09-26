import {
  Sha256IntegrityVerifier,
  TrustedEd25519SignatureVerifier,
  ValidatedOfflineProtocolRepository,
  computeSha256Checksum,
  type ProtocolPackage,
  type SignatureVerifier,
} from "@rapidaid/protocol-engine";

import {
  PersistentOfflineProtocolPackageStore,
  TrustedOfflinePackageInstaller,
  type AtomicProtocolFileSystem,
} from "@/protocols/persistentProtocolStore";
import { cloneBundledSyntheticPackage } from "../test-support/testProtocolRepository";

const PACKAGE_ID = "package.synthetic.mobile.alpha";
const FIXED_NOW = () => new Date("2027-01-01T00:00:00.000Z");
const RFC8032_PUBLIC_KEY = "ed25519:d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";

const acceptingSyntheticSignatureVerifier: SignatureVerifier = {
  verifyEd25519: async (_payload, keyId, signature) => (
    keyId === "key.synthetic.mobile.alpha"
    && signature.startsWith("SYNTHETIC-ED25519-NOT-REAL:")
  ),
};

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function normalizeJson(value: unknown): JsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) return value.map(normalizeJson);
  const record = value as Record<string, unknown>;
  return Object.keys(record).sort().reduce<Record<string, JsonValue>>((normalized, key) => {
    if (record[key] !== undefined) normalized[key] = normalizeJson(record[key]);
    return normalized;
  }, {});
}

function canonicalize(value: unknown): string {
  return JSON.stringify(normalizeJson(value));
}

function canonicalPackagePayloadForTest(protocolPackage: ProtocolPackage): string {
  const { integrity: _integrity, signature: _signature, ...manifest } = protocolPackage.manifest;
  return canonicalize({ manifest, protocols: protocolPackage.protocols });
}

function canonicalProtocolContentForTest(protocol: ProtocolPackage["protocols"][number]): string {
  const {
    publicationState: _publicationState,
    clinicalReviews: _clinicalReviews,
    clinicalApproval: _clinicalApproval,
    technicalValidation: _technicalValidation,
    releaseApproval: _releaseApproval,
    retirement: _retirement,
    ...content
  } = protocol;
  return canonicalize(content);
}

class MemoryAtomicProtocolFileSystem implements AtomicProtocolFileSystem {
  readonly activeFiles = new Map<string, string>();
  candidate: string | null = null;
  temporary: string | null = null;
  activationRecord: string | null = null;
  interruptNextWrite = false;
  interruptNextActivationRecord = false;

  async initialize(): Promise<void> {}

  async listActiveFileNames(): Promise<readonly string[]> {
    return [...this.activeFiles.keys()];
  }

  async readActiveFile(fileName: string): Promise<string> {
    const value = this.activeFiles.get(fileName);
    if (value === undefined) throw new Error("Missing active test file.");
    return value;
  }

  async readActivationRecord(): Promise<string | null> {
    return this.activationRecord;
  }

  async writeCandidateAtomically(serializedPackage: string): Promise<void> {
    this.temporary = serializedPackage;
    if (this.interruptNextWrite) {
      this.interruptNextWrite = false;
      throw new Error("Synthetic interrupted write.");
    }
    this.candidate = this.temporary;
    this.temporary = null;
  }

  async readCandidateFile(): Promise<string | null> {
    return this.candidate;
  }

  async activateCandidate(fileName: string, serializedActivationRecord: string): Promise<void> {
    if (this.candidate === null) throw new Error("Cannot activate candidate.");
    const existing = this.activeFiles.get(fileName);
    if (existing !== undefined && existing !== this.candidate) throw new Error("Immutable slot conflict.");
    this.activeFiles.set(fileName, this.candidate);
    this.candidate = null;
    if (this.interruptNextActivationRecord) {
      this.interruptNextActivationRecord = false;
      throw new Error("Synthetic interrupted activation record write.");
    }
    this.activationRecord = serializedActivationRecord;
  }

  async discardCandidate(): Promise<void> {
    this.candidate = null;
    this.temporary = null;
  }
}

function refreshPackageChecksum(protocolPackage: ProtocolPackage): ProtocolPackage {
  protocolPackage.manifest.integrity.checksum = computeSha256Checksum(canonicalPackagePayloadForTest(protocolPackage));
  return protocolPackage;
}

function packageVersion(version: string): ProtocolPackage {
  const protocolPackage = cloneBundledSyntheticPackage();
  protocolPackage.manifest.packageVersion = version;
  protocolPackage.manifest.releaseApproval!.packageVersion = version;
  return refreshPackageChecksum(protocolPackage);
}

function createHarness(
  fileSystem = new MemoryAtomicProtocolFileSystem(),
  signatureVerifier: SignatureVerifier = acceptingSyntheticSignatureVerifier,
) {
  const store = new PersistentOfflineProtocolPackageStore(fileSystem, PACKAGE_ID);
  const integrityVerifier = new Sha256IntegrityVerifier();
  const installer = new TrustedOfflinePackageInstaller({
    store,
    integrityVerifier,
    signatureVerifier,
    expectedPackageId: PACKAGE_ID,
    now: FIXED_NOW,
  });
  const repository = new ValidatedOfflineProtocolRepository({
    store,
    integrityVerifier,
    signatureVerifier,
    now: FIXED_NOW,
  });
  return { fileSystem, installer, repository, store };
}

describe("persistent trusted protocol storage", () => {
  it("fails safely on first launch when no package is installed", async () => {
    const { repository } = createHarness();
    await expect(repository.loadPackage()).resolves.toMatchObject({ status: "missing" });
  });

  it("installs a valid package and reloads it after an app restart", async () => {
    const firstRun = createHarness();
    await expect(firstRun.installer.installCandidate(packageVersion("1.0.0"))).resolves.toEqual({
      status: "activated",
      packageVersion: "1.0.0",
    });
    await expect(firstRun.repository.loadPackage()).resolves.toMatchObject({ status: "ready" });

    const restarted = createHarness(firstRun.fileSystem);
    await expect(restarted.repository.loadPackage()).resolves.toMatchObject({
      status: "ready",
      protocolPackage: { manifest: { packageVersion: "1.0.0" } },
    });
  });

  it("keeps the last known-good package after an interrupted candidate write", async () => {
    const harness = createHarness();
    await harness.installer.installCandidate(packageVersion("1.0.0"));
    harness.fileSystem.interruptNextWrite = true;

    await expect(harness.installer.installCandidate(packageVersion("1.1.0"))).resolves.toEqual({ status: "storage-error" });
    await expect(harness.repository.loadPackage()).resolves.toMatchObject({
      status: "ready",
      protocolPackage: { manifest: { packageVersion: "1.0.0" } },
    });
  });

  it("keeps the last known-good pointer after an interrupted activation", async () => {
    const harness = createHarness();
    await harness.installer.installCandidate(packageVersion("1.0.0"));
    harness.fileSystem.interruptNextActivationRecord = true;

    await expect(harness.installer.installCandidate(packageVersion("1.1.0"))).resolves.toEqual({ status: "storage-error" });
    await expect(harness.repository.loadPackage()).resolves.toMatchObject({
      status: "ready",
      protocolPackage: { manifest: { packageVersion: "1.0.0" } },
    });
  });

  it("fails closed when the active package is corrupted or tampered after activation", async () => {
    const corrupted = createHarness();
    await corrupted.installer.installCandidate(packageVersion("1.0.0"));
    corrupted.fileSystem.activeFiles.set(`${PACKAGE_ID}--1.0.0.json`, "{partial");
    await expect(corrupted.repository.loadPackage()).resolves.toMatchObject({ status: "invalid" });

    const tampered = createHarness();
    await tampered.installer.installCandidate(packageVersion("1.0.0"));
    const stored = JSON.parse(tampered.fileSystem.activeFiles.get(`${PACKAGE_ID}--1.0.0.json`)!) as ProtocolPackage;
    stored.protocols[0]!.summary.en = "TAMPERED SYNTHETIC CONTENT — NEVER DISPLAY";
    tampered.fileSystem.activeFiles.set(`${PACKAGE_ID}--1.0.0.json`, JSON.stringify(stored));
    await expect(tampered.repository.loadPackage()).resolves.toMatchObject({ status: "integrity-failed" });
  });

  it("stops returning an active package once its safety dates expire", async () => {
    const harness = createHarness();
    await harness.installer.installCandidate(packageVersion("1.0.0"));
    const afterExpiry = new ValidatedOfflineProtocolRepository({
      store: harness.store,
      integrityVerifier: new Sha256IntegrityVerifier(),
      signatureVerifier: acceptingSyntheticSignatureVerifier,
      now: () => new Date("2100-01-01T00:00:00.000Z"),
    });

    await expect(afterExpiry.loadPackage()).resolves.toMatchObject({ status: "expired" });
  });

  it.each([
    ["invalid signature", () => {
      const candidate = packageVersion("1.0.0");
      candidate.manifest.signature!.value = "INVALID-SIGNATURE";
      return candidate;
    }, acceptingSyntheticSignatureVerifier, "signature-invalid"],
    ["unknown key", () => packageVersion("1.0.0"), new TrustedEd25519SignatureVerifier([]), "signature-invalid"],
    ["revoked key", () => packageVersion("1.0.0"), new TrustedEd25519SignatureVerifier([{
      keyId: "key.synthetic.mobile.alpha",
      publicKey: RFC8032_PUBLIC_KEY,
      status: "revoked",
    }]), "signature-invalid"],
  ] as const)("rejects a candidate with an %s", async (_name, makeCandidate, verifier, expectedFailure) => {
    const { installer, repository } = createHarness(undefined, verifier);
    await expect(installer.installCandidate(makeCandidate())).resolves.toMatchObject({
      status: "rejected",
      reason: "invalid-candidate",
      failure: { status: expectedFailure },
    });
    await expect(repository.loadPackage()).resolves.toMatchObject({ status: "missing" });
  });

  it("rejects incompatible, expired, and retired candidates", async () => {
    const incompatible = packageVersion("1.0.0") as ProtocolPackage;
    incompatible.manifest.schemaVersion = "2.0.0";
    incompatible.protocols[0]!.schemaVersion = "2.0.0";
    refreshPackageChecksum(incompatible);

    const expired = packageVersion("1.0.0");
    expired.manifest.reviewDueAt = "2026-12-31T00:00:00.000Z";
    refreshPackageChecksum(expired);

    const retired = packageVersion("1.0.0");
    retired.manifest.releaseState = "retired";
    refreshPackageChecksum(retired);

    for (const [candidate, expectedStatus] of [
      [incompatible, "incompatible"],
      [expired, "expired"],
      [retired, "retired"],
    ] as const) {
      const { installer, repository } = createHarness();
      await expect(installer.installCandidate(candidate)).resolves.toMatchObject({
        status: "rejected",
        failure: { status: expectedStatus },
      });
      await expect(repository.loadPackage()).resolves.toMatchObject({ status: "missing" });
    }
  });

  it("preserves active trusted content when a candidate fails validation", async () => {
    const harness = createHarness();
    await harness.installer.installCandidate(packageVersion("1.0.0"));
    const tamperedCandidate = packageVersion("1.1.0");
    tamperedCandidate.protocols[0]!.summary.fr = "ALTÉRATION SYNTHÉTIQUE — NE JAMAIS AFFICHER";

    await expect(harness.installer.installCandidate(tamperedCandidate)).resolves.toMatchObject({
      status: "rejected",
      reason: "invalid-candidate",
      failure: { status: "integrity-failed" },
    });
    await expect(harness.repository.loadPackage()).resolves.toMatchObject({
      status: "ready",
      protocolPackage: { manifest: { packageVersion: "1.0.0" } },
    });
  });

  it("rejects an otherwise valid package for a different package identity", async () => {
    const harness = createHarness();
    const candidate = packageVersion("1.0.0");
    candidate.manifest.packageId = "package.synthetic.other";
    candidate.manifest.releaseApproval!.packageId = "package.synthetic.other";
    refreshPackageChecksum(candidate);

    await expect(harness.installer.installCandidate(candidate)).resolves.toMatchObject({
      status: "rejected",
      reason: "wrong-package",
    });
    await expect(harness.repository.loadPackage()).resolves.toMatchObject({ status: "missing" });
  });

  it("atomically replaces an older valid package with a newer valid package", async () => {
    const harness = createHarness();
    await harness.installer.installCandidate(packageVersion("1.0.0"));
    await expect(harness.installer.installCandidate(packageVersion("1.1.0"))).resolves.toEqual({
      status: "activated",
      packageVersion: "1.1.0",
    });
    await expect(harness.repository.loadPackage()).resolves.toMatchObject({
      status: "ready",
      protocolPackage: { manifest: { packageVersion: "1.1.0" } },
    });
  });

  it("rejects package replay, package downgrade, and protocol-content downgrade", async () => {
    const harness = createHarness();
    await harness.installer.installCandidate(packageVersion("1.1.0"));

    await expect(harness.installer.installCandidate(packageVersion("1.1.0"))).resolves.toMatchObject({
      status: "rejected",
      reason: "downgrade-or-replay",
    });
    await expect(harness.installer.installCandidate(packageVersion("1.0.0"))).resolves.toMatchObject({
      status: "rejected",
      reason: "downgrade-or-replay",
    });

    const activeV2 = packageVersion("2.0.0");
    activeV2.protocols[0]!.contentVersion = "2.0.0";
    activeV2.manifest.protocolIndex[0]!.contentVersion = "2.0.0";
    activeV2.protocols[0]!.clinicalReviews[0]!.contentVersion = "2.0.0";
    activeV2.protocols[0]!.clinicalApproval!.contentVersion = "2.0.0";
    activeV2.protocols[0]!.technicalValidation!.contentVersion = "2.0.0";
    activeV2.protocols[0]!.releaseApproval!.contentVersion = "2.0.0";
    const activeV2ContentChecksum = computeSha256Checksum(canonicalProtocolContentForTest(activeV2.protocols[0]!));
    activeV2.protocols[0]!.clinicalReviews[0]!.contentChecksum = activeV2ContentChecksum;
    activeV2.protocols[0]!.clinicalApproval!.contentChecksum = activeV2ContentChecksum;
    activeV2.protocols[0]!.technicalValidation!.contentChecksum = activeV2ContentChecksum;
    activeV2.protocols[0]!.releaseApproval!.contentChecksum = activeV2ContentChecksum;
    refreshPackageChecksum(activeV2);

    const secondHarness = createHarness();
    await expect(secondHarness.installer.installCandidate(activeV2)).resolves.toMatchObject({ status: "activated" });
    await expect(secondHarness.installer.installCandidate(packageVersion("3.0.0"))).resolves.toMatchObject({
      status: "rejected",
      reason: "protocol-downgrade",
    });
  });

  it("does not fall back to an older slot when the newest active slot is invalid", async () => {
    const harness = createHarness();
    await harness.installer.installCandidate(packageVersion("1.0.0"));
    await harness.installer.installCandidate(packageVersion("1.1.0"));
    harness.fileSystem.activeFiles.set(`${PACKAGE_ID}--1.1.0.json`, "corrupt-newest-slot");

    await expect(harness.repository.loadPackage()).resolves.toMatchObject({ status: "invalid" });
  });

  it("does not fall back when the active slot or activation record is deleted", async () => {
    const missingSlot = createHarness();
    await missingSlot.installer.installCandidate(packageVersion("1.0.0"));
    await missingSlot.installer.installCandidate(packageVersion("1.1.0"));
    missingSlot.fileSystem.activeFiles.delete(`${PACKAGE_ID}--1.1.0.json`);
    await expect(missingSlot.repository.loadPackage()).resolves.toMatchObject({ status: "storage-error" });

    const missingRecord = createHarness();
    await missingRecord.installer.installCandidate(packageVersion("1.0.0"));
    missingRecord.fileSystem.activationRecord = null;
    await expect(missingRecord.repository.loadPackage()).resolves.toMatchObject({ status: "storage-error" });
  });
});
