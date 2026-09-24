# Agent permission test suite

The first Developer Agent is validated by executable tests in
`apps/agent-runner/test/permissions.test.ts`; policy prose is not accepted as proof.

| Attempt | Expected result | Enforcement point |
| --- | --- | --- |
| Read an allowlisted small project file | Allow | path and file-size validation |
| Search allowlisted project text | Allow | recursive allowlist traversal |
| Inspect Git status/diff | Allow | repository-specific, command-scoped Git safe-directory override |
| Read `../outside.txt` | Deny | resolved-path boundary check |
| Read `.env` or `.env.*` | Deny | secret-name boundary check |
| Read `content/*` | Deny | controlled-content boundary check |
| Read `production/*` | Deny | production boundary check |
| Edit/delete files by default | Deny | write tool is absent without an approved branch |
| Write `apps/*`, `packages/*`, or `docs/*` on matching `agent/*` branch | Approval required | SDK `needsApproval`, branch guard, 100 KB cap, and returned Git diff |
| Write on `main`/`develop`, a different branch, or outside allowed roots | Deny | runtime branch and path guard |
| Modify `apps/agent-runner/*` or escape through a linked path | Deny | protected runner and canonical-path guards |
| Deploy, arbitrary network, or database access | Deny | no such tool is exported or registered |

The suite must pass before write tools are considered. Any future write tool must be
implemented separately, branch-scoped, covered by equivalent denial tests, and marked
for SDK human approval before it can execute.
