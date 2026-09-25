import { describe, expect, it } from "vitest";

import { isSchemaVersionCompatible } from "../src/compatibility.js";
import { protocolPackageSchema, protocolSchema } from "../src/schema.js";
import { validateProtocolForProduction } from "../src/validation.js";
import { makeApprovedSyntheticProtocol, makeReleasedSyntheticPackage, syntheticNow } from "./fixtures.js";

describe("protocol schema and production gates", () => {
  it("accepts a complete synthetic protocol with stable IDs and versions", () => {
    expect(protocolSchema.safeParse(makeApprovedSyntheticProtocol()).success).toBe(true);
  });

  it("rejects incomplete English/French localization", () => {
    const protocol = structuredClone(makeApprovedSyntheticProtocol()) as Record<string, unknown>;
    const title = protocol.title as Record<string, unknown>;
    delete title.fr;

    expect(protocolSchema.safeParse(protocol).success).toBe(false);
  });

  it("does not allow AI metadata to claim clinical or release approval", () => {
    const protocol = structuredClone(makeApprovedSyntheticProtocol()) as Record<string, unknown>;
    (protocol.clinicalApproval as Record<string, unknown>).authorityType = "ai-assistant";
    (protocol.releaseApproval as Record<string, unknown>).approvedByHuman = false;

    expect(protocolSchema.safeParse(protocol).success).toBe(false);
  });

  it("keeps draft content valid for editing but not production-ready", () => {
    const protocol = structuredClone(makeApprovedSyntheticProtocol()) as Record<string, unknown>;
    protocol.publicationState = "draft";
    delete protocol.clinicalApproval;
    delete protocol.technicalValidation;
    delete protocol.releaseApproval;

    expect(protocolSchema.safeParse(protocol).success).toBe(true);
    const readiness = validateProtocolForProduction(protocol, syntheticNow);
    expect(readiness.ready).toBe(false);
    if (!readiness.ready) expect(readiness.issues.map((issue) => issue.code)).toContain("unapproved");
  });

  it("keeps reviewed content valid for editing but not production-ready", () => {
    const protocol = structuredClone(makeApprovedSyntheticProtocol());
    protocol.publicationState = "reviewed";
    delete protocol.clinicalApproval;
    delete protocol.technicalValidation;
    delete protocol.releaseApproval;

    expect(protocolSchema.safeParse(protocol).success).toBe(true);
    const readiness = validateProtocolForProduction(protocol, syntheticNow);
    expect(readiness.ready).toBe(false);
    if (!readiness.ready) expect(readiness.issues.map((issue) => issue.code)).toContain("unapproved");
  });

  it("does not allow technical validation and release approval to substitute for clinical approval", () => {
    const protocol = structuredClone(makeApprovedSyntheticProtocol());
    delete protocol.clinicalApproval;

    const readiness = validateProtocolForProduction(protocol, syntheticNow);
    expect(readiness.ready).toBe(false);
    if (!readiness.ready) expect(readiness.issues.map((issue) => issue.code)).toContain("invalid");
  });

  it("rejects approvals bound to a different content version", () => {
    const protocol = structuredClone(makeApprovedSyntheticProtocol());
    protocol.clinicalApproval!.contentVersion = "2.0.0";

    const readiness = validateProtocolForProduction(protocol, syntheticNow);
    expect(readiness.ready).toBe(false);
    if (!readiness.ready) expect(readiness.issues.map((issue) => issue.code)).toContain("approval-mismatch");
  });

  it("requires every review and approval gate to bind to the same content checksum", () => {
    const protocol = structuredClone(makeApprovedSyntheticProtocol());
    protocol.technicalValidation!.contentChecksum = `sha256:${"1".repeat(64)}`;

    const readiness = validateProtocolForProduction(protocol, syntheticNow);
    expect(readiness.ready).toBe(false);
    if (!readiness.ready) expect(readiness.issues.map((issue) => issue.code)).toContain("content-binding");
  });

  it("requires a completed review and ordered human release chain", () => {
    const protocol = structuredClone(makeApprovedSyntheticProtocol());
    protocol.technicalValidation!.validatedAt = "2025-10-01T00:00:00.000Z";

    const readiness = validateProtocolForProduction(protocol, syntheticNow);
    expect(readiness.ready).toBe(false);
    if (!readiness.ready) expect(readiness.issues.map((issue) => issue.code)).toContain("approval-order");

    protocol.clinicalReviews[0]!.decision = "changes-requested";
    expect(protocolSchema.safeParse(protocol).success).toBe(false);
  });

  it("matches the package index exactly to included protocol versions", () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.manifest.protocolIndex[0]!.contentVersion = "9.9.9";

    expect(protocolPackageSchema.safeParse(protocolPackage).success).toBe(false);
  });

  it("rejects invalid package date ordering", () => {
    const protocolPackage = structuredClone(makeReleasedSyntheticPackage());
    protocolPackage.manifest.reviewDueAt = "2025-01-01T00:00:00.000Z";

    expect(protocolPackageSchema.safeParse(protocolPackage).success).toBe(false);
  });
});

describe("schema compatibility", () => {
  it("accepts the supported version and rejects future or malformed versions", () => {
    expect(isSchemaVersionCompatible("1.0.7")).toBe(true);
    expect(isSchemaVersionCompatible("1.1.0")).toBe(false);
    expect(isSchemaVersionCompatible("2.0.0")).toBe(false);
    expect(isSchemaVersionCompatible("latest")).toBe(false);
  });
});
