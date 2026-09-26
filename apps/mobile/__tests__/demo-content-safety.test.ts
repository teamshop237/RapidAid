import {
  demoCareLocations,
  demoEmergencyServices,
} from "@/content/demoContent";
import { bundledSyntheticPackage } from "@/protocols/bundledSyntheticPackage";

describe("demo content safety boundary", () => {
  it("marks every prototype record as demo-only", () => {
    const records = [...demoEmergencyServices, ...demoCareLocations];

    expect(records).not.toHaveLength(0);
    expect(records.every((record) => record.contentStatus === "demo-only")).toBe(true);
  });

  it("contains no dialable emergency number", () => {
    for (const service of demoEmergencyServices) {
      for (const displayNumber of Object.values(service.displayNumber)) {
        expect(displayNumber).toMatch(/D[EÉ]MO/);
        expect(displayNumber).not.toMatch(/\d/);
      }
    }
  });

  it("uses unmistakably synthetic packaged protocol content", () => {
    const serialized = JSON.stringify(bundledSyntheticPackage).toUpperCase();

    expect(serialized).toContain("SYNTHETIC");
    expect(serialized).toContain("NOT MEDICAL GUIDANCE");
    expect(serialized).toContain("DO NOT TAKE ACTION");
    expect(serialized).toContain("EXAMPLE.INVALID");
  });

  it("contains no real address or numeric distance", () => {
    for (const location of demoCareLocations) {
      expect(location.area.en).toContain("no real address");
      expect(location.distance.en).toBe("Mock distance");
      expect(JSON.stringify(location)).not.toMatch(/\d/);
    }
  });
});
