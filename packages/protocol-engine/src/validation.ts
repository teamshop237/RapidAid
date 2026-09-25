import { z } from "zod";

import { isSchemaVersionCompatible } from "./compatibility.js";
import { Protocol, protocolSchema } from "./schema.js";

export type ProtocolReadinessIssueCode =
  | "invalid"
  | "incompatible"
  | "unapproved"
  | "not-effective"
  | "expired"
  | "approval-mismatch"
  | "approval-order"
  | "content-binding";

export type ProtocolReadinessIssue = {
  code: ProtocolReadinessIssueCode;
  message: string;
  path?: string;
};

export type ProtocolReadinessResult =
  | { ready: true; protocol: Protocol; issues: [] }
  | { ready: false; issues: ProtocolReadinessIssue[] };

function zodIssues(error: z.ZodError): ProtocolReadinessIssue[] {
  return error.issues.map((issue) => ({
    code: "invalid",
    message: issue.message,
    path: issue.path.join("."),
  }));
}

function bindingMatches(
  binding: { protocolId: string; contentVersion: string },
  protocol: Protocol,
): boolean {
  return binding.protocolId === protocol.protocolId && binding.contentVersion === protocol.contentVersion;
}

export function validateProtocolForProduction(
  input: unknown,
  now = new Date(),
): ProtocolReadinessResult {
  const parsed = protocolSchema.safeParse(input);
  if (!parsed.success) return { ready: false, issues: zodIssues(parsed.error) };

  const protocol = parsed.data;
  const issues: ProtocolReadinessIssue[] = [];
  if (!isSchemaVersionCompatible(protocol.schemaVersion)) {
    issues.push({ code: "incompatible", message: `Unsupported protocol schema ${protocol.schemaVersion}.` });
  }
  if (protocol.publicationState !== "approved") {
    issues.push({ code: "unapproved", message: `Protocol state ${protocol.publicationState} is not production-ready.` });
  }

  const timestamp = now.getTime();
  if (Date.parse(protocol.effectiveAt) > timestamp) {
    issues.push({ code: "not-effective", message: "Protocol is not effective yet." });
  }
  if (Date.parse(protocol.reviewDueAt) <= timestamp || (protocol.expiresAt && Date.parse(protocol.expiresAt) <= timestamp)) {
    issues.push({ code: "expired", message: "Protocol review or expiration date has passed." });
  }

  for (const approval of [protocol.clinicalApproval, protocol.technicalValidation, protocol.releaseApproval]) {
    if (approval && !bindingMatches(approval, protocol)) {
      issues.push({ code: "approval-mismatch", message: "Approval metadata does not match this protocol version." });
    }
  }
  if (protocol.clinicalReviews.some((review) => !bindingMatches(review, protocol))) {
    issues.push({ code: "approval-mismatch", message: "Clinical review metadata does not match this protocol version." });
  }

  const approvalChecksum = protocol.clinicalApproval?.contentChecksum;
  const contentBindings = [
    ...protocol.clinicalReviews.map((review) => review.contentChecksum),
    protocol.technicalValidation?.contentChecksum,
    protocol.releaseApproval?.contentChecksum,
  ].filter((checksum): checksum is string => checksum !== undefined);
  if (!approvalChecksum || contentBindings.some((checksum) => checksum !== approvalChecksum)) {
    issues.push({ code: "content-binding", message: "Review and approval gates do not bind to one immutable protocol payload." });
  }

  const completedReviews = protocol.clinicalReviews.filter((review) => review.decision === "reviewed");
  const latestReviewAt = Math.max(...completedReviews.map((review) => Date.parse(review.reviewedAt)));
  const clinicalApprovalAt = protocol.clinicalApproval ? Date.parse(protocol.clinicalApproval.approvedAt) : Number.NaN;
  const technicalValidationAt = protocol.technicalValidation ? Date.parse(protocol.technicalValidation.validatedAt) : Number.NaN;
  const releaseApprovalAt = protocol.releaseApproval ? Date.parse(protocol.releaseApproval.approvedAt) : Number.NaN;
  if (completedReviews.length === 0
    || latestReviewAt > clinicalApprovalAt
    || clinicalApprovalAt > technicalValidationAt
    || technicalValidationAt > releaseApprovalAt) {
    issues.push({ code: "approval-order", message: "Review, clinical approval, technical validation, and release approval are out of order." });
  }

  return issues.length === 0
    ? { ready: true, protocol, issues: [] }
    : { ready: false, issues };
}
