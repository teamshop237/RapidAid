import { canOpenSystemDialer } from "@/directory/catalog";
import { syntheticDirectoryFixture } from "@/directory/fixtures/syntheticDirectory";
import { productionDirectory } from "@/directory/productionDirectory";

describe("emergency directory release boundary", () => {
  it("ships no production records before human verification", () => {
    expect(productionDirectory.isSynthetic).toBe(false);
    expect(productionDirectory.emergencyServices).toEqual([]);
    expect(productionDirectory.careFacilities).toEqual([]);
  });

  it("marks every development fixture as synthetic and non-callable", () => {
    expect(syntheticDirectoryFixture.isSynthetic).toBe(true);
    expect(syntheticDirectoryFixture.emergencyServices).not.toHaveLength(0);

    for (const service of syntheticDirectoryFixture.emergencyServices) {
      expect(service.id).toContain(".synthetic.");
      expect(service.dataOrigin).toBe("synthetic-fixture");
      expect(service.phoneNumber).toBeNull();
      expect(service.verification.status).toBe("synthetic-only");
      expect(service.verification.verifiedAt).toBeNull();
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
    }
  });
});
