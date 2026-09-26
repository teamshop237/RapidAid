import {
  Sha256IntegrityVerifier,
  ValidatedOfflineProtocolRepository,
  type OfflineProtocolRepository,
  type ProtocolPackage,
  type SignatureVerifier,
} from "@rapidaid/protocol-engine";

import { bundledSyntheticPackage } from "@/protocols/bundledSyntheticPackage";

const syntheticSignatureVerifier: SignatureVerifier = {
  verifyEd25519: async (_payload, keyId, signature) => (
    keyId === "key.synthetic.mobile.alpha"
    && signature.startsWith("SYNTHETIC-ED25519-NOT-REAL:")
  ),
};

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function cloneBundledSyntheticPackage(): ProtocolPackage {
  return cloneJson(bundledSyntheticPackage);
}

export function createSyntheticTestProtocolRepository(
  storedPackage: unknown = bundledSyntheticPackage,
): OfflineProtocolRepository {
  return new ValidatedOfflineProtocolRepository({
    store: { readPackage: async () => cloneJson(storedPackage) },
    integrityVerifier: new Sha256IntegrityVerifier(),
    signatureVerifier: syntheticSignatureVerifier,
  });
}
