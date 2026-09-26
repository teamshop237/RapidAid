import { isSchemaVersionCompatible } from "./compatibility";
import {
  canonicalizePackagePayload,
  canonicalizeProtocolContent,
  IntegrityVerifier,
  SignatureVerifier,
} from "./integrity";
import { Protocol, ProtocolPackage, protocolPackageSchema } from "./schema";
import { ProtocolReadinessIssue, validateProtocolForProduction } from "./validation";

export type OfflinePackageFailureStatus =
  | "missing"
  | "storage-error"
  | "invalid"
  | "incompatible"
  | "not-effective"
  | "expired"
  | "retired"
  | "unapproved"
  | "integrity-failed"
  | "signature-invalid";

export type OfflinePackageFailure = {
  status: OfflinePackageFailureStatus;
  message: string;
  issues?: readonly ProtocolReadinessIssue[];
};

export type OfflinePackageLoadResult =
  | { status: "ready"; protocolPackage: ProtocolPackage }
  | OfflinePackageFailure;

export type OfflineProtocolLoadResult =
  | { status: "ready"; protocol: Protocol; packageVersion: string }
  | { status: "not-found"; message: string }
  | OfflinePackageFailure;

export interface OfflineProtocolPackageStore {
  readPackage(): Promise<unknown | null>;
}

export interface OfflineProtocolRepository {
  loadPackage(): Promise<OfflinePackageLoadResult>;
  getProtocol(protocolId: string): Promise<OfflineProtocolLoadResult>;
}

export type OfflineProtocolRepositoryOptions = {
  store: OfflineProtocolPackageStore;
  integrityVerifier: IntegrityVerifier;
  signatureVerifier: SignatureVerifier;
  now?: () => Date;
};

function packageDateFailure(protocolPackage: ProtocolPackage, now: Date): OfflinePackageFailure | null {
  const { manifest } = protocolPackage;
  const timestamp = now.getTime();
  if (Date.parse(manifest.effectiveAt) > timestamp) {
    return { status: "not-effective", message: "Offline protocol package is not effective yet." };
  }
  if (Date.parse(manifest.reviewDueAt) <= timestamp || (manifest.expiresAt && Date.parse(manifest.expiresAt) <= timestamp)) {
    return { status: "expired", message: "Offline protocol package review or expiration date has passed." };
  }
  return null;
}

export class ValidatedOfflineProtocolRepository implements OfflineProtocolRepository {
  readonly #store: OfflineProtocolPackageStore;
  readonly #integrityVerifier: IntegrityVerifier;
  readonly #signatureVerifier: SignatureVerifier;
  readonly #now: () => Date;

  constructor(options: OfflineProtocolRepositoryOptions) {
    this.#store = options.store;
    this.#integrityVerifier = options.integrityVerifier;
    this.#signatureVerifier = options.signatureVerifier;
    this.#now = options.now ?? (() => new Date());
  }

  async loadPackage(): Promise<OfflinePackageLoadResult> {
    let storedPackage: unknown | null;
    try {
      storedPackage = await this.#store.readPackage();
    } catch {
      return { status: "storage-error", message: "Offline protocol storage could not be read." };
    }
    if (storedPackage === null) {
      return { status: "missing", message: "No offline protocol package is installed." };
    }

    const parsed = protocolPackageSchema.safeParse(storedPackage);
    if (!parsed.success) {
      return { status: "invalid", message: "Offline protocol package failed schema validation." };
    }
    const protocolPackage = parsed.data;
    if (!isSchemaVersionCompatible(protocolPackage.manifest.schemaVersion)
      || protocolPackage.protocols.some((protocol) => !isSchemaVersionCompatible(protocol.schemaVersion))) {
      return { status: "incompatible", message: "Offline protocol package uses an unsupported schema version." };
    }

    const dateFailure = packageDateFailure(protocolPackage, this.#now());
    if (dateFailure) return dateFailure;

    const canonicalPayload = canonicalizePackagePayload(protocolPackage);
    try {
      if (!await this.#integrityVerifier.verifySha256(canonicalPayload, protocolPackage.manifest.integrity.checksum)) {
        return { status: "integrity-failed", message: "Offline protocol package checksum did not match." };
      }
    } catch {
      return { status: "integrity-failed", message: "Offline protocol package checksum could not be verified." };
    }

    if (protocolPackage.manifest.releaseState === "retired") {
      return { status: "retired", message: "Offline protocol package has been retired." };
    }
    const releaseApproval = protocolPackage.manifest.releaseApproval;
    if (protocolPackage.manifest.releaseState !== "released" || !releaseApproval) {
      return { status: "unapproved", message: "Offline protocol package has not received human release approval." };
    }
    if (releaseApproval.packageId !== protocolPackage.manifest.packageId
      || releaseApproval.packageVersion !== protocolPackage.manifest.packageVersion) {
      return { status: "unapproved", message: "Package release approval does not match this package version." };
    }

    const signature = protocolPackage.manifest.signature;
    if (!signature) {
      return { status: "signature-invalid", message: "Released offline protocol package has no signature." };
    }
    try {
      if (!await this.#signatureVerifier.verifyEd25519(canonicalPayload, signature.keyId, signature.value)) {
        return { status: "signature-invalid", message: "Offline protocol package signature was rejected." };
      }
    } catch {
      return { status: "signature-invalid", message: "Offline protocol package signature could not be verified." };
    }

    for (const protocol of protocolPackage.protocols) {
      const readiness = validateProtocolForProduction(protocol, this.#now());
      if (!readiness.ready) {
        const status = readiness.issues.some((issue) => issue.code === "expired")
          ? "expired"
          : readiness.issues.some((issue) => issue.code === "not-effective")
            ? "not-effective"
            : readiness.issues.some((issue) => issue.code === "incompatible")
              ? "incompatible"
              : "unapproved";
        return { status, message: "Packaged protocol is not production-ready.", issues: readiness.issues };
      }

      const clinicalApproval = protocol.clinicalApproval;
      if (!clinicalApproval) {
        return { status: "unapproved", message: "Packaged protocol has no clinical approval." };
      }
      try {
        if (!await this.#integrityVerifier.verifySha256(
          canonicalizeProtocolContent(protocol),
          clinicalApproval.contentChecksum,
        )) {
          return {
            status: "unapproved",
            message: "Clinical approval does not match the packaged protocol content.",
            issues: [{ code: "content-binding", message: "Clinical approval content checksum did not match." }],
          };
        }
      } catch {
        return {
          status: "unapproved",
          message: "Clinical approval content binding could not be verified.",
          issues: [{ code: "content-binding", message: "Clinical approval content checksum could not be verified." }],
        };
      }
    }

    return { status: "ready", protocolPackage };
  }

  async getProtocol(protocolId: string): Promise<OfflineProtocolLoadResult> {
    const packageResult = await this.loadPackage();
    if (packageResult.status !== "ready") return packageResult;

    const protocol = packageResult.protocolPackage.protocols.find((candidate) => candidate.protocolId === protocolId);
    if (!protocol) return { status: "not-found", message: "Requested protocol is not installed." };
    return { status: "ready", protocol, packageVersion: packageResult.protocolPackage.manifest.packageVersion };
  }
}

export class InMemoryOfflineProtocolPackageStore implements OfflineProtocolPackageStore {
  #storedPackage: unknown | null;

  constructor(storedPackage: unknown | null = null) {
    this.#storedPackage = storedPackage;
  }

  async readPackage(): Promise<unknown | null> {
    return this.#storedPackage;
  }

  setPackage(storedPackage: unknown | null): void {
    this.#storedPackage = storedPackage;
  }
}
