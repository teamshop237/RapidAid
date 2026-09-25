import { describe, expect, it } from "vitest";

import { makeReleasedSyntheticPackage } from "./fixtures.js";

describe("synthetic fixture safety boundary", () => {
  it("labels every content-bearing field as synthetic and non-production", () => {
    const serialized = JSON.stringify(makeReleasedSyntheticPackage()).toUpperCase();

    expect(serialized).toContain("SYNTHETIC");
    expect(serialized).toContain("NOT MEDICAL GUIDANCE");
    expect(serialized).toContain("NOT FOR USE");
    expect(serialized).toContain("EXAMPLE.INVALID");
  });
});
