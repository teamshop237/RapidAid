import { describe, expect, it } from "vitest";

import * as mobileApi from "../src/index.js";

describe("mobile-safe public API", () => {
  it("exposes verified repository loading without authoring or approval primitives", () => {
    const exportedNames = Object.keys(mobileApi);

    expect(exportedNames).toContain("ValidatedOfflineProtocolRepository");
    expect(exportedNames).not.toContain("InMemoryOfflineProtocolPackageStore");
    expect(exportedNames).not.toContain("protocolSchema");
    expect(exportedNames).not.toContain("validateProtocolForProduction");
    expect(exportedNames.some((name) => /approve|publish|sign/i.test(name))).toBe(false);
  });
});
