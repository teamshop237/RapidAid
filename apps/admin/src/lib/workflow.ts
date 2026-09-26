import { ContentWorkflowService, InMemoryContentWorkflowStore } from "@rapidaid/content-workflow";
import { makeSyntheticDraftContent, syntheticActors } from "@rapidaid/content-workflow/testing";

type LocalWorkflow = {
  service: ContentWorkflowService;
};

declare global {
  // Development-only process-local persistence. Replaced by a transactional backend later.
  var rapidAidLocalWorkflow: LocalWorkflow | undefined;
}

function createLocalWorkflow(): LocalWorkflow {
  const service = new ContentWorkflowService(new InMemoryContentWorkflowStore());
  service.createDraft(
    syntheticActors.editor,
    "protocol.synthetic.workflow.alpha",
    makeSyntheticDraftContent(),
  );
  return { service };
}

export const localWorkflow = globalThis.rapidAidLocalWorkflow ?? createLocalWorkflow();

if (process.env.NODE_ENV !== "production") {
  globalThis.rapidAidLocalWorkflow = localWorkflow;
}
