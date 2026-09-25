import { describe, expect, it } from "vitest";

import { canonicalizeJson, canonicalizeProtocolContent } from "../src/integrity.js";
import { makeApprovedSyntheticProtocol } from "./fixtures.js";

describe("canonical integrity payloads", () => {
  it("canonicalizes object keys deterministically regardless of insertion order", () => {
    const first = { z: 3, nested: { b: true, a: "alpha" }, a: [2, 1] };
    const second = { a: [2, 1], nested: { a: "alpha", b: true }, z: 3 };
    const expected = '{"a":[2,1],"nested":{"a":"alpha","b":true},"z":3}';

    expect(canonicalizeJson(first)).toBe(expected);
    expect(canonicalizeJson(second)).toBe(expected);
  });

  it("excludes mutable governance metadata but binds both localized content variants", () => {
    const protocol = makeApprovedSyntheticProtocol();
    const originalPayload = canonicalizeProtocolContent(protocol);
    const governanceChange = structuredClone(protocol);
    governanceChange.clinicalApproval!.approverDisplayName = "Another Synthetic Approver";

    expect(canonicalizeProtocolContent(governanceChange)).toBe(originalPayload);

    const englishChange = structuredClone(protocol);
    englishChange.summary.en = "SYNTHETIC ENGLISH CHANGE — NOT FOR USE";
    expect(canonicalizeProtocolContent(englishChange)).not.toBe(originalPayload);

    const frenchChange = structuredClone(protocol);
    frenchChange.summary.fr = "MODIFICATION SYNTHÉTIQUE — NE PAS UTILISER";
    expect(canonicalizeProtocolContent(frenchChange)).not.toBe(originalPayload);
  });
});
