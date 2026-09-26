import type {
  DirectorySnapshot,
  EmergencyServiceCategory,
  HumanDirectoryVerifier,
  LocalizedDirectoryText,
  VerificationMetadata,
} from "./types";

const DOCUMENT_KEYS = ["schemaVersion", "datasetVersion", "region", "emergencyServices"] as const;
const EMERGENCY_KEYS = ["id", "serviceName", "category", "phoneNumber", "address", "geographicCoverage", "verification"] as const;
const VERIFICATION_KEYS = ["status", "source", "verifiedAt", "verifiedBy"] as const;
const SOURCE_KEYS = ["label", "locator"] as const;
const VERIFIER_KEYS = ["actorId", "displayName", "actorType"] as const;
const LOCALIZED_KEYS = ["en", "fr"] as const;
const EMERGENCY_CATEGORIES = new Set<EmergencyServiceCategory>(["medical", "fire-rescue", "police"]);
const PRODUCTION_STATUSES = new Set(["verified", "verification-due", "unverified"] as const);
const STABLE_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const PHONE_NUMBER = /^\+?[0-9][0-9 -]{2,}$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const SYNTHETIC_MARKER = /(?:synthetic|demo only|test only|not real)/i;

type ProductionStatus = "verified" | "verification-due" | "unverified";

export type DirectoryValidationResult =
  | Readonly<{ ok: true; snapshot: DirectorySnapshot }>
  | Readonly<{ ok: false; errors: readonly string[] }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRecord(
  value: unknown,
  path: string,
  allowedKeys: readonly string[],
  errors: string[],
): Record<string, unknown> | null {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
    return null;
  }

  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) errors.push(`${path}.${key} is not an allowed field.`);
  }
  for (const key of allowedKeys) {
    if (!(key in value)) errors.push(`${path}.${key} is required.`);
  }
  return value;
}

function readString(value: unknown, path: string, errors: string[]): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${path} must be a non-empty string.`);
    return null;
  }
  return value.trim();
}

function readLocalizedText(value: unknown, path: string, errors: string[]): LocalizedDirectoryText | null {
  const record = readRecord(value, path, LOCALIZED_KEYS, errors);
  if (!record) return null;
  const en = readString(record.en, `${path}.en`, errors);
  const fr = readString(record.fr, `${path}.fr`, errors);
  if (!en || !fr) return null;
  return { en, fr };
}

function readNullableLocalizedText(value: unknown, path: string, errors: string[]): LocalizedDirectoryText | null {
  if (value === null) return null;
  return readLocalizedText(value, path, errors);
}

function readNullablePhone(value: unknown, path: string, errors: string[]): string | null {
  if (value === null) return null;
  const phoneNumber = readString(value, path, errors);
  if (phoneNumber && !PHONE_NUMBER.test(phoneNumber)) {
    errors.push(`${path} must contain only a leading +, digits, spaces, or hyphens.`);
    return null;
  }
  return phoneNumber;
}

function readIsoTimestamp(value: unknown, path: string, errors: string[]): string | null {
  const timestamp = readString(value, path, errors);
  if (timestamp) {
    const parsed = Date.parse(timestamp);
    const normalized = Number.isFinite(parsed) ? new Date(parsed).toISOString() : "";
    const normalizedInput = timestamp.endsWith("Z") && !timestamp.includes(".")
      ? timestamp.replace("Z", ".000Z")
      : timestamp;
    if (!ISO_TIMESTAMP.test(timestamp) || normalized !== normalizedInput) {
      errors.push(`${path} must be a valid UTC ISO-8601 timestamp.`);
      return null;
    }
  }
  return timestamp;
}

function readVerifier(value: unknown, path: string, errors: string[]): HumanDirectoryVerifier | null {
  const record = readRecord(value, path, VERIFIER_KEYS, errors);
  if (!record) return null;
  const actorId = readString(record.actorId, `${path}.actorId`, errors);
  const displayName = readString(record.displayName, `${path}.displayName`, errors);
  if (record.actorType !== "human") errors.push(`${path}.actorType must be "human"; agents and services cannot verify records.`);
  if (!actorId || !displayName || record.actorType !== "human") return null;
  return { actorId, displayName, actorType: "human" };
}

function readVerification(value: unknown, path: string, errors: string[]): VerificationMetadata | null {
  const record = readRecord(value, path, VERIFICATION_KEYS, errors);
  if (!record) return null;

  const status = record.status;
  if (typeof status !== "string" || !PRODUCTION_STATUSES.has(status as ProductionStatus)) {
    errors.push(`${path}.status must be "verified", "verification-due", or "unverified".`);
    return null;
  }

  const source = readRecord(record.source, `${path}.source`, SOURCE_KEYS, errors);
  const label = source ? readLocalizedText(source.label, `${path}.source.label`, errors) : null;
  const locator = source ? readString(source.locator, `${path}.source.locator`, errors) : null;
  if (locator && (!locator.startsWith("https://") || locator.includes("example.invalid"))) {
    errors.push(`${path}.source.locator must be a non-placeholder HTTPS authoritative source.`);
  }

  let verifiedAt: string | null = null;
  let verifiedBy: HumanDirectoryVerifier | null = null;
  if (status === "unverified") {
    if (record.verifiedAt !== null) errors.push(`${path}.verifiedAt must be null while status is unverified.`);
    if (record.verifiedBy !== null) errors.push(`${path}.verifiedBy must be null while status is unverified.`);
  } else {
    verifiedAt = readIsoTimestamp(record.verifiedAt, `${path}.verifiedAt`, errors);
    verifiedBy = readVerifier(record.verifiedBy, `${path}.verifiedBy`, errors);
  }

  if (!label || !locator || !locator.startsWith("https://") || locator.includes("example.invalid")) return null;
  if (status !== "unverified" && (!verifiedAt || !verifiedBy)) return null;

  return {
    status: status as ProductionStatus,
    source: { label, locator },
    verifiedAt,
    verifiedBy,
  };
}

function validateProductionText(value: string, path: string, errors: string[]): void {
  if (SYNTHETIC_MARKER.test(value)) errors.push(`${path} contains a development-only marker and cannot ship as production data.`);
}

function validateLocalizedProductionText(value: LocalizedDirectoryText, path: string, errors: string[]): void {
  validateProductionText(value.en, `${path}.en`, errors);
  validateProductionText(value.fr, `${path}.fr`, errors);
}

function readEmergencyService(value: unknown, index: number, errors: string[]): DirectorySnapshot["emergencyServices"][number] | null {
  const path = `emergencyServices[${index}]`;
  const record = readRecord(value, path, EMERGENCY_KEYS, errors);
  if (!record) return null;
  const id = readString(record.id, `${path}.id`, errors);
  const serviceName = readLocalizedText(record.serviceName, `${path}.serviceName`, errors);
  const geographicCoverage = readLocalizedText(record.geographicCoverage, `${path}.geographicCoverage`, errors);
  const phoneNumber = readNullablePhone(record.phoneNumber, `${path}.phoneNumber`, errors);
  const address = readNullableLocalizedText(record.address, `${path}.address`, errors);
  const verification = readVerification(record.verification, `${path}.verification`, errors);
  const category = record.category;

  if (id && !STABLE_ID.test(id)) errors.push(`${path}.id must be a stable lowercase dot-or-hyphen separated ID.`);
  if (typeof category !== "string" || !EMERGENCY_CATEGORIES.has(category as EmergencyServiceCategory)) {
    errors.push(`${path}.category is not a supported emergency-service category.`);
  }
  if (verification?.status === "verified" && phoneNumber === null) {
    errors.push(`${path}.phoneNumber is required before an emergency service can be verified.`);
  }
  if (id) validateProductionText(id, `${path}.id`, errors);
  if (serviceName) validateLocalizedProductionText(serviceName, `${path}.serviceName`, errors);
  if (geographicCoverage) validateLocalizedProductionText(geographicCoverage, `${path}.geographicCoverage`, errors);
  if (address) validateLocalizedProductionText(address, `${path}.address`, errors);

  if (!id || !STABLE_ID.test(id) || !serviceName || !geographicCoverage || !verification
    || typeof category !== "string" || !EMERGENCY_CATEGORIES.has(category as EmergencyServiceCategory)) return null;

  return {
    id,
    dataOrigin: "production",
    serviceName,
    category: category as EmergencyServiceCategory,
    phoneNumber,
    address,
    geographicCoverage,
    verification,
  };
}

export function validateProductionDirectoryDocument(value: unknown): DirectoryValidationResult {
  const errors: string[] = [];
  const document = readRecord(value, "directory", DOCUMENT_KEYS, errors);
  if (!document) return { ok: false, errors };

  if (document.schemaVersion !== "1.0.0") errors.push('directory.schemaVersion must be "1.0.0".');
  if (document.region !== "Douala") errors.push('directory.region must be "Douala" for this pilot.');
  const datasetVersion = readString(document.datasetVersion, "directory.datasetVersion", errors);
  if (datasetVersion) validateProductionText(datasetVersion, "directory.datasetVersion", errors);

  const emergencyServices: DirectorySnapshot["emergencyServices"][number][] = [];
  if (!Array.isArray(document.emergencyServices)) {
    errors.push("directory.emergencyServices must be an array.");
  } else {
    document.emergencyServices.forEach((entry, index) => {
      const parsed = readEmergencyService(entry, index, errors);
      if (parsed) emergencyServices.push(parsed);
    });
  }

  const seenIds = new Set<string>();
  for (const entry of emergencyServices) {
    if (seenIds.has(entry.id)) errors.push(`directory contains duplicate ID "${entry.id}".`);
    seenIds.add(entry.id);
  }

  if (errors.length > 0 || !datasetVersion) return { ok: false, errors };
  return {
    ok: true,
    snapshot: {
      region: "Douala",
      datasetVersion,
      isSynthetic: false,
      emergencyServices,
      careFacilities: [],
    },
  };
}
