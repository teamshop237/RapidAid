import type { WorkflowRole, WorkflowState } from "@rapidaid/content-workflow";

export const stateLabels: Record<WorkflowState, string> = {
  draft: "Draft",
  "in-clinical-review": "In clinical review",
  "clinically-reviewed": "Clinically reviewed",
  "clinically-approved": "Clinically approved",
  "technically-validated": "Technically validated",
  "release-approved": "Release approved",
};

export const roleLabels: Record<WorkflowRole, string> = {
  "content-editor": "Content Editor",
  "clinical-reviewer": "Clinical Reviewer",
  "release-manager": "Release Manager",
  administrator: "Administrator",
};

export function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}
