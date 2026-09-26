import { describe, expect, it } from "vitest";

import {
  Sha256IntegrityVerifier,
  TrustedEd25519SignatureVerifier,
} from "../src/index";

// RFC 8032 test vector 1. Only the public key and signature are retained here.
const RFC8032_PUBLIC_KEY = "ed25519:d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
const RFC8032_EMPTY_MESSAGE_SIGNATURE = "ed25519:e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e06522490155"+
  "5fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b";

describe("trusted verification", () => {
  it("verifies an RFC 8032 Ed25519 signature using a trusted public key", async () => {
    const verifier = new TrustedEd25519SignatureVerifier([{
      keyId: "key.synthetic.rfc8032.one",
      publicKey: RFC8032_PUBLIC_KEY,
      status: "trusted",
    }]);

    await expect(verifier.verifyEd25519(
      "",
      "key.synthetic.rfc8032.one",
      RFC8032_EMPTY_MESSAGE_SIGNATURE,
    )).resolves.toBe(true);
  });

  it("fails closed for modified payloads and malformed signatures", async () => {
    const verifier = new TrustedEd25519SignatureVerifier([{
      keyId: "key.synthetic.rfc8032.one",
      publicKey: RFC8032_PUBLIC_KEY,
      status: "trusted",
    }]);

    await expect(verifier.verifyEd25519(
      "modified",
      "key.synthetic.rfc8032.one",
      RFC8032_EMPTY_MESSAGE_SIGNATURE,
    )).resolves.toBe(false);
    await expect(verifier.verifyEd25519("", "key.synthetic.rfc8032.one", "not-a-signature")).resolves.toBe(false);
  });

  it("rejects unknown and revoked key IDs while allowing key rotation", async () => {
    const verifier = new TrustedEd25519SignatureVerifier([
      {
        keyId: "key.synthetic.revoked",
        publicKey: RFC8032_PUBLIC_KEY,
        status: "revoked",
      },
      {
        keyId: "key.synthetic.current",
        publicKey: RFC8032_PUBLIC_KEY,
        status: "trusted",
      },
    ]);

    await expect(verifier.verifyEd25519("", "key.synthetic.unknown", RFC8032_EMPTY_MESSAGE_SIGNATURE)).resolves.toBe(false);
    await expect(verifier.verifyEd25519("", "key.synthetic.revoked", RFC8032_EMPTY_MESSAGE_SIGNATURE)).resolves.toBe(false);
    await expect(verifier.verifyEd25519("", "key.synthetic.current", RFC8032_EMPTY_MESSAGE_SIGNATURE)).resolves.toBe(true);
  });

  it("rejects duplicate, malformed, and non-stable trust-root definitions", () => {
    expect(() => new TrustedEd25519SignatureVerifier([
      { keyId: "key.synthetic.one", publicKey: RFC8032_PUBLIC_KEY, status: "trusted" },
      { keyId: "key.synthetic.one", publicKey: RFC8032_PUBLIC_KEY, status: "revoked" },
    ])).toThrow(/Duplicate/);
    expect(() => new TrustedEd25519SignatureVerifier([
      { keyId: "KEY INVALID", publicKey: RFC8032_PUBLIC_KEY, status: "trusted" },
    ])).toThrow(/stable lowercase/);
    expect(() => new TrustedEd25519SignatureVerifier([
      { keyId: "key.synthetic.invalid", publicKey: "ed25519:00", status: "trusted" },
    ])).toThrow(/length or encoding/);
  });

  it("computes and compares SHA-256 integrity checksums", async () => {
    const verifier = new Sha256IntegrityVerifier();
    await expect(verifier.verifySha256(
      "abc",
      "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    )).resolves.toBe(true);
    await expect(verifier.verifySha256(
      "abd",
      "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    )).resolves.toBe(false);
    await expect(verifier.verifySha256("abc", "sha256:not-hex")).resolves.toBe(false);
  });
});
