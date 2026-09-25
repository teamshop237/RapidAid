export const SUPPORTED_PROTOCOL_SCHEMA_VERSION = "1.0.0";

export type SemanticVersion = {
  major: number;
  minor: number;
  patch: number;
};

const semanticVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function parseSemanticVersion(version: string): SemanticVersion | null {
  const match = semanticVersionPattern.exec(version);
  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function isSchemaVersionCompatible(
  candidate: string,
  supported = SUPPORTED_PROTOCOL_SCHEMA_VERSION,
): boolean {
  const candidateVersion = parseSemanticVersion(candidate);
  const supportedVersion = parseSemanticVersion(supported);
  if (!candidateVersion || !supportedVersion) return false;

  return candidateVersion.major === supportedVersion.major
    && candidateVersion.minor <= supportedVersion.minor;
}
