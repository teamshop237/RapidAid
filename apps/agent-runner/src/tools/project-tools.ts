import { execFile } from "node:child_process";
import { readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MAX_FILE_BYTES = 100_000;
const MAX_GIT_OUTPUT_BYTES = 8 * 1024 * 1024;
const DENIED_SEGMENTS = new Set([
  ".git",
  ".pnpm-store",
  ".turbo",
  "coverage",
  "node_modules",
  "content",
  "secrets",
  "production"
]);
const WRITABLE_ROOTS = new Set(["apps", "packages", "docs"]);
const PROTECTED_WRITE_PATHS = new Set(["apps/agent-runner"]);

function pathSegments(relativePath: string): string[] {
  return relativePath.split(sep).filter(Boolean);
}

function isOutsideRoot(relativePath: string): boolean {
  return relativePath === "" || relativePath === ".." || relativePath.startsWith(`..${sep}`);
}

function assertProjectPath(projectRoot: string, requestedPath: string): string {
  const root = resolve(projectRoot);
  const target = resolve(root, requestedPath);
  const pathWithinRoot = relative(root, target);
  const segments = pathSegments(pathWithinRoot);
  const unsafe = isOutsideRoot(pathWithinRoot) || segments.some(
    (segment) => DENIED_SEGMENTS.has(segment) || segment.startsWith(".env")
  );
  if (unsafe) throw new Error("Requested path is outside the read-only project boundary.");
  return target;
}

async function assertCanonicalProjectPath(projectRoot: string, target: string): Promise<string> {
  const canonicalRoot = await realpath(resolve(projectRoot));
  let canonicalTarget: string;
  try {
    canonicalTarget = await realpath(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    canonicalTarget = resolve(await realpath(dirname(target)), basename(target));
  }

  const canonicalRelativePath = relative(canonicalRoot, canonicalTarget);
  const canonicalSegments = pathSegments(canonicalRelativePath);
  const unsafe = isOutsideRoot(canonicalRelativePath) || canonicalSegments.some(
    (segment) => DENIED_SEGMENTS.has(segment) || segment.startsWith(".env")
  );
  if (unsafe) throw new Error("Requested path resolves outside the approved project boundary.");
  return canonicalTarget;
}

export async function readProjectFile(projectRoot: string, requestedPath: string): Promise<string> {
  const target = assertProjectPath(projectRoot, requestedPath);
  const canonicalTarget = await assertCanonicalProjectPath(projectRoot, target);
  const metadata = await stat(canonicalTarget);
  if (!metadata.isFile() || metadata.size > MAX_FILE_BYTES) {
    throw new Error("Only project files below 100 KB may be read by this agent.");
  }
  return readFile(canonicalTarget, "utf8");
}

async function collectFiles(directory: string, root: string, results: string[]): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || DENIED_SEGMENTS.has(entry.name) || entry.name.startsWith(".env")) continue;
    const target = resolve(directory, entry.name);
    if (entry.isDirectory()) await collectFiles(target, root, results);
    else if (entry.isFile()) results.push(relative(root, target));
  }
}

export async function searchProjectFiles(projectRoot: string, query: string): Promise<string[]> {
  if (query.trim().length < 2 || query.length > 100) throw new Error("Search query must be 2-100 characters.");
  const files: string[] = [];
  await collectFiles(projectRoot, projectRoot, files);
  const results: string[] = [];
  for (const file of files.slice(0, 500)) {
    try {
      if ((await readProjectFile(projectRoot, file)).toLowerCase().includes(query.toLowerCase())) results.push(file);
    } catch { /* Skip unreadable or oversized files. */ }
  }
  return results.slice(0, 50);
}

export async function gitStatus(projectRoot: string): Promise<string> {
  const { stdout } = await execFileAsync(
    "git",
    ["-c", `safe.directory=${resolve(projectRoot)}`, "status", "--short"],
    { cwd: projectRoot, windowsHide: true, maxBuffer: MAX_GIT_OUTPUT_BYTES }
  );
  return stdout || "Working tree clean.";
}

export async function gitDiff(projectRoot: string): Promise<string> {
  const { stdout } = await execFileAsync(
    "git",
    ["-c", `safe.directory=${resolve(projectRoot)}`, "diff", "--", "."],
    { cwd: projectRoot, windowsHide: true, maxBuffer: MAX_GIT_OUTPUT_BYTES }
  );
  return stdout || "No unstaged diff.";
}

async function getCurrentBranch(projectRoot: string): Promise<string> {
  const { stdout } = await execFileAsync(
    "git",
    ["-c", `safe.directory=${resolve(projectRoot)}`, "branch", "--show-current"],
    { cwd: projectRoot, windowsHide: true }
  );
  return stdout.trim();
}

async function assertWritableProjectPath(projectRoot: string, requestedPath: string): Promise<string> {
  const target = assertProjectPath(projectRoot, requestedPath);
  const canonicalTarget = await assertCanonicalProjectPath(projectRoot, target);
  const canonicalRelativePath = relative(await realpath(resolve(projectRoot)), canonicalTarget);
  const normalizedRelativePath = canonicalRelativePath.split(sep).join("/");
  const firstSegment = pathSegments(canonicalRelativePath)[0];
  if (!firstSegment || !WRITABLE_ROOTS.has(firstSegment)) {
    throw new Error("This agent may write only inside approved application, package, or documentation paths.");
  }
  if ([...PROTECTED_WRITE_PATHS].some(
    (protectedPath) => normalizedRelativePath === protectedPath || normalizedRelativePath.startsWith(`${protectedPath}/`)
  )) {
    throw new Error("The Developer Agent cannot modify its own runner or permission boundary.");
  }
  return canonicalTarget;
}

export async function writeProjectFile(
  projectRoot: string,
  approvedBranch: string,
  requestedPath: string,
  contents: string
): Promise<string> {
  const target = await assertWritableProjectPath(projectRoot, requestedPath);
  if (!/^agent\/[a-z0-9][a-z0-9/-]*$/i.test(approvedBranch)) {
    throw new Error("Writing requires an approved agent/* branch.");
  }
  if (await getCurrentBranch(projectRoot) !== approvedBranch) {
    throw new Error("Current Git branch does not match the approved write branch.");
  }
  if (Buffer.byteLength(contents, "utf8") > MAX_FILE_BYTES) {
    throw new Error("Agent writes are limited to 100 KB per file.");
  }

  await writeFile(target, contents, "utf8");
  await execFileAsync(
    "git",
    ["-c", `safe.directory=${resolve(projectRoot)}`, "add", "-N", "--", requestedPath],
    { cwd: projectRoot, windowsHide: true }
  );
  const { stdout } = await execFileAsync(
    "git",
    ["-c", `safe.directory=${resolve(projectRoot)}`, "diff", "--", requestedPath],
    { cwd: projectRoot, windowsHide: true, maxBuffer: MAX_GIT_OUTPUT_BYTES }
  );
  return stdout || "No diff produced.";
}

export async function runProjectCheck(projectRoot: string): Promise<string> {
  const { stdout, stderr } = await execFileAsync("pnpm", ["--filter", "@rapidaid/agent-runner", "check"], {
    cwd: projectRoot, windowsHide: true, timeout: 60_000, maxBuffer: 200_000
  });
  return `${stdout}${stderr}`.trim() || "Check passed.";
}
