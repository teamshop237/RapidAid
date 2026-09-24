import { describe, expect, it } from "vitest";
import { AGENT_POLICY, BRANCH_WRITE_POLICY } from "../src/policy.js";

describe("Developer Agent policy", () => {
  it("permits only approval-gated branch writing and cannot publish medical content", () => {
    expect(AGENT_POLICY.phase).toBe("approval-gated-branch-write");
    expect(BRANCH_WRITE_POLICY.requiresSdkApproval).toBe(true);
    expect(BRANCH_WRITE_POLICY.branchPrefix).toBe("agent/");
    expect(AGENT_POLICY.prohibitedActions).toContain("production_access");
    expect(AGENT_POLICY.prohibitedActions).toContain("medical_content_publication");
  });
});
