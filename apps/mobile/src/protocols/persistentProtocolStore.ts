import {
  ValidatedOfflineProtocolRepository,
  type IntegrityVerifier,
  type OfflinePackageFailure,
  type OfflineProtocolPackageStore,
  type ProtocolPackage,
  type SignatureVerifier,
} from "@rapidaid/protocol-engine";

export interface AtomicProtocolFileSystem {
  initialize(): Promise<void>;
  listActiveFileNames(): Promise<readonly string[]>;
  readActiveFile(fileName: string): Promise<string>;
  readActivationRecord(): Promise<string | null>;
  writeCandidateAtomically(serializedPackage: string): Promise<void>;
  readCandidateFile(): Promise<string | null>;
  activateCandidate(fileName: string, serializedActivationRecord: string): Promise<void>;
  discardCandidate(): Promise<void>;
}

export type CandidateInstallResult =
  | { status: "activated"; packageVersion: string }
  | { status: "rejected"; reason: "invalid-candidate" | "wrong-package" | "downgrade-or-replay" | "protocol-downgrade"; failure?: OfflinePackageFailure }
  | { status: "storage-error" };

type StoredActiveDescriptor = {
  fileName: string;
  packageVersion: string;
};

type ActivationRecord = StoredActiveDescriptor & {
  formatVersion: 1;
  packageId: string;
};

function compareSemanticVersions(left: string, right: string): number {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = leftParts[index]! - rightParts[index]!;
    if (difference !== 0) return difference;
  }
  return 0;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safelyParse(serialized: string): unknown {
  try {
    return JSON.parse(serialized) as unknown;
  } catch {
    return serialized;
  }
}

export class PersistentOfflineProtocolPackageStore implements OfflineProtocolPackageStore {
  readonly #fileSystem: AtomicProtocolFileSystem;
  readonly #packageId: string;
  readonly #activeFilePattern: RegExp;

  constructor(fileSystem: AtomicProtocolFileSystem, packageId: string) {
    this.#fileSystem = fileSystem;
    this.#packageId = packageId;
    this.#activeFilePattern = new RegExp(`^${escapeRegExp(packageId)}--(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.json$`);
  }

  async readPackage(): Promise<unknown | null> {
    const descriptor = await this.getActiveDescriptor();
    if (!descriptor) return null;

    const serialized = await this.#fileSystem.readActiveFile(descriptor.fileName);
    const parsed = safelyParse(serialized);
    if (typeof parsed !== "object" || parsed === null) return parsed;

    const manifest = (parsed as { manifest?: unknown }).manifest;
    if (typeof manifest !== "object" || manifest === null) return parsed;
    const { packageId, packageVersion } = manifest as { packageId?: unknown; packageVersion?: unknown };
    if (packageId !== this.#packageId || packageVersion !== descriptor.packageVersion) {
      return { storageEnvelopeMismatch: true };
    }
    return parsed;
  }

  async getActiveDescriptor(): Promise<StoredActiveDescriptor | null> {
    await this.#fileSystem.initialize();
    const fileNames = await this.#fileSystem.listActiveFileNames();
    if (fileNames.some((fileName) => !this.#activeFilePattern.test(fileName))) {
      throw new Error("Offline protocol active storage contains an unexpected entry.");
    }

    const serializedRecord = await this.#fileSystem.readActivationRecord();
    if (serializedRecord === null) {
      if (fileNames.length === 0) return null;
      throw new Error("Offline protocol activation record is missing.");
    }

    const record = safelyParse(serializedRecord) as Partial<ActivationRecord>;
    if (
      typeof record !== "object"
      || record === null
      || record.formatVersion !== 1
      || record.packageId !== this.#packageId
      || typeof record.fileName !== "string"
      || typeof record.packageVersion !== "string"
    ) {
      throw new Error("Offline protocol activation record is invalid.");
    }
    const match = this.#activeFilePattern.exec(record.fileName);
    if (!match || `${match[1]}.${match[2]}.${match[3]}` !== record.packageVersion) {
      throw new Error("Offline protocol activation record does not match its immutable slot.");
    }
    if (!fileNames.includes(record.fileName)) {
      throw new Error("Offline protocol activation record points to a missing package.");
    }
    return { fileName: record.fileName, packageVersion: record.packageVersion };
  }

  async stageCandidate(candidate: unknown): Promise<void> {
    const serialized = JSON.stringify(candidate);
    if (serialized === undefined) throw new Error("Candidate package is not JSON serializable.");
    await this.#fileSystem.initialize();
    await this.#fileSystem.writeCandidateAtomically(serialized);
  }

  async readCandidatePackage(): Promise<unknown | null> {
    await this.#fileSystem.initialize();
    const serialized = await this.#fileSystem.readCandidateFile();
    return serialized === null ? null : safelyParse(serialized);
  }

  async activateCandidate(packageVersion: string): Promise<void> {
    const fileName = `${this.#packageId}--${packageVersion}.json`;
    const activationRecord: ActivationRecord = {
      formatVersion: 1,
      packageId: this.#packageId,
      packageVersion,
      fileName,
    };
    await this.#fileSystem.activateCandidate(fileName, JSON.stringify(activationRecord));
  }

  async discardCandidate(): Promise<void> {
    await this.#fileSystem.discardCandidate();
  }
}

type InstallerOptions = {
  store: PersistentOfflineProtocolPackageStore;
  integrityVerifier: IntegrityVerifier;
  signatureVerifier: SignatureVerifier;
  expectedPackageId: string;
  now?: () => Date;
};

function hasProtocolDowngrade(active: ProtocolPackage, candidate: ProtocolPackage): boolean {
  const candidateVersions = new Map(candidate.protocols.map((protocol) => [protocol.protocolId, protocol.contentVersion]));
  return active.protocols.some((protocol) => {
    const candidateVersion = candidateVersions.get(protocol.protocolId);
    return !candidateVersion || compareSemanticVersions(candidateVersion, protocol.contentVersion) < 0;
  });
}

export class TrustedOfflinePackageInstaller {
  readonly #options: InstallerOptions;
  #queue: Promise<void> = Promise.resolve();

  constructor(options: InstallerOptions) {
    this.#options = options;
  }

  installCandidate(candidate: unknown): Promise<CandidateInstallResult> {
    const operation = this.#queue.then(() => this.#installCandidate(candidate));
    this.#queue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  async #installCandidate(candidate: unknown): Promise<CandidateInstallResult> {
    const { store, integrityVerifier, signatureVerifier, expectedPackageId, now } = this.#options;
    try {
      await store.stageCandidate(candidate);
    } catch {
      return { status: "storage-error" };
    }

    const candidateRepository = new ValidatedOfflineProtocolRepository({
      store: { readPackage: () => store.readCandidatePackage() },
      integrityVerifier,
      signatureVerifier,
      now,
    });
    const candidateResult = await candidateRepository.loadPackage();
    if (candidateResult.status !== "ready") {
      try {
        await store.discardCandidate();
      } catch {
        return { status: "storage-error" };
      }
      return { status: "rejected", reason: "invalid-candidate", failure: candidateResult };
    }

    const candidatePackage = candidateResult.protocolPackage;
    if (candidatePackage.manifest.packageId !== expectedPackageId) {
      await this.#discardBestEffort();
      return { status: "rejected", reason: "wrong-package" };
    }

    let activeDescriptor: StoredActiveDescriptor | null;
    try {
      activeDescriptor = await store.getActiveDescriptor();
    } catch {
      await this.#discardBestEffort();
      return { status: "storage-error" };
    }
    if (activeDescriptor && compareSemanticVersions(candidatePackage.manifest.packageVersion, activeDescriptor.packageVersion) <= 0) {
      await this.#discardBestEffort();
      return { status: "rejected", reason: "downgrade-or-replay" };
    }

    const activeRepository = new ValidatedOfflineProtocolRepository({
      store,
      integrityVerifier,
      signatureVerifier,
      now,
    });
    const activeResult = await activeRepository.loadPackage();
    if (activeResult.status === "ready" && hasProtocolDowngrade(activeResult.protocolPackage, candidatePackage)) {
      await this.#discardBestEffort();
      return { status: "rejected", reason: "protocol-downgrade" };
    }

    try {
      await store.activateCandidate(candidatePackage.manifest.packageVersion);
      return { status: "activated", packageVersion: candidatePackage.manifest.packageVersion };
    } catch {
      await this.#discardBestEffort();
      return { status: "storage-error" };
    }
  }

  async #discardBestEffort(): Promise<void> {
    try {
      await this.#options.store.discardCandidate();
    } catch {
      // The candidate remains isolated and can never replace active content in place.
    }
  }
}
