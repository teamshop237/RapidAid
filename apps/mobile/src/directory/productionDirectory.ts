import productionDirectoryDocument from "../../content/directory/production-directory.json";
import type { DirectorySnapshot } from "./types";
import { validateProductionDirectoryDocument } from "./validation";

const validation = validateProductionDirectoryDocument(productionDirectoryDocument);

// CI and release builds reject invalid input through validate:directory. This
// runtime fallback is an additional fail-closed boundary if invalid data is
// somehow loaded without that required check.
export const productionDirectoryValidationErrors = validation.ok ? [] : validation.errors;

export const productionDirectory: DirectorySnapshot = validation.ok
  ? validation.snapshot
  : {
      region: "Douala",
      datasetVersion: "invalid-production-directory-rejected",
      isSynthetic: false,
      emergencyServices: [],
      careFacilities: [],
    };
