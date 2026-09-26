import { productionDirectory } from "./productionDirectory";
import type { DirectorySnapshot, EmergencyDirectoryEntry } from "./types";

export function getBundledDirectorySnapshot(): DirectorySnapshot {
  return productionDirectory;
}

export const MVP_SAMU_SERVICE_ID = "service.cm.samu.119";

export function canOpenSystemDialer(entry: EmergencyDirectoryEntry): entry is EmergencyDirectoryEntry & { phoneNumber: string } {
  return entry.dataOrigin === "production"
    && entry.verification.status === "verified"
    && entry.verification.verifiedAt !== null
    && entry.verification.verifiedBy?.actorType === "human"
    && typeof entry.phoneNumber === "string"
    && /^\+?[0-9][0-9 -]{2,}$/.test(entry.phoneNumber);
}
