import { hashes, verify } from "@noble/ed25519";
import { sha256, sha512 } from "@noble/hashes/sha2.js";

import type { IntegrityVerifier, SignatureVerifier } from "./integrity";

const SHA256_PREFIX = "sha256:";
const ED25519_PREFIX = "ed25519:";
const STABLE_KEY_ID = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;

export type TrustedEd25519PublicKey = Readonly<{
  keyId: string;
  publicKey: string;
  status: "trusted" | "revoked";
}>;

function decodeHex(value: string, expectedBytes: number): Uint8Array | null {
  if (value.length !== expectedBytes * 2 || !/^[a-f0-9]+$/.test(value)) return null;
  const decoded = new Uint8Array(expectedBytes);
  for (let index = 0; index < expectedBytes; index += 1) {
    const byte = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
    if (!Number.isFinite(byte)) return null;
    decoded[index] = byte;
  }
  return decoded;
}

function encodeHex(value: Uint8Array): string {
  let encoded = "";
  for (const byte of value) encoded += byte.toString(16).padStart(2, "0");
  return encoded;
}

export function computeSha256Checksum(canonicalPayload: string): string {
  return `${SHA256_PREFIX}${encodeHex(sha256(new TextEncoder().encode(canonicalPayload)))}`;
}

function constantTimeStringEqual(left: string, right: string): boolean {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

export class Sha256IntegrityVerifier implements IntegrityVerifier {
  async verifySha256(canonicalPayload: string, expectedChecksum: string): Promise<boolean> {
    if (!expectedChecksum.startsWith(SHA256_PREFIX)) return false;
    const expectedHex = expectedChecksum.slice(SHA256_PREFIX.length);
    if (!decodeHex(expectedHex, 32)) return false;

    const actualHex = computeSha256Checksum(canonicalPayload).slice(SHA256_PREFIX.length);
    return constantTimeStringEqual(actualHex, expectedHex);
  }
}

/**
 * Verification-only trust store. It intentionally exposes no signing or private-key API.
 * Public keys and signatures use lowercase hexadecimal encodings with explicit prefixes.
 */
export class TrustedEd25519SignatureVerifier implements SignatureVerifier {
  readonly #keys: ReadonlyMap<string, Readonly<{ publicKey: Uint8Array; status: "trusted" | "revoked" }>>;

  constructor(keys: readonly TrustedEd25519PublicKey[]) {
    const parsedKeys = new Map<string, Readonly<{ publicKey: Uint8Array; status: "trusted" | "revoked" }>>();
    for (const key of keys) {
      if (!STABLE_KEY_ID.test(key.keyId)) throw new Error("Trusted Ed25519 key IDs must be stable lowercase identifiers.");
      if (parsedKeys.has(key.keyId)) throw new Error(`Duplicate trusted Ed25519 key ID: ${key.keyId}`);
      if (!key.publicKey.startsWith(ED25519_PREFIX)) throw new Error(`Invalid Ed25519 public key encoding: ${key.keyId}`);
      const publicKey = decodeHex(key.publicKey.slice(ED25519_PREFIX.length), 32);
      if (!publicKey) throw new Error(`Invalid Ed25519 public key length or encoding: ${key.keyId}`);
      parsedKeys.set(key.keyId, { publicKey, status: key.status });
    }
    this.#keys = parsedKeys;
  }

  async verifyEd25519(canonicalPayload: string, keyId: string, signature: string): Promise<boolean> {
    const key = this.#keys.get(keyId);
    if (!key || key.status !== "trusted" || !signature.startsWith(ED25519_PREFIX)) return false;

    const signatureBytes = decodeHex(signature.slice(ED25519_PREFIX.length), 64);
    if (!signatureBytes) return false;

    try {
      return verify(
        signatureBytes,
        new TextEncoder().encode(canonicalPayload),
        key.publicKey,
        { zip215: false },
      );
    } catch {
      return false;
    }
  }
}

// Noble's synchronous RFC 8032 verifier requires an explicitly supplied SHA-512.
// This module wires only verification; no signing primitive is imported or exported.
hashes.sha512 = sha512;
