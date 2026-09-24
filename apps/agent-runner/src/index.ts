import { resolve } from "node:path";
import { run } from "@openai/agents";
import { createDeveloperAgent } from "./developer-agent.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const branchArgument = args.find((arg) => arg.startsWith("--write-branch="));
  const writeBranch = branchArgument?.slice("--write-branch=".length);
  const prompt = args.filter((arg) => arg !== branchArgument).join(" ").trim();
  if (!prompt) throw new Error("Provide an inspection or approved branch-write prompt.");
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required to run the agent.");

  const projectRoot = resolve(import.meta.dirname, "../../..");
  const result = await run(createDeveloperAgent(projectRoot, { writeBranch }), prompt);
  console.log(result.finalOutput);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
