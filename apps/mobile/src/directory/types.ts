import type { Language } from "@/localization/translations";

export type LocalizedDirectoryText = Readonly<Record<Language, string>>;

export type DirectoryVerificationStatus =
  | "verified"
  | "verification-due"
  | "unverified"
  | "synthetic-only";

export type HumanDirectoryVerifier = Readonly<{
  actorId: string;
  displayName: string;
  actorType: "human";
}>;

export type VerificationMetadata = Readonly<{
  source: Readonly<{
    label: LocalizedDirectoryText;
    locator: string;
  }>;
  verifiedAt: string | null;
  verifiedBy: HumanDirectoryVerifier | null;
  status: DirectoryVerificationStatus;
}>;

export type EmergencyServiceCategory = "medical" | "fire-rescue" | "police";

export type EmergencyDirectoryEntry = Readonly<{
  id: string;
  dataOrigin: "production" | "synthetic-fixture";
  serviceName: LocalizedDirectoryText;
  officialServiceName: string;
  category: EmergencyServiceCategory;
  phoneNumber: string | null;
  address: LocalizedDirectoryText | null;
  geographicCoverage: LocalizedDirectoryText;
  verification: VerificationMetadata;
}>;

export type CareFacilityCategory = "hospital" | "clinic";

export type CareFacilityEntry = Readonly<{
  id: string;
  dataOrigin: "production" | "synthetic-fixture";
  facilityName: LocalizedDirectoryText;
  category: CareFacilityCategory;
  geographicCoverage: LocalizedDirectoryText;
  address: LocalizedDirectoryText | null;
  phoneNumber: string | null;
  verification: VerificationMetadata;
}>;

export type DirectorySnapshot = Readonly<{
  region: "Douala";
  datasetVersion: string;
  isSynthetic: boolean;
  emergencyServices: readonly EmergencyDirectoryEntry[];
  careFacilities: readonly CareFacilityEntry[];
}>;
