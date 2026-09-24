# Security and privacy baseline

## Non-negotiable controls

- TLS in transit; encrypted managed storage at rest; secrets only in Secret Manager.
- Least-privilege administrator roles, MFA, and no direct database access from the dashboard.
- Protected branches, required review, CI checks, dependency monitoring, CodeQL, and secret scanning before pilot distribution.
- Sentry and PostHog must scrub IP/address/location/contact/free-text fields; session replay is disabled.
- Cloud Storage buckets are private; signed access is short-lived and admin-scoped.
- Production data, deployment credentials, and medical-content publication tools are unavailable to AI agents.

## Retention

Exact retention periods need legal and clinical approval before any pilot data is collected.
Until then, store only the minimum aggregate operational data needed for testing.
