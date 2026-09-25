import { Protocol, ProtocolPackage } from "./schema.js";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function normalizeJson(value: unknown): JsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) return value.map(normalizeJson);
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.keys(record).sort().reduce<Record<string, JsonValue>>((normalized, key) => {
      if (record[key] !== undefined) normalized[key] = normalizeJson(record[key]);
      return normalized;
    }, {});
  }
  throw new Error("Protocol packages may contain only JSON-compatible values.");
}

export function canonicalizeJson(value: unknown): string {
  return JSON.stringify(normalizeJson(value));
}

export function canonicalizePackagePayload(protocolPackage: ProtocolPackage): string {
  const { integrity: _integrity, signature: _signature, ...signedManifest } = protocolPackage.manifest;
  return canonicalizeJson({ manifest: signedManifest, protocols: protocolPackage.protocols });
}

export function canonicalizeProtocolContent(protocol: Protocol): string {
  const {
    publicationState: _publicationState,
    clinicalReviews: _clinicalReviews,
    clinicalApproval: _clinicalApproval,
    technicalValidation: _technicalValidation,
    releaseApproval: _releaseApproval,
    retirement: _retirement,
    ...approvedContent
  } = protocol;
  return canonicalizeJson(approvedContent);
}

export type IntegrityVerifier = {
  verifySha256: (canonicalPayload: string, expectedChecksum: string) => Promise<boolean>;
};

export type SignatureVerifier = {
  verifyEd25519: (canonicalPayload: string, keyId: string, signature: string) => Promise<boolean>;
};
