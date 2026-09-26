import type { WorkflowState } from "@rapidaid/content-workflow";

import { stateLabels } from "@/lib/format";

export function StatusBadge({ state }: { state: WorkflowState }) {
  return <span className={`status status-${state}`}>{stateLabels[state]}</span>;
}
