import { Directory, File, Paths } from "expo-file-system";

import type { AtomicProtocolFileSystem } from "./persistentProtocolStore";

const CANDIDATE_TEMP_FILE = "candidate.tmp";
const CANDIDATE_READY_FILE = "candidate.json";
const ACTIVATION_TEMP_FILE = "active-record.tmp";
const ACTIVATION_RECORD_FILE = "active-record.json";

export class ExpoAtomicProtocolFileSystem implements AtomicProtocolFileSystem {
  readonly #root: Directory;
  readonly #active: Directory;
  readonly #candidate: Directory;

  constructor(root: Directory = new Directory(Paths.document, "rapidaid", "protocol-packages")) {
    this.#root = root;
    this.#active = new Directory(root, "active");
    this.#candidate = new Directory(root, "candidate");
  }

  async initialize(): Promise<void> {
    this.#root.create({ idempotent: true, intermediates: true });
    this.#active.create({ idempotent: true });
    this.#candidate.create({ idempotent: true });
  }

  async listActiveFileNames(): Promise<readonly string[]> {
    return this.#active.list().map((entry) => entry.name);
  }

  async readActiveFile(fileName: string): Promise<string> {
    return new File(this.#active, fileName).text();
  }

  async readActivationRecord(): Promise<string | null> {
    const record = new File(this.#root, ACTIVATION_RECORD_FILE);
    return record.exists ? record.text() : null;
  }

  async writeCandidateAtomically(serializedPackage: string): Promise<void> {
    const temporary = new File(this.#candidate, CANDIDATE_TEMP_FILE);
    const ready = new File(this.#candidate, CANDIDATE_READY_FILE);
    if (temporary.exists) temporary.delete();
    if (ready.exists) ready.delete();

    temporary.create();
    temporary.write(serializedPackage);
    if (await temporary.text() !== serializedPackage) {
      temporary.delete();
      throw new Error("Candidate package write verification failed.");
    }
    await temporary.move(ready);
  }

  async readCandidateFile(): Promise<string | null> {
    const candidate = new File(this.#candidate, CANDIDATE_READY_FILE);
    return candidate.exists ? candidate.text() : null;
  }

  async activateCandidate(fileName: string, serializedActivationRecord: string): Promise<void> {
    const candidate = new File(this.#candidate, CANDIDATE_READY_FILE);
    if (!candidate.exists) throw new Error("No complete candidate package is available for activation.");
    const destination = new File(this.#active, fileName);
    if (destination.exists) {
      if (await destination.text() !== await candidate.text()) {
        throw new Error("An immutable active slot already exists with different content.");
      }
      candidate.delete();
    } else {
      await candidate.move(destination);
    }

    const temporaryRecord = new File(this.#root, ACTIVATION_TEMP_FILE);
    const activeRecord = new File(this.#root, ACTIVATION_RECORD_FILE);
    if (temporaryRecord.exists) temporaryRecord.delete();
    temporaryRecord.create();
    temporaryRecord.write(serializedActivationRecord);
    if (await temporaryRecord.text() !== serializedActivationRecord) {
      temporaryRecord.delete();
      throw new Error("Activation record write verification failed.");
    }
    await temporaryRecord.move(activeRecord, { overwrite: true });
  }

  async discardCandidate(): Promise<void> {
    const temporary = new File(this.#candidate, CANDIDATE_TEMP_FILE);
    const ready = new File(this.#candidate, CANDIDATE_READY_FILE);
    if (temporary.exists) temporary.delete();
    if (ready.exists) ready.delete();
  }
}
