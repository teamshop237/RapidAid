import type { DirectorySnapshot } from "./types";

// Production records remain empty until each entry is supplied and verified by
// an authorized human. Development fixtures live in a separate module.
export const productionDirectory: DirectorySnapshot = {
  region: "Douala",
  datasetVersion: "awaiting-human-verification",
  isSynthetic: false,
  emergencyServices: [],
  careFacilities: [],
};
