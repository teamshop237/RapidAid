import { canOpenSystemDialer } from "@/directory/catalog";
import { syntheticDirectoryFixture } from "@/directory/fixtures/syntheticDirectory";
import { productionDirectory, productionDirectoryValidationErrors } from "@/directory/productionDirectory";
import appConfig from "../app.json";

describe("emergency directory release boundary", () => {
  it("ships the human-approved MINAT SAMU record as the only production service", () => {
    expect(productionDirectory.isSynthetic).toBe(false);
    expect(productionDirectoryValidationErrors).toEqual([]);
    expect(productionDirectory.emergencyServices).toHaveLength(1);
    expect(productionDirectory.careFacilities).toEqual([]);

    const samu = productionDirectory.emergencyServices[0]!;
    expect(samu).toMatchObject({
      id: "service.cm.samu.119",
      serviceName: {
        en: "SAMU / Medical Assistance",
        fr: "SAMU / Aide médicale urgente",
      },
      officialServiceName: "Service d'Aide Médicale Urgente (SAMU)",
      category: "medical",
      phoneNumber: "119",
      geographicCoverage: { en: "Cameroon", fr: "Cameroun" },
      verification: {
        status: "verified",
        verifiedAt: "2026-09-26T00:00:00Z",
        verifiedBy: {
          actorId: "project-owner.manual-verification",
          displayName: "RapidAid project owner",
          actorType: "human",
        },
        source: {
          locator: "https://minat.gov.cm/contacts-generaux/",
        },
      },
    });
    expect(canOpenSystemDialer(samu)).toBe(true);
  });

  it("marks every development fixture as synthetic and non-callable", () => {
    expect(syntheticDirectoryFixture.isSynthetic).toBe(true);
    expect(syntheticDirectoryFixture.emergencyServices).not.toHaveLength(0);

    for (const service of syntheticDirectoryFixture.emergencyServices) {
      expect(service.id).toContain(".synthetic.");
      expect(service.dataOrigin).toBe("synthetic-fixture");
      expect(service.phoneNumber).toBeNull();
      expect(service.address).toBeNull();
      expect(service.verification.status).toBe("synthetic-only");
      expect(service.verification.verifiedAt).toBeNull();
      expect(service.verification.verifiedBy).toBeNull();
      expect(service.verification.source.locator).toContain("example.invalid");
      expect(canOpenSystemDialer(service)).toBe(false);
    }
  });

  it("contains no invented facility address, phone number, or verification claim", () => {
    for (const facility of syntheticDirectoryFixture.careFacilities) {
      expect(facility.id).toContain(".synthetic.");
      expect(facility.dataOrigin).toBe("synthetic-fixture");
      expect(facility.address).toBeNull();
      expect(facility.phoneNumber).toBeNull();
      expect(facility.verification.status).toBe("synthetic-only");
      expect(facility.verification.verifiedAt).toBeNull();
      expect(facility.verification.verifiedBy).toBeNull();
    }
  });

  it("does not request Android direct-call permission for a dialer handoff", () => {
    expect(appConfig.expo.android).not.toHaveProperty("permissions");
  });
});
