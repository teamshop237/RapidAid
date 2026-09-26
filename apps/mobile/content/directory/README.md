# Douala directory import

RapidAid bundles one production directory file: `production-directory.json`. It is available offline in release builds. Development fixtures are separate and cannot be imported into a release by this validator.

## Supplying records

1. Copy the structure from `examples/directory-template.synthetic.json`, but do not copy its values.
2. Enter human-researched official emergency-service records in `production-directory.json` under `emergencyServices`.
3. Keep a candidate record `unverified` with `verifiedAt` and `verifiedBy` set to `null` until a human checks every field against the cited authoritative source.
4. After that check, set `status` to `verified`, add the UTC verification timestamp, and identify the human verifier. A verified emergency service requires a phone number.
5. Increment `datasetVersion` for every reviewed dataset change.
6. Run `pnpm --filter @rapidaid/mobile validate:directory` from the repository root. A mobile check or Android export runs the same validation automatically.

The synthetic example deliberately fails production validation. This prevents placeholder names, IDs, claims, and `example.invalid` sources from being mistaken for verified records.

## Required shape

- Bilingual fields are objects with non-empty `en` and `fr` values.
- Emergency categories: `medical`, `fire-rescue`, `police`.
- Verification statuses: `unverified`, `verified`, `verification-due`.
- `source.locator` must be a non-placeholder HTTPS link to the authoritative source used by the reviewer.
- `verifiedBy.actorType` must be `human`. AI and service actors are rejected.
- `verifiedAt` must be a UTC ISO-8601 timestamp such as `2026-09-26T12:00:00Z`.
- Stable IDs use lowercase letters/numbers separated by dots or hyphens and must never be reused for another organization.

The validator rejects unknown fields, duplicate IDs, incomplete bilingual content, malformed phone numbers, placeholder sources, synthetic markers, missing human verification evidence, and invalid status combinations. An invalid production file fails checks/exports and also loads as an empty directory at runtime.

Hospitals, clinics, SMS, WhatsApp, and automatic dispatch/location integrations are deferred beyond RapidAid v0.1 and are not accepted by this import format.
