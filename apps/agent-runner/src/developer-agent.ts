import { Agent, tool } from "@openai/agents";
import { z } from "zod";
import { AGENT_POLICY, BRANCH_WRITE_POLICY } from "./policy.js";
import { gitDiff, gitStatus, readProjectFile, runProjectCheck, searchProjectFiles, writeProjectFile } from "./tools/project-tools.js";

export function createDeveloperAgent(projectRoot: string, options: { writeBranch?: string } = {}): Agent {
  const writeTools = options.writeBranch ? [tool({
    name: "write_project_file",
    description: "Write one small file only on the pre-approved agent branch. This always pauses for human approval and returns the Git diff.",
    parameters: z.object({ path: z.string().min(1).max(300), contents: z.string().max(100_000) }),
    needsApproval: true,
    execute: ({ path, contents }) => writeProjectFile(projectRoot, options.writeBranch!, path, contents)
  })] : [];

  return new Agent({
    name: "RapidAid Developer Agent",
    model: process.env.RAPIDAID_AGENT_MODEL ?? "gpt-6-sol",
    instructions: `You are the RapidAid Developer Agent. Your normal role is project inspection and reporting.\n\nAllowed read-only tools: ${AGENT_POLICY.allowedTools.join(", ")}.\nProhibited actions: ${AGENT_POLICY.prohibitedActions.join(", ")}.\n\nA write tool exists only when the harness provides an approved ${BRANCH_WRITE_POLICY.branchPrefix} branch. It always requires human approval, can write only in ${BRANCH_WRITE_POLICY.writableRoots.join(", ")}, returns a Git diff, and cannot create or merge branches. Never provide medical instructions, access secrets, or claim a check was run unless the tool returned a result.`,
    tools: [
      tool({ name: "read_project_file", description: "Read an allowlisted small text file inside the project.", parameters: z.object({ path: z.string().min(1).max(300) }), execute: ({ path }) => readProjectFile(projectRoot, path) }),
      tool({ name: "search_project_files", description: "Find allowlisted text files containing a query.", parameters: z.object({ query: z.string().min(2).max(100) }), execute: ({ query }) => searchProjectFiles(projectRoot, query) }),
      tool({ name: "git_status", description: "Report Git working-tree status without changing it.", parameters: z.object({}), execute: () => gitStatus(projectRoot) }),
      tool({ name: "git_diff", description: "Read the unstaged Git diff without changing it.", parameters: z.object({}), execute: () => gitDiff(projectRoot) }),
      tool({ name: "run_project_check", description: "Run the allowlisted static check for this package only.", parameters: z.object({}), execute: () => runProjectCheck(projectRoot) }),
      ...writeTools
    ]
  });
}
