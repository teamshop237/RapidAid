import {
  demoCareLocations,
  demoEmergencyServices,
  demoGuides,
} from "@/content/demoContent";

describe("demo content safety boundary", () => {
  it("marks every prototype record as demo-only", () => {
    const records = [...demoGuides, ...demoEmergencyServices, ...demoCareLocations];

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

  it("uses generic guide categories instead of medical scenarios", () => {
    for (const guide of demoGuides) {
      expect(guide.id).toMatch(/^(alpha|bravo|charlie)$/);
      expect(guide.title.en).toMatch(/^Demo guide/);
      expect(guide.summary.en).toMatch(/Placeholder/);
    }
  });

  it("contains no real address or numeric distance", () => {
    for (const location of demoCareLocations) {
      expect(location.area.en).toContain("no real address");
      expect(location.distance.en).toBe("Mock distance");
      expect(JSON.stringify(location)).not.toMatch(/\d/);
    }
  });
});
