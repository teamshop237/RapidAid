import {
  Sha256IntegrityVerifier,
  TrustedEd25519SignatureVerifier,
  ValidatedOfflineProtocolRepository,
  type OfflineProtocolRepository,
  type TrustedEd25519PublicKey,
} from "@rapidaid/protocol-engine";

import { ExpoAtomicProtocolFileSystem } from "./expoProtocolFileSystem";
import {
  PersistentOfflineProtocolPackageStore,
  TrustedOfflinePackageInstaller,
  type AtomicProtocolFileSystem,
} from "./persistentProtocolStore";

const MOBILE_PROTOCOL_PACKAGE_ID = "package.synthetic.mobile.alpha";

// Deliberately empty until a human-controlled release process provisions a real
// production public key. Unknown keys fail closed; no test key is trusted here.
const trustedProtocolPublicKeys: readonly TrustedEd25519PublicKey[] = [];

export type TrustedMobileProtocolInfrastructure = {
  repository: OfflineProtocolRepository;
  installer: TrustedOfflinePackageInstaller;
};

export function createTrustedMobileProtocolInfrastructure(
  fileSystem: AtomicProtocolFileSystem = new ExpoAtomicProtocolFileSystem(),
  publicKeys: readonly TrustedEd25519PublicKey[] = trustedProtocolPublicKeys,
): TrustedMobileProtocolInfrastructure {
  const store = new PersistentOfflineProtocolPackageStore(fileSystem, MOBILE_PROTOCOL_PACKAGE_ID);
  const integrityVerifier = new Sha256IntegrityVerifier();
  const signatureVerifier = new TrustedEd25519SignatureVerifier(publicKeys);

  return {
    repository: new ValidatedOfflineProtocolRepository({
      store,
      integrityVerifier,
      signatureVerifier,
    }),
    installer: new TrustedOfflinePackageInstaller({
      store,
      integrityVerifier,
      signatureVerifier,
      expectedPackageId: MOBILE_PROTOCOL_PACKAGE_ID,
    }),
  };
}

export function createTrustedMobileProtocolRepository(): OfflineProtocolRepository {
  return createTrustedMobileProtocolInfrastructure().repository;
}
