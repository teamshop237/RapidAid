import type { DirectorySnapshot } from "../types";

const syntheticSource = {
  label: {
    en: "Synthetic source — not authoritative",
    fr: "Source synthétique — non officielle",
  },
  locator: "https://example.invalid/rapidaid-directory-fixture",
} as const;

const syntheticVerification = {
  source: syntheticSource,
  verifiedAt: null,
  verifiedBy: null,
  status: "synthetic-only",
} as const;

export const syntheticDirectoryFixture: DirectorySnapshot = {
  region: "Douala",
  datasetVersion: "synthetic-development-only",
  isSynthetic: true,
  emergencyServices: [
    {
      id: "service.synthetic.medical.alpha",
      dataOrigin: "synthetic-fixture",
      serviceName: { en: "Synthetic medical response service", fr: "Service synthétique d’intervention médicale" },
      category: "medical",
      phoneNumber: null,
      address: null,
      geographicCoverage: { en: "Synthetic Douala test zone", fr: "Zone de test synthétique de Douala" },
      verification: syntheticVerification,
    },
    {
      id: "service.synthetic.rescue.bravo",
      dataOrigin: "synthetic-fixture",
      serviceName: { en: "Synthetic fire and rescue service", fr: "Service synthétique d’incendie et de secours" },
      category: "fire-rescue",
      phoneNumber: null,
      address: null,
      geographicCoverage: { en: "Synthetic Douala test zone", fr: "Zone de test synthétique de Douala" },
      verification: syntheticVerification,
    },
  ],
  careFacilities: [
    {
      id: "facility.synthetic.alpha",
      dataOrigin: "synthetic-fixture",
      facilityName: { en: "Synthetic Hospital Alpha", fr: "Hôpital synthétique Alpha" },
      category: "hospital",
      geographicCoverage: { en: "Synthetic Douala test zone", fr: "Zone de test synthétique de Douala" },
      address: null,
      phoneNumber: null,
      verification: syntheticVerification,
    },
    {
      id: "facility.synthetic.bravo",
      dataOrigin: "synthetic-fixture",
      facilityName: { en: "Synthetic Clinic Bravo", fr: "Clinique synthétique Bravo" },
      category: "clinic",
      geographicCoverage: { en: "Synthetic Douala test zone", fr: "Zone de test synthétique de Douala" },
      address: null,
      phoneNumber: null,
      verification: syntheticVerification,
    },
  ],
};
