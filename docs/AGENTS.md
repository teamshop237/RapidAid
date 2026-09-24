# Agent policy

## Scope

Agents are controlled engineering tools and are outside the emergency point-of-care
path. They never receive production emergency data or decide medical actions.

## Current milestone: Developer Agent (approval-gated branch writes)

The agent is read-only by default. It can read allowlisted project files, search
allowlisted source text, report Git status/diff, and invoke its fixed package check.
When the harness names the current human-created `agent/*` branch, it may request a
single-file write inside `apps/*`, `packages/*`, or `docs/*`. Every write pauses for
explicit SDK approval, is capped at 100 KB, and returns the resulting Git diff.

The writer cannot modify `apps/agent-runner`, follow linked paths outside the approved
tree, write controlled medical content, create or merge branches, install dependencies,
access environment variables or the network, access production systems, or execute
arbitrary commands.

The executable boundary checks are defined in `docs/AGENT_PERMISSION_TESTS.md` and
run with the agent package test suite.

## Permanent prohibitions

- Do not generate, approve, or publish medical instructions.
- Do not modify emergency-routing rules or verified directory content.
- Do not access or modify production databases.
- Do not deploy or obtain deployment credentials.
- Do not bypass human review, CI, or approval interruptions.
