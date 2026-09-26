import syntheticTemplate from "../content/directory/examples/directory-template.synthetic.json";
import { canOpenSystemDialer } from "@/directory/catalog";
import { validateProductionDirectoryDocument } from "@/directory/validation";

function createVerifiedFixtureDocument(): Record<string, unknown> {
  return {
    schemaVersion: "1.0.0",
    datasetVersion: "fixture-only-2026-09-26",
    region: "Douala",
    emergencyServices: [
      {
        id: "service.fixture-only.alpha",
        serviceName: { en: "Fixture-only emergency service Alpha", fr: "Service d’urgence de test Alpha" },
        category: "medical",
        phoneNumber: "+000 000 000",
        address: { en: "Fixture-only service point", fr: "Point de service de test" },
        geographicCoverage: { en: "Fixture-only coverage", fr: "Zone de couverture de test" },
        verification: {
          status: "verified",
          source: {
            label: { en: "Fixture-only authoritative source", fr: "Source officielle de test" },
            locator: "https://authoritative-source.fixture/directory",
          },
          verifiedAt: "2026-09-26T12:00:00Z",
          verifiedBy: { actorId: "human.fixture.reviewer", displayName: "Fixture Human Reviewer", actorType: "human" },
        },
      },
    ],
    careFacilities: [
      {
        id: "facility.fixture-only.alpha",
        facilityName: { en: "Fixture-only Hospital Alpha", fr: "Hôpital de test Alpha" },
        category: "hospital",
        phoneNumber: null,
        address: { en: "Fixture-only facility address", fr: "Adresse d’établissement de test" },
        geographicCoverage: { en: "Fixture-only coverage", fr: "Zone de couverture de test" },
        verification: {
          status: "verified",
          source: {
            label: { en: "Fixture-only authoritative source", fr: "Source officielle de test" },
            locator: "https://authoritative-source.fixture/facility",
          },
          verifiedAt: "2026-09-26T12:00:00Z",
          verifiedBy: { actorId: "human.fixture.reviewer", displayName: "Fixture Human Reviewer", actorType: "human" },
        },
      },
    ],
  };
}

function errorsFor(document: unknown): readonly string[] {
  const result = validateProductionDirectoryDocument(document);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.errors;
}

describe("Douala production directory validation", () => {
  it("accepts a complete bilingual, human-verified fixture and marks it as production data", () => {
    const result = validateProductionDirectoryDocument(createVerifiedFixtureDocument());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.isSynthetic).toBe(false);
    expect(result.snapshot.emergencyServices[0]?.dataOrigin).toBe("production");
    expect(result.snapshot.emergencyServices[0]?.verification.verifiedBy?.actorType).toBe("human");
    expect(canOpenSystemDialer(result.snapshot.emergencyServices[0]!)).toBe(true);
  });

  it("rejects the synthetic template if it is copied into the production input", () => {
    const errors = errorsFor(syntheticTemplate);

    expect(errors.some((error) => error.includes("development-only marker"))).toBe(true);
    expect(errors.some((error) => error.includes("non-placeholder HTTPS"))).toBe(true);
  });

  it("rejects verified records without a human verifier", () => {
    const document = createVerifiedFixtureDocument();
    const service = (document.emergencyServices as Record<string, unknown>[])[0]!;
    const verification = service.verification as Record<string, unknown>;
    verification.verifiedBy = null;

    expect(errorsFor(document).some((error) => error.includes("verifiedBy"))).toBe(true);
  });

  it("rejects AI or service actors attempting verification", () => {
    const document = createVerifiedFixtureDocument();
    const service = (document.emergencyServices as Record<string, unknown>[])[0]!;
    const verification = service.verification as Record<string, unknown>;
    verification.verifiedBy = { actorId: "agent.fixture", displayName: "Fixture Agent", actorType: "ai-agent" };

    expect(errorsFor(document).some((error) => error.includes("agents and services cannot verify"))).toBe(true);
  });

  it("rejects missing bilingual content", () => {
    const document = createVerifiedFixtureDocument();
    const service = (document.emergencyServices as Record<string, unknown>[])[0]!;
    service.serviceName = { en: "Fixture-only emergency service Alpha" };

    const errors = errorsFor(document);
    expect(errors.some((error) => error.includes("serviceName.fr is required"))).toBe(true);
  });

  it("rejects duplicate stable IDs", () => {
    const document = createVerifiedFixtureDocument();
    const service = (document.emergencyServices as Record<string, unknown>[])[0]!;
    const facility = (document.careFacilities as Record<string, unknown>[])[0]!;
    facility.id = service.id;

    const errors = errorsFor(document);
    expect(errors.some((error) => error.includes("duplicate ID"))).toBe(true);
  });

  it("accepts sourced candidates as unverified but never makes them callable", () => {
    const document = createVerifiedFixtureDocument();
    const service = (document.emergencyServices as Record<string, unknown>[])[0]!;
    const verification = service.verification as Record<string, unknown>;
    verification.status = "unverified";
    verification.verifiedAt = null;
    verification.verifiedBy = null;
    const result = validateProductionDirectoryDocument(document);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(canOpenSystemDialer(result.snapshot.emergencyServices[0]!)).toBe(false);
  });

  it("keeps verification-due emergency records non-callable", () => {
    const document = createVerifiedFixtureDocument();
    const service = (document.emergencyServices as Record<string, unknown>[])[0]!;
    const verification = service.verification as Record<string, unknown>;
    verification.status = "verification-due";
    const result = validateProductionDirectoryDocument(document);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(canOpenSystemDialer(result.snapshot.emergencyServices[0]!)).toBe(false);
  });

  it("rejects a verified emergency service without a callable number", () => {
    const document = createVerifiedFixtureDocument();
    const service = (document.emergencyServices as Record<string, unknown>[])[0]!;
    service.phoneNumber = null;

    expect(errorsFor(document).some((error) => error.includes("phoneNumber is required"))).toBe(true);
  });
});
