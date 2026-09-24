# RapidAid

RapidAid is a local-first Android emergency first-aid application for a controlled
pilot in Douala and Yaounde, Cameroon. It provides only clinician-reviewed,
versioned emergency guidance and hands emergency calls to the device's system dialer.

## Current phase

This repository contains the engineering foundation only: project documentation,
CI/security guardrails, and a restricted, read-only Developer Agent scaffold.
It intentionally contains no medical protocols, emergency phone numbers, mobile UI,
or production infrastructure.

## Safety boundaries

- AI never generates, approves, publishes, or delivers point-of-care medical advice.
- No end-user accounts or contact syncing are in the MVP.
- The future emergency flow must function without internet connectivity.
- The MVP uses visible, user-confirmed system-dialer handoff only.
- No agent may deploy, access production data, publish content, or bypass review.

Read [docs/PROJECT.md](docs/PROJECT.md), [docs/SECURITY.md](docs/SECURITY.md), and
[docs/AGENTS.md](docs/AGENTS.md) before contributing.
