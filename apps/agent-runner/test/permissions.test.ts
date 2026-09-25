import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { mkdtemp, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { createDeveloperAgent } from "../src/developer-agent.js";
import * as projectTools from "../src/tools/project-tools.js";

const projectRoot = resolve(import.meta.dirname, "../../..");
const execFileAsync = promisify(execFile);

describe("Developer Agent permission boundary", () => {
  it("allows reading a small, allowlisted project file", async () => {
    await expect(projectTools.readProjectFile(projectRoot, "README.md")).resolves.toContain("RapidAid");
  });

  it("allows searching the allowlisted project surface", async () => {
    await expect(projectTools.searchProjectFiles(projectRoot, "local-first")).resolves.toContain("README.md");
  });

  it("allows Git inspection without modifying global Git configuration", async () => {
    await expect(projectTools.gitStatus(projectRoot)).resolves.toBeTypeOf("string");
    await expect(projectTools.gitDiff(projectRoot)).resolves.toBeTypeOf("string");
  });

  it("inspects lockfile-sized diffs above the former output limit", async () => {
    const repository = await mkdtemp(join(tmpdir(), "rapidaid-large-diff-"));
    const lockfile = resolve(repository, "pnpm-lock.yaml");
    const makeLockfile = (version: string) => Array.from(
      { length: 12_000 },
      (_, index) => `  synthetic-package-${index}: ${version}`
    ).join("\n");

    try {
      await execFileAsync("git", ["init"], { cwd: repository, windowsHide: true });
      await writeFile(lockfile, makeLockfile("0.0.0"), "utf8");
      await execFileAsync("git", ["add", "pnpm-lock.yaml"], { cwd: repository, windowsHide: true });
      await execFileAsync(
        "git",
        ["-c", "user.name=RapidAid Test", "-c", "user.email=test@invalid.example", "commit", "-m", "fixture"],
        { cwd: repository, windowsHide: true }
      );
      await writeFile(lockfile, makeLockfile("9.9.9"), "utf8");

      const diff = await projectTools.gitDiff(repository);

      expect(Buffer.byteLength(diff, "utf8")).toBeGreaterThan(200_000);
      expect(diff).toContain("pnpm-lock.yaml");
    } finally {
      await rm(repository, { recursive: true, force: true });
    }
  });

  it.each([
    ["../outside.txt", "path traversal"],
    [".env", "environment secrets"],
    ["content/README.md", "controlled medical-content area"],
    ["production/config.json", "production area"]
  ])("denies %s (%s)", async (path) => {
    await expect(projectTools.readProjectFile(projectRoot, path)).rejects.toThrow("read-only project boundary");
  });

  it("exports one controlled write primitive and no deploy, database, or network tool", () => {
    const exposedTools = Object.keys(projectTools).sort();
    expect(exposedTools).toEqual([
      "gitDiff",
      "gitStatus",
      "readProjectFile",
      "runProjectCheck",
      "searchProjectFiles",
      "writeProjectFile"
    ]);
    expect(exposedTools.join(" ")).not.toMatch(/edit|delete|deploy|database|network/i);
  });

  it("registers only the audited read-only tools with the SDK agent", () => {
    const toolNames = createDeveloperAgent(projectRoot).tools.map((tool) => tool.name).sort();
    expect(toolNames).toEqual([
      "git_diff",
      "git_status",
      "read_project_file",
      "run_project_check",
      "search_project_files"
    ]);
  });

  it("registers a write tool only for an approved agent branch and marks it for approval", () => {
    const writeAgent = createDeveloperAgent(projectRoot, { writeBranch: "agent/permission-test" });
    const writeTool = writeAgent.tools.find((tool) => tool.name === "write_project_file") as unknown as {
      needsApproval: (context: unknown, arguments_: unknown, callId: string) => Promise<boolean>;
    };
    return expect(writeTool.needsApproval(undefined, { path: "docs/example.md", contents: "example" }, "test-call"))
      .resolves.toBe(true);
  });

  it("denies a write when the current branch is not the approved agent branch", async () => {
    await expect(
      projectTools.writeProjectFile(projectRoot, "agent/permission-test", "apps/mobile/not-created.ts", "export {};\n")
    ).rejects.toThrow("Current Git branch does not match the approved write branch");
  });

  it("denies controlled medical-content writes before any branch check", async () => {
    await expect(
      projectTools.writeProjectFile(projectRoot, "agent/permission-test", "content/unsafe.md", "not allowed\n")
    ).rejects.toThrow("read-only project boundary");
  });

  it("denies changes to the agent's own runner before any branch check", async () => {
    await expect(
      projectTools.writeProjectFile(
        projectRoot,
        "agent/permission-test",
        "apps/agent-runner/package.json",
        '{"scripts":{"check":"arbitrary command"}}\n'
      )
    ).rejects.toThrow("cannot modify its own runner or permission boundary");
  });

  it("denies reads and writes that escape through a linked directory", async () => {
    const outsideDirectory = await mkdtemp(join(tmpdir(), "rapidaid-agent-boundary-"));
    const linkedDirectory = resolve(projectRoot, "apps/mobile/permission-boundary-link");
    await writeFile(resolve(outsideDirectory, "secret.txt"), "outside project boundary\n", "utf8");
    await symlink(outsideDirectory, linkedDirectory, process.platform === "win32" ? "junction" : "dir");

    try {
      await expect(
        projectTools.readProjectFile(projectRoot, "apps/mobile/permission-boundary-link/secret.txt")
      ).rejects.toThrow("resolves outside the approved project boundary");
      await expect(
        projectTools.writeProjectFile(
          projectRoot,
          "agent/permission-test",
          "apps/mobile/permission-boundary-link/created.ts",
          "export {};\n"
        )
      ).rejects.toThrow("resolves outside the approved project boundary");
    } finally {
      await unlink(linkedDirectory);
      await rm(outsideDirectory, { recursive: true, force: true });
    }
  });
});
